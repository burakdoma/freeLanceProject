"""
BTCUSDT-specific strategy optimizer.
Goal: Win rate >= 25%, starting capital $1000.

BTC problems identified:
1. Long wicks trigger stops prematurely → need wider stops
2. Fake breakouts are common → need confirmation (wait N bars)
3. Counter-trend entries lose → need stricter trend filter
4. Missing big down moves → need short selling
5. Default trendline params too slow for crypto → try faster lookback
"""

import numpy as np
import pandas as pd
from itertools import product

from trendline_breaks.data.sample_data import generate_sample_btcusdt
from trendline_breaks.core.trendline_engine import compute_trendlines
from trendline_breaks.core.strategy_v2 import compute_adx, compute_rsi, compute_atr


INITIAL_CAPITAL = 1000.0


def btc_backtest(df, signals,
                 position_size_pct=0.25,
                 # Trend
                 ema_fast=20, ema_slow=50,
                 # Filters
                 adx_period=14, adx_threshold=20.0,
                 rsi_period=14, rsi_ob=70.0, rsi_os=30.0,
                 # Risk
                 atr_sl_mult=2.5, trail_atr_mult=3.5,
                 # BTC-specific
                 confirmation_bars=0,  # wait N bars after signal
                 use_retest=False,     # wait for price to retest trendline
                 allow_short=True,
                 max_loss_per_trade_pct=3.0,  # max % loss per trade
                 ):
    """BTC-optimized backtester."""
    close = df["Close"]

    ema_f = close.ewm(span=ema_fast, min_periods=ema_fast).mean()
    ema_s = close.ewm(span=ema_slow, min_periods=ema_slow).mean()
    adx = compute_adx(df, adx_period)
    rsi = compute_rsi(close, rsi_period)
    atr = compute_atr(df, 14)

    capital = INITIAL_CAPITAL
    position = 0.0
    entry_price = 0.0
    entry_date = None
    direction = 0
    trades = []
    equity = []
    stop_loss = 0.0
    trail_high = 0.0
    trail_low = float("inf")

    # Confirmation tracking
    pending_signal = None  # ("long"/"short", bar_index, countdown)

    for i in range(1, len(df)):
        c = close.iloc[i]
        h = df["High"].iloc[i]
        l = df["Low"].iloc[i]
        date = df.index[i]
        curr_atr = atr.iloc[i] if not np.isnan(atr.iloc[i]) else 0

        # --- CONFIRMATION: check if pending signal is ready ---
        confirmed_long = False
        confirmed_short = False

        if pending_signal:
            sig_type, sig_bar, countdown = pending_signal
            if countdown <= 0:
                # Confirmation check: price should still be above/below trendline
                if sig_type == "long" and c > signals["upper"].iloc[i]:
                    confirmed_long = True
                elif sig_type == "short" and c < signals["lower"].iloc[i]:
                    confirmed_short = True
                pending_signal = None
            else:
                # Check if signal invalidated (price reversed)
                if sig_type == "long" and c < signals["lower"].iloc[i]:
                    pending_signal = None  # invalidated
                elif sig_type == "short" and c > signals["upper"].iloc[i]:
                    pending_signal = None  # invalidated
                else:
                    pending_signal = (sig_type, sig_bar, countdown - 1)

        # --- STOPS ---
        if position != 0:
            if direction == 1:
                trail_high = max(trail_high, h)
                trail_stop = trail_high - curr_atr * trail_atr_mult if curr_atr > 0 else 0

                # Max loss cap
                max_loss_price = entry_price * (1 - max_loss_per_trade_pct / 100)
                effective_sl = max(stop_loss, max_loss_price)

                hit_sl = l <= effective_sl
                hit_trail = curr_atr > 0 and l <= trail_stop and trail_stop > effective_sl

                if hit_sl or hit_trail:
                    exit_p = max(effective_sl if hit_sl else trail_stop, l)
                    pnl = position * (exit_p - entry_price)
                    trades.append({
                        "entry_date": entry_date, "exit_date": date,
                        "entry_price": entry_price, "exit_price": exit_p,
                        "pnl": pnl, "direction": "LONG",
                        "exit_reason": "stop_loss" if hit_sl else "trailing_stop",
                    })
                    capital += position * exit_p
                    position = 0.0
                    direction = 0

            elif direction == -1:
                trail_low = min(trail_low, l)
                trail_stop = trail_low + curr_atr * trail_atr_mult if curr_atr > 0 else 999999

                max_loss_price = entry_price * (1 + max_loss_per_trade_pct / 100)
                effective_sl = min(stop_loss, max_loss_price)

                hit_sl = h >= effective_sl
                hit_trail = curr_atr > 0 and h >= trail_stop and trail_stop < effective_sl

                if hit_sl or hit_trail:
                    exit_p = min(effective_sl if hit_sl else trail_stop, h)
                    pnl = abs(position) * (entry_price - exit_p)
                    trades.append({
                        "entry_date": entry_date, "exit_date": date,
                        "entry_price": entry_price, "exit_price": exit_p,
                        "pnl": pnl, "direction": "SHORT",
                        "exit_reason": "stop_loss" if hit_sl else "trailing_stop",
                    })
                    capital += pnl
                    position = 0.0
                    direction = 0

        # --- FILTERS ---
        in_uptrend = ema_f.iloc[i] > ema_s.iloc[i] if i >= ema_slow else False
        in_downtrend = ema_f.iloc[i] < ema_s.iloc[i] if i >= ema_slow else False
        is_trending = adx.iloc[i] > adx_threshold if not np.isnan(adx.iloc[i]) else False
        curr_rsi = rsi.iloc[i] if not np.isnan(rsi.iloc[i]) else 50

        # --- NEW SIGNALS ---
        if signals["upper_break"].iloc[i] and position == 0 and not pending_signal:
            if in_uptrend and is_trending and curr_rsi < rsi_ob:
                if confirmation_bars > 0:
                    pending_signal = ("long", i, confirmation_bars)
                else:
                    confirmed_long = True

        elif signals["lower_break"].iloc[i] and position == 0 and allow_short and not pending_signal:
            if in_downtrend and is_trending and curr_rsi > rsi_os:
                if confirmation_bars > 0:
                    pending_signal = ("short", i, confirmation_bars)
                else:
                    confirmed_short = True

        # --- ENTRIES ---
        if confirmed_long and position == 0:
            invest = capital * position_size_pct
            if invest > 0 and c > 0:
                position = invest / c
                entry_price = c
                entry_date = date
                direction = 1
                capital -= invest
                trail_high = h
                stop_loss = c - curr_atr * atr_sl_mult if curr_atr > 0 else 0

        elif confirmed_short and position == 0:
            invest = capital * position_size_pct
            if invest > 0 and c > 0:
                position = -(invest / c)
                entry_price = c
                entry_date = date
                direction = -1
                trail_low = l
                stop_loss = c + curr_atr * atr_sl_mult if curr_atr > 0 else 999999

        # --- SIGNAL EXIT ---
        elif signals["lower_break"].iloc[i] and direction == 1:
            pnl = position * (c - entry_price)
            trades.append({
                "entry_date": entry_date, "exit_date": date,
                "entry_price": entry_price, "exit_price": c,
                "pnl": pnl, "direction": "LONG", "exit_reason": "signal",
            })
            capital += position * c
            position = 0.0
            direction = 0

        elif signals["upper_break"].iloc[i] and direction == -1:
            pnl = abs(position) * (entry_price - c)
            trades.append({
                "entry_date": entry_date, "exit_date": date,
                "entry_price": entry_price, "exit_price": c,
                "pnl": pnl, "direction": "SHORT", "exit_reason": "signal",
            })
            capital += pnl
            position = 0.0
            direction = 0

        # --- EQUITY ---
        if direction == 1:
            pv = capital + position * c
        elif direction == -1:
            pv = capital + abs(position) * (entry_price - c)
        else:
            pv = capital
        equity.append(pv)

    equity_series = pd.Series(equity, index=df.index[1:])
    return trades, equity_series


