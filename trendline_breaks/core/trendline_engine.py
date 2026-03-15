"""
Trendlines with Breaks Engine
Python implementation of LuxAlgo's Pine Script indicator.
"""

import numpy as np
import pandas as pd


def pivot_high(high: pd.Series, lookback: int) -> pd.Series:
    """Detect pivot highs (swing highs)."""
    result = pd.Series(np.nan, index=high.index)
    for i in range(lookback, len(high) - lookback):
        window = high.iloc[i - lookback: i + lookback + 1]
        if high.iloc[i] == window.max():
            result.iloc[i] = high.iloc[i]
    return result


def pivot_low(low: pd.Series, lookback: int) -> pd.Series:
    """Detect pivot lows (swing lows)."""
    result = pd.Series(np.nan, index=low.index)
    for i in range(lookback, len(low) - lookback):
        window = low.iloc[i - lookback: i + lookback + 1]
        if low.iloc[i] == window.min():
            result.iloc[i] = low.iloc[i]
    return result


def calc_slope(df: pd.DataFrame, method: str, length: int, mult: float) -> pd.Series:
    """
    Calculate slope using one of three methods.
    Pine Script equivalent of the slope switch statement.
    """
    close = df["Close"]

    if method == "atr":
        tr = pd.concat([
            df["High"] - df["Low"],
            (df["High"] - close.shift(1)).abs(),
            (df["Low"] - close.shift(1)).abs()
        ], axis=1).max(axis=1)
        atr = tr.rolling(window=length).mean()
        return atr / length * mult

    elif method == "stdev":
        stdev = close.rolling(window=length).std()
        return stdev / length * mult

    elif method == "linreg":
        n = pd.Series(range(len(close)), index=close.index, dtype=float)
        sma_cn = (close * n).rolling(window=length).mean()
        sma_c = close.rolling(window=length).mean()
        sma_n = n.rolling(window=length).mean()
        var_n = n.rolling(window=length).var()
        slope = (sma_cn - sma_c * sma_n).abs() / var_n / 2 * mult
        return slope

    else:
        raise ValueError(f"Unknown method: {method}. Use 'atr', 'stdev', or 'linreg'.")


def compute_trendlines(df: pd.DataFrame, length: int = 14, mult: float = 1.0,
                       method: str = "atr") -> pd.DataFrame:
    """
    Main computation: generates trendlines and breakout signals.

    Returns DataFrame with columns:
        - upper: upper trendline values
        - lower: lower trendline values
        - upper_break: True when price breaks above down-trendline
        - lower_break: True when price breaks below up-trendline
        - slope_ph: slope at last pivot high
        - slope_pl: slope at last pivot low
    """
    df = df.copy()

    ph = pivot_high(df["High"], length)
    pl = pivot_low(df["Low"], length)
    slope = calc_slope(df, method, length, mult)

    upper = pd.Series(np.nan, index=df.index)
    lower = pd.Series(np.nan, index=df.index)
    slope_ph = pd.Series(0.0, index=df.index)
    slope_pl = pd.Series(0.0, index=df.index)
    upos = pd.Series(0, index=df.index)
    dnos = pd.Series(0, index=df.index)

    for i in range(1, len(df)):
        # Update slope when pivot is detected
        if not np.isnan(ph.iloc[i]):
            slope_ph.iloc[i] = slope.iloc[i]
        else:
            slope_ph.iloc[i] = slope_ph.iloc[i - 1]

        if not np.isnan(pl.iloc[i]):
            slope_pl.iloc[i] = slope.iloc[i]
        else:
            slope_pl.iloc[i] = slope_pl.iloc[i - 1]

        # Update trendlines
        if not np.isnan(ph.iloc[i]):
            upper.iloc[i] = ph.iloc[i]
        else:
            prev_upper = upper.iloc[i - 1]
            upper.iloc[i] = prev_upper - slope_ph.iloc[i] if not np.isnan(prev_upper) else np.nan

        if not np.isnan(pl.iloc[i]):
            lower.iloc[i] = pl.iloc[i]
        else:
            prev_lower = lower.iloc[i - 1]
            lower.iloc[i] = prev_lower + slope_pl.iloc[i] if not np.isnan(prev_lower) else np.nan

        # Breakout detection
        close = df["Close"].iloc[i]

        if not np.isnan(ph.iloc[i]):
            upos.iloc[i] = 0
        elif not np.isnan(upper.iloc[i]) and close > upper.iloc[i] - slope_ph.iloc[i] * length:
            upos.iloc[i] = 1
        else:
            upos.iloc[i] = upos.iloc[i - 1]

        if not np.isnan(pl.iloc[i]):
            dnos.iloc[i] = 0
        elif not np.isnan(lower.iloc[i]) and close < lower.iloc[i] + slope_pl.iloc[i] * length:
            dnos.iloc[i] = 1
        else:
            dnos.iloc[i] = dnos.iloc[i - 1]

    # Breakout signals: transition from 0 to 1
    upper_break = (upos > upos.shift(1))
    lower_break = (dnos > dnos.shift(1))

    result = pd.DataFrame({
        "upper": upper,
        "lower": lower,
        "slope_ph": slope_ph,
        "slope_pl": slope_pl,
        "upper_break": upper_break,
        "lower_break": lower_break,
    }, index=df.index)

    return result
