"""
Trendlines with Breaks - Main Entry Point
Based on LuxAlgo's Pine Script indicator.

Usage:
    python -m trendline_breaks.main backtest AAPL
    python -m trendline_breaks.main scan
    python -m trendline_breaks.main chart AAPL
    python -m trendline_breaks.main live
"""

import argparse
import sys

from trendline_breaks.config import (
    SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD,
    DEFAULT_SYMBOL, DEFAULT_PERIOD, DEFAULT_INTERVAL,
    INITIAL_CAPITAL, POSITION_SIZE_PCT, WATCHLIST
)
from trendline_breaks.core.trendline_engine import compute_trendlines
from trendline_breaks.data.fetcher import fetch_ohlcv
from trendline_breaks.backtest.backtester import run_backtest
from trendline_breaks.core.chart import plot_trendlines
from trendline_breaks.signals.live_scanner import scan_watchlist, start_live_scanner


def cmd_backtest(args):
    """Run backtest for a symbol."""
    symbol = args.symbol or DEFAULT_SYMBOL
    print(f"Fetching data for {symbol}...")
    df = fetch_ohlcv(symbol, period=args.period, interval=args.interval)
    print(f"Loaded {len(df)} bars.\n")

    signals = compute_trendlines(df, SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD)
    result = run_backtest(df, signals, INITIAL_CAPITAL, POSITION_SIZE_PCT)

    print(result.summary())

    if args.chart:
        plot_trendlines(df, signals, symbol)


def cmd_chart(args):
    """Show chart with trendlines."""
    symbol = args.symbol or DEFAULT_SYMBOL
    print(f"Fetching data for {symbol}...")
    df = fetch_ohlcv(symbol, period=args.period, interval=args.interval)

    signals = compute_trendlines(df, SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD)

    save_path = args.save if args.save else None
    plot_trendlines(df, signals, symbol, save_path=save_path)


def cmd_scan(args):
    """One-time scan of watchlist."""
    symbols = args.symbols.split(",") if args.symbols else WATCHLIST
    results = scan_watchlist(symbols)

    if results:
        print(f"\nFound {len(results)} active signal(s).")
    return results


def cmd_live(args):
    """Start live scanner."""
    symbols = args.symbols.split(",") if args.symbols else WATCHLIST
    start_live_scanner(symbols, interval_minutes=args.interval_min)


def main():
    parser = argparse.ArgumentParser(
        description="Trendlines with Breaks - Trading Signal Tool"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Backtest
    bt = subparsers.add_parser("backtest", help="Run backtest on a symbol")
    bt.add_argument("symbol", nargs="?", help="Ticker symbol (e.g. AAPL)")
    bt.add_argument("--period", default=DEFAULT_PERIOD, help="Data period (1y, 2y, 5y)")
    bt.add_argument("--interval", default=DEFAULT_INTERVAL, help="Bar interval (1d, 1h)")
    bt.add_argument("--chart", action="store_true", help="Show chart after backtest")
    bt.set_defaults(func=cmd_backtest)

    # Chart
    ch = subparsers.add_parser("chart", help="Show trendline chart")
    ch.add_argument("symbol", nargs="?", help="Ticker symbol")
    ch.add_argument("--period", default=DEFAULT_PERIOD)
    ch.add_argument("--interval", default=DEFAULT_INTERVAL)
    ch.add_argument("--save", help="Save chart to file path")
    ch.set_defaults(func=cmd_chart)

    # Scan
    sc = subparsers.add_parser("scan", help="One-time watchlist scan")
    sc.add_argument("--symbols", help="Comma-separated symbols (e.g. AAPL,MSFT)")
    sc.set_defaults(func=cmd_scan)

    # Live
    lv = subparsers.add_parser("live", help="Start live scanner")
    lv.add_argument("--symbols", help="Comma-separated symbols")
    lv.add_argument("--interval-min", type=int, default=15, help="Check interval in minutes")
    lv.set_defaults(func=cmd_live)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()