def score_result(trades, equity, min_win_rate=25.0):
    """Score a strategy result. Higher is better."""
    total = len(trades)
    if total < 2:
        return -999, {}

    wins = sum(1 for t in trades if t["pnl"] > 0)
    losses = total - wins
    win_rate = wins / total * 100
    total_pnl = sum(t["pnl"] for t in trades)
    ret = total_pnl / INITIAL_CAPITAL * 100

    gross_profit = sum(t["pnl"] for t in trades if t["pnl"] > 0)
    gross_loss = abs(sum(t["pnl"] for t in trades if t["pnl"] <= 0))
    pf = gross_profit / gross_loss if gross_loss > 0 else 99

    peak = equity.cummax()
    max_dd = ((equity - peak) / peak * 100).min() if not equity.empty else 0

    avg_win = gross_profit / wins if wins > 0 else 0
    avg_loss = gross_loss / losses if losses > 0 else 0

    # Penalize if win rate below target
    wr_penalty = max(0, min_win_rate - win_rate) * 5

    # Composite score: return + profit_factor bonus - drawdown penalty - win_rate penalty
    score = ret + pf * 3 - abs(max_dd) * 0.3 - wr_penalty

    stats = {
        "total": total, "wins": wins, "losses": losses,
        "win_rate": win_rate, "total_pnl": total_pnl,
        "return_pct": ret, "profit_factor": pf,
        "max_dd": max_dd, "avg_win": avg_win, "avg_loss": avg_loss,
        "final_capital": equity.iloc[-1] if not equity.empty else INITIAL_CAPITAL,
    }
    return score, stats


