"""
Strategy Optimizer - Analyze weaknesses and test improved variants.
"""

import numpy as np
import pandas as pd
from trendline_breaks.data.sample_data import generate_sample_btcusdt, generate_sample_qqqh
from trendline_breaks.core.trendline_engine import compute_trendlines
from trendline_breaks.config import SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD


# =============================================================================
# STEP 1: Analyze current strategy weaknesses
# =============================================================================

def analyze_weaknesses(df, signals):
    """Analyze why trades lost and what was missed."""
    print("=" * 60)
    print("WEAKNESS ANALYSIS")
    print("=" * 60)

    # Check each bullish breakout
    bull_indices = signals.index[signals["upper_break"]]
    print(f"\nBullish breakouts: {len(bull_indices)}")

    for idx in bull_indices:
        pos = df.index.get_loc(idx)
        close = df["Close"].iloc[pos]

        # Look ahead 20 bars to see what happened
        future = df["Close"].iloc[pos:pos + 20]
        if len(future) < 5:
            continue
        max_gain = (future.max() - close) / close * 100
        max_loss = (future.min() - close) / close * 100
        end_return = (future.iloc[-1] - close) / close * 100 if len(future) == 20 else 0

        # Check if we were in a sideways/choppy market
        lookback_close = df["Close"].iloc[max(0, pos - 30):pos]
        if len(lookback_close) > 10:
            recent_range = (lookback_close.max() - lookback_close.min()) / lookback_close.mean() * 100
        else:
            recent_range = 0

        # Check trend direction (SMA)
        sma50 = df["Close"].iloc[max(0, pos - 50):pos].mean() if pos > 50 else close
        trend = "UPTREND" if close > sma50 else "DOWNTREND"

        # Check volume
        avg_vol = df["Volume"].iloc[max(0, pos - 20):pos].mean()
        curr_vol = df["Volume"].iloc[pos]
        vol_ratio = curr_vol / avg_vol if avg_vol > 0 else 1

        status = "WIN" if end_return > 0 else "LOSS"
        print(f"  {idx} | {status} | Return: {end_return:+.2f}% | "
              f"MaxGain: {max_gain:+.2f}% MaxLoss: {max_loss:+.2f}% | "
              f"Trend: {trend} | Range: {recent_range:.1f}% | VolRatio: {vol_ratio:.1f}x")

    # Check missed opportunities (big moves without signals)
    print(f"\n--- Missed Opportunities ---")
    returns = df["Close"].pct_change(20) * 100  # 20-bar returns
    big_moves = returns[returns.abs() > 3]
    for idx in big_moves.index:
        pos = df.index.get_loc(idx)
        start_pos = max(0, pos - 20)
        # Check if any signal fired in this window
        window_signals = signals["upper_break"].iloc[start_pos:pos].any() or \
                         signals["lower_break"].iloc[start_pos:pos].any()
        if not window_signals:
            direction = "UP" if big_moves[idx] > 0 else "DOWN"
            print(f"  MISSED {direction} move at {idx}: {big_moves[idx]:+.1f}% over 20 bars")


# =============================================================================
# STEP 2: Improved Backtester with advanced features
# =============================================================================

