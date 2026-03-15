"""
Improved Strategy V2 - Trendlines with Breaks
Addresses weaknesses found in the original strategy:
1. Trend filter (EMA) to avoid counter-trend entries
2. Sideways/chop detection using ADX
3. ATR-based stop loss to cut losers early
4. Trailing stop to lock in profits
5. Short selling support for downtrend breakdowns
6. RSI confirmation to avoid overbought/oversold entries
7. Higher position sizing with proper risk management
"""

import numpy as np
import pandas as pd


def compute_adx(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Average Directional Index - measures trend strength."""
    high = df["High"]
    low = df["Low"]
    close = df["Close"]

    plus_dm = high.diff()
    minus_dm = -low.diff()

    plus_dm = plus_dm.where((plus_dm > minus_dm) & (plus_dm > 0), 0.0)
    minus_dm = minus_dm.where((minus_dm > plus_dm) & (minus_dm > 0), 0.0)

    tr = pd.concat([
        high - low,
        (high - close.shift(1)).abs(),
        (low - close.shift(1)).abs()
    ], axis=1).max(axis=1)

    atr = tr.ewm(span=period, min_periods=period).mean()
    plus_di = 100 * (plus_dm.ewm(span=period, min_periods=period).mean() / atr)
    minus_di = 100 * (minus_dm.ewm(span=period, min_periods=period).mean() / atr)

    dx = 100 * (plus_di - minus_di).abs() / (plus_di + minus_di)
    adx = dx.ewm(span=period, min_periods=period).mean()

    return adx


def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Relative Strength Index."""
    delta = series.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)

    avg_gain = gain.ewm(span=period, min_periods=period).mean()
    avg_loss = loss.ewm(span=period, min_periods=period).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def compute_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Average True Range."""
    tr = pd.concat([
        df["High"] - df["Low"],
        (df["High"] - df["Close"].shift(1)).abs(),
        (df["Low"] - df["Close"].shift(1)).abs()
    ], axis=1).max(axis=1)
    return tr.rolling(period).mean()


def backtest_improved(df: pd.DataFrame, signals: pd.DataFrame,
                      initial_capital: float = 10000.0,
                      position_size_pct: float = 0.25,
                      ema_fast: int = 20,
                      ema_slow: int = 50,
                      adx_period: int = 14,
                      adx_threshold: float = 20.0,
                      rsi_period: int = 14,
                      rsi_ob: float = 70.0,
                      rsi_os: float = 30.0,
                      atr_sl_mult: float = 1.5,
                      trail_atr_mult: float = 2.5,
                      allow_short: bool = True,
                      ) -> dict:
    """
    Improved backtester with all filters applied.

    Filters:
    - EMA crossover for trend direction
    - ADX > threshold for trend strength (avoids sideways)
    - RSI confirmation (not overbought for longs, not oversold for shorts)
    - ATR stop loss + trailing stop

    Returns dict with trades, equity, and summary stats.
    """
    close = df["Close"]

    # Precompute indicators
    ema_f = close.ewm(span=ema_fast, min_periods=ema_fast).mean()
    ema_s = close.ewm(span=ema_slow, min_periods=ema_slow).mean()
    adx = compute_adx(df, adx_period)
    rsi = compute_rsi(close, rsi_period)
    atr = compute_atr(df, 14)

    capital = initial_capital
    position = 0.0
    entry_price = 0.0
    entry_date = None
    direction = 0  # 1=long, -1=short
    trades = []
    equity = []
    stop_loss = 0.0
    trail_high = 0.0
    trail_low = float("inf")
    skipped_reasons = {"trend": 0, "adx": 0, "rsi": 0}

    for i in range(1, len(df)):
        c = close.iloc[i]
        h = df["High"].iloc[i]
        l = df["Low"].iloc[i]
        date = df.index[i]
        curr_atr = atr.iloc[i] if not np.isnan(atr.iloc[i]) else 0

        # --- CHECK STOPS ---
        if position != 0:
            # Long stop loss / trailing
            if direction == 1:
                trail_high = max(trail_high, h)
                trail_stop = trail_high - curr_atr * trail_atr_mult

                hit_sl = l <= stop_loss
                hit_trail = l <= trail_stop and trail_stop > stop_loss

                if hit_sl or hit_trail:
                    exit_price = stop_loss if hit_sl else trail_stop
                    exit_price = max(exit_price, l)  # can't exit below low
                    pnl = position * (exit_price - entry_price)
                    trades.append({
                        "entry_date": entry_date, "exit_date": date,
                        "entry_price": entry_price, "exit_price": exit_price,
                        "shares": position, "pnl": pnl,
                        "direction": "LONG",
                        "exit_reason": "stop_loss" if hit_sl else "trailing_stop",
                    })
                    capital += position * exit_price
                    position = 0.0
                    direction = 0

            # Short stop loss
            elif direction == -1:
                trail_low = min(trail_low, l)
                trail_stop = trail_low + curr_atr * trail_atr_mult

                hit_sl = h >= stop_loss
                hit_trail = h >= trail_stop and trail_stop < stop_loss

                if hit_sl or hit_trail:
                    exit_price = stop_loss if hit_sl else trail_stop
                    exit_price = min(exit_price, h)
                    pnl = abs(position) * (entry_price - exit_price)
                    trades.append({
                        "entry_date": entry_date, "exit_date": date,
                        "entry_price": entry_price, "exit_price": exit_price,
                        "shares": abs(position), "pnl": pnl,
                        "direction": "SHORT",
                        "exit_reason": "stop_loss" if hit_sl else "trailing_stop",
                    })
                    capital += abs(position) * entry_price + pnl
                    position = 0.0
                    direction = 0

        # --- FILTERS ---
        in_uptrend = ema_f.iloc[i] > ema_s.iloc[i] if i >= ema_slow else False
        in_downtrend = ema_f.iloc[i] < ema_s.iloc[i] if i >= ema_slow else False
        is_trending = adx.iloc[i] > adx_threshold if not np.isnan(adx.iloc[i]) else False
        curr_rsi = rsi.iloc[i] if not np.isnan(rsi.iloc[i]) else 50

        # --- LONG ENTRY ---
        if signals["upper_break"].iloc[i] and position == 0:
            if not in_uptrend:
                skipped_reasons["trend"] += 1
            elif not is_trending:
                skipped_reasons["adx"] += 1
            elif curr_rsi > rsi_ob:
                skipped_reasons["rsi"] += 1
            else:
                invest = capital * position_size_pct
                position = invest / c
                entry_price = c
                entry_date = date
                direction = 1
                capital -= invest
                trail_high = h
                stop_loss = c - curr_atr * atr_sl_mult if curr_atr > 0 else 0

        # --- SHORT ENTRY ---
        elif signals["lower_break"].iloc[i] and position == 0 and allow_short:
            if not in_downtrend:
                skipped_reasons["trend"] += 1
            elif not is_trending:
                skipped_reasons["adx"] += 1
            elif curr_rsi < rsi_os:
                skipped_reasons["rsi"] += 1
            else:
                invest = capital * position_size_pct
                shares = invest / c
                position = -shares
                entry_price = c
                entry_date = date
                direction = -1
                trail_low = l
                stop_loss = c + curr_atr * atr_sl_mult if curr_atr > 0 else 999999

        # --- SIGNAL-BASED EXIT ---
        elif signals["lower_break"].iloc[i] and direction == 1:
            pnl = position * (c - entry_price)
            trades.append({
                "entry_date": entry_date, "exit_date": date,
                "entry_price": entry_price, "exit_price": c,
                "shares": position, "pnl": pnl,
                "direction": "LONG", "exit_reason": "signal",
            })
            capital += position * c
            position = 0.0
            direction = 0

        elif signals["upper_break"].iloc[i] and direction == -1:
            pnl = abs(position) * (entry_price - c)
            trades.append({
                "entry_date": entry_date, "exit_date": date,
                "entry_price": entry_price, "exit_price": c,
                "shares": abs(position), "pnl": pnl,
                "direction": "SHORT", "exit_reason": "signal",
            })
            capital += abs(position) * entry_price + pnl
            position = 0.0
            direction = 0

        # --- EQUITY ---
        if direction == 1:
            pv = capital + position * c
        elif direction == -1:
            unrealized = abs(position) * (entry_price - c)
            pv = capital + abs(position) * entry_price + unrealized
        else:
            pv = capital
        equity.append(pv)

    equity_series = pd.Series(equity, index=df.index[1:])

    # Compute stats
    total = len(trades)
    wins = sum(1 for t in trades if t["pnl"] > 0)
    losses = total - wins
    total_pnl = sum(t["pnl"] for t in trades)
    win_rate = wins / total * 100 if total > 0 else 0
    ret = total_pnl / initial_capital * 100

    gross_profit = sum(t["pnl"] for t in trades if t["pnl"] > 0)
    gross_loss = abs(sum(t["pnl"] for t in trades if t["pnl"] <= 0))
    pf = gross_profit / gross_loss if gross_loss > 0 else float("inf") if gross_profit > 0 else 0

    peak = equity_series.cummax()
    max_dd = ((equity_series - peak) / peak * 100).min() if not equity_series.empty else 0

    long_trades = [t for t in trades if t["direction"] == "LONG"]
    short_trades = [t for t in trades if t["direction"] == "SHORT"]
    long_pnl = sum(t["pnl"] for t in long_trades)
    short_pnl = sum(t["pnl"] for t in short_trades)

    return {
        "trades": trades,
        "equity": equity_series,
        "skipped": skipped_reasons,
        "stats": {
            "total_trades": total,
            "wins": wins,
            "losses": losses,
            "win_rate": win_rate,
            "total_pnl": total_pnl,
            "return_pct": ret,
            "max_drawdown": max_dd,
            "profit_factor": pf,
            "final_capital": equity_series.iloc[-1] if not equity_series.empty else initial_capital,
            "long_trades": len(long_trades),
            "long_pnl": long_pnl,
            "short_trades": len(short_trades),
            "short_pnl": short_pnl,
        }
    }


def print_report(result: dict, label: str = ""):
    """Print detailed backtest report."""
    s = result["stats"]
    sk = result["skipped"]

    print(f"\n{'=' * 60}")
    print(f"  {label}")
    print(f"{'=' * 60}")
    print(f"  Total Trades:    {s['total_trades']}  (Long: {s['long_trades']}, Short: {s['short_trades']})")
    print(f"  Win Rate:        {s['win_rate']:.1f}%  ({s['wins']}W / {s['losses']}L)")
    print(f"  Total P&L:       ${s['total_pnl']:,.2f}")
    print(f"  Return:          {s['return_pct']:+.2f}%")
    print(f"  Max Drawdown:    {s['max_drawdown']:.2f}%")
    print(f"  Profit Factor:   {s['profit_factor']:.2f}")
    print(f"  Long P&L:        ${s['long_pnl']:,.2f}")
    print(f"  Short P&L:       ${s['short_pnl']:,.2f}")
    print(f"  Final Capital:   ${s['final_capital']:,.2f}")
    print(f"  Skipped signals: trend={sk['trend']}, adx={sk['adx']}, rsi={sk['rsi']}")

    if result["trades"]:
        print(f"\n  {'#':<3} {'Dir':<6} {'Entry Date':<20} {'Exit Date':<20} "
              f"{'Entry':>10} {'Exit':>10} {'P&L':>10} {'Reason':<15}")
        print(f"  {'-' * 100}")
        for i, t in enumerate(result["trades"], 1):
            tag = "WIN" if t["pnl"] > 0 else "LOSS"
            print(f"  {i:<3} {t['direction']:<6} {str(t['entry_date']):<20} {str(t['exit_date']):<20} "
                  f"${t['entry_price']:>9,.2f} ${t['exit_price']:>9,.2f} "
                  f"${t['pnl']:>9,.2f} {t['exit_reason']:<10} [{tag}]")