def optimize():
    """Grid search over parameter combinations for BTC."""
    print("=" * 65)
    print("  BTCUSDT STRATEGY OPTIMIZER")
    print(f"  Starting Capital: ${INITIAL_CAPITAL:,.0f}")
    print(f"  Target Win Rate: >= 25%")
    print("=" * 65)

    df = generate_sample_btcusdt(bars=720)
    print(f"\nData: {len(df)} hourly bars | {df.index[0]} -> {df.index[-1]}")
    print(f"Price: ${df['Close'].iloc[0]:,.0f} -> ${df['Close'].iloc[-1]:,.0f}\n")

    # Parameter grid (reduced for speed, focused on most impactful params)
    param_grid = {
        "swing_lookback": [8, 10, 14],
        "slope_mult": [0.8, 1.0, 1.5],
        "ema_fast": [10, 20],
        "ema_slow": [30, 50],
        "adx_threshold": [15, 25],
        "atr_sl_mult": [2.5, 3.0],
        "trail_atr_mult": [3.5, 4.0],
        "confirmation_bars": [0, 2],
        "position_size_pct": [0.30, 0.50],
        "max_loss_pct": [3.0, 5.0],
    }

    # Generate all combinations
    keys = list(param_grid.keys())
    values = list(param_grid.values())

    best_score = -999
    best_params = None
    best_stats = None
    best_trades = None
    best_equity = None
    tested = 0
    passing = 0  # strategies with WR >= 25%

    total_combos = 1
    for v in values:
        total_combos *= len(v)

    print(f"Testing {total_combos:,} parameter combinations...\n")

    for combo in product(*values):
        params = dict(zip(keys, combo))

        # Skip invalid combos
        if params["ema_fast"] >= params["ema_slow"]:
            continue

        # Compute trendlines with these params
        signals = compute_trendlines(
            df,
            length=params["swing_lookback"],
            mult=params["slope_mult"],
            method="atr"
        )

        trades, equity = btc_backtest(
            df, signals,
            position_size_pct=params["position_size_pct"],
            ema_fast=params["ema_fast"],
            ema_slow=params["ema_slow"],
            adx_threshold=params["adx_threshold"],
            atr_sl_mult=params["atr_sl_mult"],
            trail_atr_mult=params["trail_atr_mult"],
            confirmation_bars=params["confirmation_bars"],
            allow_short=True,
            max_loss_per_trade_pct=params["max_loss_pct"],
        )

        score, stats = score_result(trades, equity)
        tested += 1

        if stats and stats["win_rate"] >= 25.0:
            passing += 1

        if score > best_score:
            best_score = score
            best_params = params.copy()
            best_stats = stats
            best_trades = trades
            best_equity = equity

        if tested % 5000 == 0:
            print(f"  Tested {tested:,} combos... (passing WR>=25%: {passing})")

    print(f"\n  Total tested: {tested:,}")
    print(f"  Passing (WR>=25%): {passing}")

    # Print best result
    print(f"\n{'=' * 65}")
    print(f"  BEST STRATEGY FOUND (Score: {best_score:.2f})")
    print(f"{'=' * 65}")

    print(f"\n  Parameters:")
    for k, v in best_params.items():
        print(f"    {k:<25} = {v}")

    s = best_stats
    print(f"\n  Results:")
    print(f"    Trades:          {s['total']}  ({s['wins']}W / {s['losses']}L)")
    print(f"    Win Rate:        {s['win_rate']:.1f}%")
    print(f"    Total P&L:       ${s['total_pnl']:,.2f}")
    print(f"    Return:          {s['return_pct']:+.2f}%")
    print(f"    Max Drawdown:    {s['max_dd']:.2f}%")
    print(f"    Profit Factor:   {s['profit_factor']:.2f}")
    print(f"    Avg Win:         ${s['avg_win']:,.2f}")
    print(f"    Avg Loss:        ${s['avg_loss']:,.2f}")
    print(f"    Final Capital:   ${s['final_capital']:,.2f}")

    # Print trades
    if best_trades:
        print(f"\n  {'#':<3} {'Dir':<6} {'Entry':<20} {'Exit':<20} "
              f"{'EntryP':>10} {'ExitP':>10} {'P&L':>10} {'Reason':<12}")
        print(f"  {'-' * 95}")
        for i, t in enumerate(best_trades, 1):
            tag = "WIN" if t["pnl"] > 0 else "LOSS"
            print(f"  {i:<3} {t['direction']:<6} {str(t['entry_date']):<20} {str(t['exit_date']):<20} "
                  f"${t['entry_price']:>9,.2f} ${t['exit_price']:>9,.2f} "
                  f"${t['pnl']:>9,.2f} {t['exit_reason']:<12} [{tag}]")

    return best_params, best_stats, best_trades, best_equity, df


if __name__ == "__main__":
    best_params, best_stats, best_trades, best_equity, df = optimize()

    # Generate chart with best params
    signals = compute_trendlines(
        df,
        length=best_params["swing_lookback"],
        mult=best_params["slope_mult"],
        method="atr"
    )

    from trendline_breaks.core.chart import plot_trendlines
    plot_trendlines(df, signals,
                    f"BTCUSDT (1H) - Optimized (WR:{best_stats['win_rate']:.0f}% | PF:{best_stats['profit_factor']:.2f})",
                    save_path="trendline_breaks/btc_optimized_chart.png",
                    candlestick=True)
