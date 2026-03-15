"""
BTCUSDT 1-month hourly backtest test.
Uses sample data since Yahoo Finance is unavailable in this environment.
"""

from trendline_breaks.data.sample_data import generate_sample_btcusdt
from trendline_breaks.core.trendline_engine import compute_trendlines
from trendline_breaks.backtest.backtester import run_backtest
from trendline_breaks.core.chart import plot_trendlines
from trendline_breaks.config import SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD


def main():
    print("Generating BTCUSDT-like hourly sample data (1 month, 24/7)...")
    df = generate_sample_btcusdt(bars=720)
    print(f"Loaded {len(df)} hourly bars")
    print(f"Period: {df.index[0]} -> {df.index[-1]}")
    print(f"Price range: ${df['Low'].min():,.2f} - ${df['High'].max():,.2f}\n")

    print(f"Computing trendlines (lookback={SWING_LOOKBACK}, slope={SLOPE_MULT}, method={SLOPE_METHOD})...")
    signals = compute_trendlines(df, SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD)

    bull_count = signals["upper_break"].sum()
    bear_count = signals["lower_break"].sum()
    print(f"Bullish breakouts: {bull_count}")
    print(f"Bearish breakouts: {bear_count}\n")

    result = run_backtest(df, signals, initial_capital=10000.0, position_size_pct=0.1)
    print(result.summary())

    if result.trades:
        print(f"\n=== Trade Details ===")
        for i, t in enumerate(result.trades, 1):
            direction = "WIN" if t["pnl"] > 0 else "LOSS"
            print(f"  #{i}: {t['entry_date']} -> {t['exit_date']} | "
                  f"Entry: ${t['entry_price']:,.2f} Exit: ${t['exit_price']:,.2f} | "
                  f"P&L: ${t['pnl']:,.2f} [{direction}]")

    print("\nSaving candlestick chart to trendline_breaks/btc_test_chart.png...")
    plot_trendlines(df, signals, "BTCUSDT (Sample - 1H)",
                    save_path="trendline_breaks/btc_test_chart.png",
                    candlestick=True)


if __name__ == "__main__":
    main()
