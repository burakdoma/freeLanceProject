"""
QQQ 1-month hourly backtest test.
Uses sample data since Yahoo Finance is unavailable in this environment.
"""

from trendline_breaks.data.sample_data import generate_sample_qqqh
from trendline_breaks.core.trendline_engine import compute_trendlines
from trendline_breaks.backtest.backtester import run_backtest
from trendline_breaks.core.chart import plot_trendlines
from trendline_breaks.config import SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD


def main():
    # Generate QQQ-like hourly data (~1 month)
    print("Generating QQQ-like hourly sample data (1 month)...")
    df = generate_sample_qqqh(bars=500)
    print(f"Loaded {len(df)} hourly bars")
    print(f"Period: {df.index[0]} -> {df.index[-1]}")
    print(f"Price range: ${df['Low'].min():.2f} - ${df['High'].max():.2f}\n")

    # Compute trendlines
    print(f"Computing trendlines (lookback={SWING_LOOKBACK}, slope={SLOPE_MULT}, method={SLOPE_METHOD})...")
    signals = compute_trendlines(df, SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD)

    # Count signals
    bull_count = signals["upper_break"].sum()
    bear_count = signals["lower_break"].sum()
    print(f"Bullish breakouts: {bull_count}")
    print(f"Bearish breakouts: {bear_count}\n")

    # Run backtest
    result = run_backtest(df, signals, initial_capital=10000.0, position_size_pct=0.1)
    print(result.summary())

    # Print trade details
    if result.trades:
        print(f"\n=== Trade Details ===")
        for i, t in enumerate(result.trades, 1):
            direction = "WIN" if t["pnl"] > 0 else "LOSS"
            print(f"  #{i}: {t['entry_date']} -> {t['exit_date']} | "
                  f"Entry: ${t['entry_price']:.2f} Exit: ${t['exit_price']:.2f} | "
                  f"P&L: ${t['pnl']:.2f} [{direction}]")

    # Save chart
    print("\nSaving chart to trendline_breaks/qqq_test_chart.png...")
    plot_trendlines(df, signals, "QQQ (Sample - 1H)",
                    save_path="trendline_breaks/qqq_test_chart.png")


if __name__ == "__main__":
    main()
