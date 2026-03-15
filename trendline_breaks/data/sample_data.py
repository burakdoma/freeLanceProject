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


def generate_sample_btcusdt(bars: int = 720, seed: int = 99) -> pd.DataFrame:
    """
    Generate realistic BTCUSDT-like hourly OHLCV data.

    Simulates ~1 month of 24/7 crypto hourly candles with higher volatility,
    sharper moves, and longer wicks typical of BTC.
    """
    np.random.seed(seed)

    base_price = 84000.0

    returns = []
    regime = 0
    volatility = 0.005

    for i in range(bars):
        if i % 60 == 0:
            regime = np.random.choice([-1, 0, 1], p=[0.3, 0.3, 0.4])
            volatility = np.random.uniform(0.003, 0.008)

        drift = regime * 0.0004
        ret = drift + np.random.normal(0, volatility)
        # Occasional spikes (crypto flash moves)
        if np.random.random() < 0.02:
            ret += np.random.choice([-1, 1]) * np.random.uniform(0.01, 0.025)
        returns.append(ret)

    close = np.zeros(bars)
    close[0] = base_price
    for i in range(1, bars):
        close[i] = close[i - 1] * (1 + returns[i])

    high = np.zeros(bars)
    low = np.zeros(bars)
    open_ = np.zeros(bars)
    volume = np.zeros(bars)

    open_[0] = close[0] * 0.999
    for i in range(1, bars):
        open_[i] = close[i - 1] + np.random.normal(0, 20)

    for i in range(bars):
        spread = abs(close[i] - open_[i])
        wick_up = np.random.exponential(max(spread * 0.6, 50))
        wick_down = np.random.exponential(max(spread * 0.6, 50))
        high[i] = max(open_[i], close[i]) + wick_up
        low[i] = min(open_[i], close[i]) - wick_down
        volume[i] = int(np.random.lognormal(10, 1.0))

    # 24/7 crypto market - continuous hourly candles
    timestamps = pd.date_range(start="2026-02-15", periods=bars, freq="h")

    df = pd.DataFrame({
        "Open": open_,
        "High": high,
        "Low": low,
        "Close": close,
        "Volume": volume.astype(int),
    }, index=pd.DatetimeIndex(timestamps, name="Datetime"))

    return df
