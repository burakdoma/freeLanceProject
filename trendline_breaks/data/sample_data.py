"""
Generate realistic sample OHLCV data for testing when Yahoo Finance is unavailable.
Simulates QQQ-like hourly price action over ~1 month.
"""

import numpy as np
import pandas as pd


def generate_sample_qqqh(bars: int = 500, seed: int = 42) -> pd.DataFrame:
    """
    Generate realistic QQQ-like hourly OHLCV data.

    Simulates ~1 month of hourly candles with trend changes,
    volatility clusters, and realistic OHLC relationships.
    """
    np.random.seed(seed)

    # Start price around QQQ levels
    base_price = 480.0

    # Generate price path with regime changes
    returns = []
    regime = 0  # 0=neutral, 1=uptrend, -1=downtrend
    volatility = 0.002

    for i in range(bars):
        # Regime changes every ~80 bars
        if i % 80 == 0:
            regime = np.random.choice([-1, 0, 1])
            volatility = np.random.uniform(0.001, 0.004)

        drift = regime * 0.0003
        ret = drift + np.random.normal(0, volatility)
        returns.append(ret)

    # Build close prices
    close = np.zeros(bars)
    close[0] = base_price
    for i in range(1, bars):
        close[i] = close[i - 1] * (1 + returns[i])

    # Generate OHLV from close
    high = np.zeros(bars)
    low = np.zeros(bars)
    open_ = np.zeros(bars)
    volume = np.zeros(bars)

    open_[0] = close[0] * 0.999
    for i in range(1, bars):
        open_[i] = close[i - 1] + np.random.normal(0, 0.2)

    for i in range(bars):
        spread = abs(close[i] - open_[i])
        wick_up = np.random.exponential(max(spread * 0.5, 0.3))
        wick_down = np.random.exponential(max(spread * 0.5, 0.3))
        high[i] = max(open_[i], close[i]) + wick_up
        low[i] = min(open_[i], close[i]) - wick_down
        volume[i] = int(np.random.lognormal(16, 0.5))

    # Create hourly datetime index (trading hours only: 9:30-16:00, 7 bars/day)
    dates = pd.bdate_range(start="2026-02-15", periods=bars // 7 + 2, freq="B")
    timestamps = []
    for date in dates:
        for hour in [9, 10, 11, 12, 13, 14, 15]:
            if hour == 9:
                timestamps.append(date.replace(hour=9, minute=30))
            else:
                timestamps.append(date.replace(hour=hour, minute=0))
            if len(timestamps) >= bars:
                break
        if len(timestamps) >= bars:
            break

    timestamps = timestamps[:bars]

    df = pd.DataFrame({
        "Open": open_,
        "High": high,
        "Low": low,
        "Close": close,
        "Volume": volume.astype(int),
    }, index=pd.DatetimeIndex(timestamps, name="Datetime"))

    return df
