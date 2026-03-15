"""
Trendlines with Breaks - Main Entry Point
Based on LuxAlgo's Pine Script indicator with improved V2 strategy.

Usage:
    python -m trendline_breaks.main backtest AAPL
    python -m trendline_breaks.main backtest AAPL --classic
    python -m trendline_breaks.main scan
    python -m trendline_breaks.main chart AAPL
    python -m trendline_breaks.main live
"""

import argparse
import sys

from trendline_breaks.config import (
    SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD,
    DEFAULT_SYMBOL, DEFAULT_PERIOD, DEFAULT_INTERVAL,
    INITIAL_CAPITAL, POSITION_SIZE_PCT, WATCHLIST,
    EMA_FAST, EMA_SLOW, ADX_PERIOD, ADX_THRESHOLD,
    RSI_PERIOD, RSI_OVERBOUGHT, RSI_OVERSOLD,
    ATR_SL_MULT, TRAIL_ATR_MULT, ALLOW_SHORT
)
from trendline_breaks.core.trendline_engine import compute_trendlines
from trendline_breaks.core.strategy_v2 import backtest_improved, print_report
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

    if args.classic:
        # Original strategy
        result = run_backtest(df, signals, INITIAL_CAPITAL, POSITION_SIZE_PCT)
        print(result.summary())
    else:
        # Improved V2 strategy
        result = backtest_improved(
            df, signals,
            initial_capital=INITIAL_CAPITAL,
            position_size_pct=POSITION_SIZE_PCT,
            ema_fast=EMA_FAST, ema_slow=EMA_SLOW,
            adx_period=ADX_PERIOD, adx_threshold=ADX_THRESHOLD,
            rsi_period=RSI_PERIOD, rsi_ob=RSI_OVERBOUGHT, rsi_os=RSI_OVERSOLD,
            atr_sl_mult=ATR_SL_MULT, trail_atr_mult=TRAIL_ATR_MULT,
            allow_short=ALLOW_SHORT,
        )
        print_report(result, f"{symbol} - Improved V2 Strategy")

    if args.chart:
        plot_trendlines(df, signals, symbol, candlestick=True)


def cmd_chart(args):
    """Show chart with trendlines."""
    symbol = args.symbol or DEFAULT_SYMBOL
    print(f"Fetching data for {symbol}...")
    df = fetch_ohlcv(symbol, period=args.period, interval=args.interval)

    signals = compute_trendlines(df, SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD)

    save_path = args.save if args.save else None
    plot_trendlines(df, signals, symbol, save_path=save_path, candlestick=True)


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
    bt.add_argument("--classic", action="store_true", help="Use original strategy (no filters)")
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
