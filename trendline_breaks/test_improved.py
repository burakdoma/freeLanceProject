"""
Test improved strategy V2 on BTC and QQQ.
Compare against baseline.
"""

from trendline_breaks.data.sample_data import generate_sample_btcusdt, generate_sample_qqqh
from trendline_breaks.core.trendline_engine import compute_trendlines
from trendline_breaks.core.strategy_v2 import backtest_improved, print_report
from trendline_breaks.backtest.backtester import run_backtest
from trendline_breaks.core.chart import plot_trendlines
from trendline_breaks.config import SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD


def test_symbol(df, name):
    signals = compute_trendlines(df, SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD)

    # --- BASELINE ---
    baseline = run_backtest(df, signals, initial_capital=10000.0, position_size_pct=0.1)
    print(f"\n{'#' * 60}")
    print(f"  {name} - BASELINE (original strategy)")
    print(f"{'#' * 60}")
    print(baseline.summary())

    # --- IMPROVED V2 (default params) ---
    result = backtest_improved(
        df, signals,
        initial_capital=10000.0,
        position_size_pct=0.25,
        ema_fast=20, ema_slow=50,
        adx_period=14, adx_threshold=20.0,
        rsi_period=14, rsi_ob=70.0, rsi_os=30.0,
        atr_sl_mult=1.5, trail_atr_mult=2.5,
        allow_short=True,
    )
    print_report(result, f"{name} - IMPROVED V2 (EMA+ADX+RSI+SL+Trail+Short, 25%)")

    # --- IMPROVED V2 - Tuned for more trades ---
    result2 = backtest_improved(
        df, signals,
        initial_capital=10000.0,
        position_size_pct=0.30,
        ema_fast=10, ema_slow=30,
        adx_period=14, adx_threshold=15.0,
        rsi_period=14, rsi_ob=75.0, rsi_os=25.0,
        atr_sl_mult=2.0, trail_atr_mult=3.0,
        allow_short=True,
    )
    print_report(result2, f"{name} - IMPROVED V2-B (Relaxed filters, 30%)")

    # --- IMPROVED V2 - Aggressive ---
    result3 = backtest_improved(
        df, signals,
        initial_capital=10000.0,
        position_size_pct=0.40,
        ema_fast=10, ema_slow=30,
        adx_period=14, adx_threshold=15.0,
        rsi_period=14, rsi_ob=80.0, rsi_os=20.0,
        atr_sl_mult=2.0, trail_atr_mult=2.0,
        allow_short=True,
    )
    print_report(result3, f"{name} - IMPROVED V2-C (Aggressive 40%, tight trail)")

    # Return best result for charting
    all_results = [
        ("Baseline", baseline.total_pnl),
        ("V2", result["stats"]["total_pnl"]),
        ("V2-B", result2["stats"]["total_pnl"]),
        ("V2-C", result3["stats"]["total_pnl"]),
    ]
    best_name = max(all_results, key=lambda x: x[1])
    print(f"\n  >>> BEST for {name}: {best_name[0]} (P&L: ${best_name[1]:,.2f})")

    return signals


def main():
    print("=" * 60)
    print("  IMPROVED STRATEGY COMPARISON")
    print("=" * 60)

    # BTC
    print("\n\n>>> BTCUSDT (720 hourly bars, 1 month)")
    btc_df = generate_sample_btcusdt(bars=720)
    btc_signals = test_symbol(btc_df, "BTCUSDT")

    # QQQ
    print("\n\n>>> QQQ (500 hourly bars, ~1 month)")
    qqq_df = generate_sample_qqqh(bars=500)
    qqq_signals = test_symbol(qqq_df, "QQQ")

    # Save charts
    print("\n\nSaving charts...")
    plot_trendlines(btc_df, btc_signals, "BTCUSDT (1H) - Improved Strategy",
                    save_path="trendline_breaks/btc_improved_chart.png", candlestick=True)
    plot_trendlines(qqq_df, qqq_signals, "QQQ (1H) - Improved Strategy",
                    save_path="trendline_breaks/qqq_improved_chart.png", candlestick=True)


if __name__ == "__main__":
    main()
