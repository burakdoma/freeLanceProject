"""
Live signal scanner - monitors watchlist for trendline breakouts.
"""

import time
from datetime import datetime

import schedule

from trendline_breaks.core.trendline_engine import compute_trendlines
from trendline_breaks.data.fetcher import fetch_ohlcv
from trendline_breaks.config import (
    SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD,
    WATCHLIST, CHECK_INTERVAL_MINUTES, DEFAULT_INTERVAL
)


def scan_symbol(symbol: str, period: str = "3mo",
                interval: str = DEFAULT_INTERVAL) -> dict | None:
    """
    Scan a single symbol for the latest breakout signal.

    Returns dict with signal info, or None if no signal.
    """
    try:
        df = fetch_ohlcv(symbol, period=period, interval=interval)
        signals = compute_trendlines(df, SWING_LOOKBACK, SLOPE_MULT, SLOPE_METHOD)

        last_idx = len(signals) - 1
        result = {
            "symbol": symbol,
            "date": df.index[last_idx],
            "close": df["Close"].iloc[last_idx],
            "upper_trendline": signals["upper"].iloc[last_idx],
            "lower_trendline": signals["lower"].iloc[last_idx],
            "upper_break": bool(signals["upper_break"].iloc[last_idx]),
            "lower_break": bool(signals["lower_break"].iloc[last_idx]),
        }

        if result["upper_break"] or result["lower_break"]:
            return result
        return None

    except Exception as e:
        print(f"[ERROR] Scanning {symbol}: {e}")
        return None


def scan_watchlist(watchlist: list[str] | None = None) -> list[dict]:
    """Scan all symbols in watchlist and return active signals."""
    symbols = watchlist or WATCHLIST
    active_signals = []

    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scanning {len(symbols)} symbols...")

    for symbol in symbols:
        signal = scan_symbol(symbol)
        if signal:
            direction = "BULLISH" if signal["upper_break"] else "BEARISH"
            print(f"  >> {symbol}: {direction} breakout at ${signal['close']:.2f}")
            active_signals.append(signal)

    if not active_signals:
        print("  No active breakout signals.")

    return active_signals


def start_live_scanner(watchlist: list[str] | None = None,
                       interval_minutes: int | None = None):
    """
    Start the live scanner that runs on a schedule.
    Press Ctrl+C to stop.
    """
    minutes = interval_minutes or CHECK_INTERVAL_MINUTES

    print(f"Starting live scanner (checking every {minutes} min)")
    print(f"Watchlist: {watchlist or WATCHLIST}")
    print("Press Ctrl+C to stop.\n")

    # Run immediately once
    scan_watchlist(watchlist)

    # Schedule periodic runs
    schedule.every(minutes).minutes.do(scan_watchlist, watchlist=watchlist)

    try:
        while True:
            schedule.run_pending()
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nScanner stopped.")