def backtest_v2(df, signals, initial_capital=10000.0, position_size_pct=0.1,
                # Filters
                use_trend_filter=False,
                use_volume_filter=False,
                use_sideways_filter=False,
                use_atr_stoploss=False,
                use_trailing_stop=False,
                allow_short=False,
                # Parameters
                sma_period=50,
                volume_mult=1.2,
                sideways_threshold=2.0,
                sideways_lookback=30,
                atr_sl_mult=2.0,
                trailing_atr_mult=3.0,
                atr_period=14,
                ):
    """
    Advanced backtester with multiple filters and risk management.
    """
    capital = initial_capital
    position = 0.0
    entry_price = 0.0
    entry_date = None
    direction = 0  # 1=long, -1=short
    trades = []
    equity = []
    stop_loss = 0.0
    trailing_high = 0.0

    # Precompute indicators
    sma = df["Close"].rolling(sma_period).mean()

    tr = pd.concat([
        df["High"] - df["Low"],
        (df["High"] - df["Close"].shift(1)).abs(),
        (df["Low"] - df["Close"].shift(1)).abs()
    ], axis=1).max(axis=1)
    atr = tr.rolling(atr_period).mean()

    avg_volume = df["Volume"].rolling(20).mean()

    for i in range(1, len(df)):
        close = df["Close"].iloc[i]
        high = df["High"].iloc[i]
        low = df["Low"].iloc[i]
        date = df.index[i]

        # --- FILTER CHECKS ---
        pass_filters = True

        # Trend filter: only long in uptrend, only short in downtrend
        if use_trend_filter and i >= sma_period:
            in_uptrend = close > sma.iloc[i]
            in_downtrend = close < sma.iloc[i]
        else:
            in_uptrend = True
            in_downtrend = True

        # Volume filter: breakout on above-average volume
        if use_volume_filter and i >= 20:
            vol_ok = df["Volume"].iloc[i] > avg_volume.iloc[i] * volume_mult
        else:
            vol_ok = True

        # Sideways filter: skip if market is ranging
        if use_sideways_filter and i >= sideways_lookback:
            lookback = df["Close"].iloc[i - sideways_lookback:i]
            price_range_pct = (lookback.max() - lookback.min()) / lookback.mean() * 100
            not_sideways = price_range_pct > sideways_threshold
        else:
            not_sideways = True

        # --- STOP LOSS CHECK (before signals) ---
        if position != 0 and use_atr_stoploss:
            if direction == 1 and low <= stop_loss:
                sell_price = stop_loss
                pnl = position * (sell_price - entry_price)
                trades.append({
                    "entry_date": entry_date, "exit_date": date,
                    "entry_price": entry_price, "exit_price": sell_price,
                    "shares": position, "pnl": pnl, "exit_reason": "stop_loss",
                    "direction": "LONG",
                })
                capital += position * sell_price
                position = 0.0
                direction = 0

            elif direction == -1 and high >= stop_loss:
                cover_price = stop_loss
                pnl = abs(position) * (entry_price - cover_price)
                trades.append({
                    "entry_date": entry_date, "exit_date": date,
                    "entry_price": entry_price, "exit_price": cover_price,
                    "shares": abs(position), "pnl": pnl, "exit_reason": "stop_loss",
                    "direction": "SHORT",
                })
                capital += abs(position) * entry_price + pnl
                position = 0.0
                direction = 0

        # --- TRAILING STOP ---
        if position > 0 and use_trailing_stop:
            trailing_high = max(trailing_high, high)
            trail_stop = trailing_high - atr.iloc[i] * trailing_atr_mult
            if not np.isnan(trail_stop) and low <= trail_stop and trail_stop > stop_loss:
                sell_price = trail_stop
                pnl = position * (sell_price - entry_price)
                trades.append({
                    "entry_date": entry_date, "exit_date": date,
                    "entry_price": entry_price, "exit_price": sell_price,
                    "shares": position, "pnl": pnl, "exit_reason": "trailing_stop",
                    "direction": "LONG",
                })
                capital += position * sell_price
                position = 0.0
                direction = 0

        # --- ENTRY SIGNALS ---
        # Long entry
        if signals["upper_break"].iloc[i] and position == 0:
            if (not use_trend_filter or in_uptrend) and vol_ok and not_sideways:
                invest = capital * position_size_pct
                position = invest / close
                entry_price = close
                entry_date = date
                direction = 1
                capital -= invest
                trailing_high = high
                if use_atr_stoploss and not np.isnan(atr.iloc[i]):
                    stop_loss = close - atr.iloc[i] * atr_sl_mult
                else:
                    stop_loss = 0

        # Short entry
        elif signals["lower_break"].iloc[i] and allow_short and position == 0:
            if (not use_trend_filter or in_downtrend) and vol_ok and not_sideways:
                invest = capital * position_size_pct
                position = -(invest / close)
                entry_price = close
                entry_date = date
                direction = -1
                if use_atr_stoploss and not np.isnan(atr.iloc[i]):
                    stop_loss = close + atr.iloc[i] * atr_sl_mult
                else:
                    stop_loss = 999999

        # --- EXIT SIGNALS ---
        # Close long on bearish break
        elif signals["lower_break"].iloc[i] and direction == 1:
            pnl = position * (close - entry_price)
            trades.append({
                "entry_date": entry_date, "exit_date": date,
                "entry_price": entry_price, "exit_price": close,
                "shares": position, "pnl": pnl, "exit_reason": "signal",
                "direction": "LONG",
            })
            capital += position * close
            position = 0.0
            direction = 0

        # Close short on bullish break
        elif signals["upper_break"].iloc[i] and direction == -1:
            pnl = abs(position) * (entry_price - close)
            trades.append({
                "entry_date": entry_date, "exit_date": date,
                "entry_price": entry_price, "exit_price": close,
                "shares": abs(position), "pnl": pnl, "exit_reason": "signal",
                "direction": "SHORT",
            })
            capital += abs(position) * entry_price + pnl
            position = 0.0
            direction = 0

        # Track equity
        if direction == 1:
            portfolio_value = capital + position * close
        elif direction == -1:
            portfolio_value = capital + abs(position) * (entry_price - close) + abs(position) * entry_price
        else:
            portfolio_value = capital
        equity.append(portfolio_value)

    equity_series = pd.Series(equity, index=df.index[1:])
    return trades, equity_series


