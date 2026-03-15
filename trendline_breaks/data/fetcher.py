"""
Yahoo Finance data fetcher module.
"""

import yfinance as yf
import pandas as pd


def fetch_ohlcv(symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
    """
    Fetch OHLCV data from Yahoo Finance.

    Args:
        symbol: Ticker symbol (e.g. "AAPL", "MSFT")
        period: Data period (1mo, 3mo, 6mo, 1y, 2y, 5y, max)
        interval: Data interval (1m, 5m, 15m, 1h, 1d, 1wk)

    Returns:
        DataFrame with Open, High, Low, Close, Volume columns
    """
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=interval)

    if df.empty:
        raise ValueError(f"No data returned for {symbol}")

    # Keep only OHLCV columns
    df = df[["Open", "High", "Low", "Close", "Volume"]]
    return df


def fetch_multiple(symbols: list[str], period: str = "1y",
                   interval: str = "1d") -> dict[str, pd.DataFrame]:
    """Fetch data for multiple symbols."""
    results = {}
    for symbol in symbols:
        try:
            results[symbol] = fetch_ohlcv(symbol, period, interval)
        except Exception as e:
            print(f"[WARNING] Could not fetch {symbol}: {e}")
    return results