def summarize(trades, equity, initial_capital, label=""):
    """Print strategy summary."""
    total = len(trades)
    wins = sum(1 for t in trades if t["pnl"] > 0)
    losses = sum(1 for t in trades if t["pnl"] <= 0)
    total_pnl = sum(t["pnl"] for t in trades)
    win_rate = wins / total * 100 if total > 0 else 0
    ret = total_pnl / initial_capital * 100

    if not equity.empty:
        peak = equity.cummax()
        dd = ((equity - peak) / peak * 100).min()
        final = equity.iloc[-1]
    else:
        dd = 0
        final = initial_capital

    # Profit factor
    gross_profit = sum(t["pnl"] for t in trades if t["pnl"] > 0)
    gross_loss = abs(sum(t["pnl"] for t in trades if t["pnl"] <= 0))
    pf = gross_profit / gross_loss if gross_loss > 0 else float("inf")

    # Average win/loss
    avg_win = gross_profit / wins if wins > 0 else 0
    avg_loss = gross_loss / losses if losses > 0 else 0

    print(f"\n{'=' * 55}")
    print(f"  {label}")
    print(f"{'=' * 55}")
    print(f"  Trades: {total}  |  Wins: {wins}  |  Losses: {losses}")
    print(f"  Win Rate:      {win_rate:.1f}%")
    print(f"  Total P&L:     ${total_pnl:,.2f}")
    print(f"  Return:        {ret:+.2f}%")
    print(f"  Max Drawdown:  {dd:.2f}%")
    print(f"  Profit Factor: {pf:.2f}")
    print(f"  Avg Win:       ${avg_win:,.2f}  |  Avg Loss: ${avg_loss:,.2f}")
    print(f"  Final Capital: ${final:,.2f}")

    return {
        "label": label, "trades": total, "wins": wins, "win_rate": win_rate,
        "pnl": total_pnl, "return_pct": ret, "max_dd": dd, "profit_factor": pf,
        "final_capital": final,
    }


# =============================================================================
# STEP 3: Test all strategy variants
# =============================================================================

def run_all_variants(df, symbol_name, initial_capital=10000.0):
    """Test multiple strategy variants and find the best one."""

    signals = compute_trendlines(df, SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD)
    results = []

    # --- Variant 0: BASELINE (current strategy) ---
    trades, equity = backtest_v2(df, signals, initial_capital, position_size_pct=0.10)
    r = summarize(trades, equity, initial_capital, f"{symbol_name} | V0: Baseline (10% size)")
    results.append(r)

    # --- Variant 1: Bigger position size only ---
    trades, equity = backtest_v2(df, signals, initial_capital, position_size_pct=0.25)
    r = summarize(trades, equity, initial_capital, f"{symbol_name} | V1: Bigger size (25%)")
    results.append(r)

    # --- Variant 2: Trend filter (SMA50) ---
    trades, equity = backtest_v2(df, signals, initial_capital, position_size_pct=0.25,
                                  use_trend_filter=True, sma_period=50)
    r = summarize(trades, equity, initial_capital, f"{symbol_name} | V2: Trend filter SMA50 + 25%")
    results.append(r)

    # --- Variant 3: Trend filter + Sideways filter ---
    trades, equity = backtest_v2(df, signals, initial_capital, position_size_pct=0.25,
                                  use_trend_filter=True, sma_period=50,
                                  use_sideways_filter=True, sideways_threshold=3.0)
    r = summarize(trades, equity, initial_capital, f"{symbol_name} | V3: Trend + Sideways filter + 25%")
    results.append(r)

    # --- Variant 4: Trend + ATR Stop Loss ---
    trades, equity = backtest_v2(df, signals, initial_capital, position_size_pct=0.25,
                                  use_trend_filter=True, sma_period=50,
                                  use_atr_stoploss=True, atr_sl_mult=2.0)
    r = summarize(trades, equity, initial_capital, f"{symbol_name} | V4: Trend + ATR SL (2x) + 25%")
    results.append(r)

    # --- Variant 5: Trend + Trailing Stop ---
    trades, equity = backtest_v2(df, signals, initial_capital, position_size_pct=0.25,
                                  use_trend_filter=True, sma_period=50,
                                  use_atr_stoploss=True, atr_sl_mult=1.5,
                                  use_trailing_stop=True, trailing_atr_mult=2.5)
    r = summarize(trades, equity, initial_capital, f"{symbol_name} | V5: Trend + ATR SL + Trailing + 25%")
    results.append(r)

    # --- Variant 6: Full filters + Short selling ---
    trades, equity = backtest_v2(df, signals, initial_capital, position_size_pct=0.25,
                                  use_trend_filter=True, sma_period=50,
                                  use_sideways_filter=True, sideways_threshold=3.0,
                                  use_atr_stoploss=True, atr_sl_mult=1.5,
                                  use_trailing_stop=True, trailing_atr_mult=2.5,
                                  allow_short=True)
    r = summarize(trades, equity, initial_capital, f"{symbol_name} | V6: All filters + Short + 25%")
    results.append(r)

    # --- Variant 7: Aggressive - 40% size + all filters + short ---
    trades, equity = backtest_v2(df, signals, initial_capital, position_size_pct=0.40,
                                  use_trend_filter=True, sma_period=50,
                                  use_sideways_filter=True, sideways_threshold=3.0,
                                  use_atr_stoploss=True, atr_sl_mult=1.5,
                                  use_trailing_stop=True, trailing_atr_mult=2.5,
                                  allow_short=True)
    r = summarize(trades, equity, initial_capital, f"{symbol_name} | V7: Aggressive 40% + all filters + short")
    results.append(r)

    # --- Variant 8: Conservative trend - SMA200 + volume filter ---
    trades, equity = backtest_v2(df, signals, initial_capital, position_size_pct=0.30,
                                  use_trend_filter=True, sma_period=100,
                                  use_volume_filter=True, volume_mult=1.0,
                                  use_atr_stoploss=True, atr_sl_mult=2.0,
                                  use_trailing_stop=True, trailing_atr_mult=3.0)
    r = summarize(trades, equity, initial_capital, f"{symbol_name} | V8: SMA100 + Volume + Trail + 30%")
    results.append(r)

    return results


def find_best(all_results):
    """Find best strategy by return, then by profit factor."""
    # Score: return% weighted, penalized by drawdown
    for r in all_results:
        r["score"] = r["return_pct"] - abs(r["max_dd"]) * 0.5 + r["profit_factor"] * 2
    ranked = sorted(all_results, key=lambda x: x["score"], reverse=True)

    print("\n")
    print("=" * 70)
    print("  RANKING (sorted by composite score)")
    print("=" * 70)
    print(f"  {'#':<3} {'Strategy':<50} {'Return':>8} {'WinR':>6} {'PF':>6} {'Score':>7}")
    print("-" * 70)
    for i, r in enumerate(ranked, 1):
        print(f"  {i:<3} {r['label']:<50} {r['return_pct']:>+7.2f}% {r['win_rate']:>5.1f}% {r['profit_factor']:>5.2f} {r['score']:>7.2f}")

    print(f"\n  >>> BEST: {ranked[0]['label']}")
    return ranked[0]


if __name__ == "__main__":
    print("=" * 70)
    print("  STRATEGY OPTIMIZATION")
    print("=" * 70)

    # Test on BTC
    print("\n\n>>> GENERATING BTCUSDT DATA...")
    btc_df = generate_sample_btcusdt(bars=720)
    btc_signals = compute_trendlines(btc_df, SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD)
    print("\n--- Weakness Analysis: BTCUSDT ---")
    analyze_weaknesses(btc_df, btc_signals)

    print("\n\n>>> TESTING VARIANTS ON BTCUSDT...")
    btc_results = run_all_variants(btc_df, "BTC")

    # Test on QQQ
    print("\n\n>>> GENERATING QQQ DATA...")
    qqq_df = generate_sample_qqqh(bars=500)
    qqq_signals = compute_trendlines(qqq_df, SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD)
    print("\n--- Weakness Analysis: QQQ ---")
    analyze_weaknesses(qqq_df, qqq_signals)

    print("\n\n>>> TESTING VARIANTS ON QQQ...")
    qqq_results = run_all_variants(qqq_df, "QQQ")

    # Combined ranking
    all_results = btc_results + qqq_results
    print("\n\n>>> COMBINED RANKING (BTC + QQQ)")
    best = find_best(all_results)
