"""Teknik sinyal üretme modülü - NASDAQ 100 (1H mumlar)."""

from dataclasses import dataclass

import pandas as pd


@dataclass
class SignalResult:
    symbol: str
    date: str
    close: float
    volume: float
    avg_volume: float
    signal: str  # BUY, SELL, WEAKNESS, NO_SIGNAL
    reason: str
    interval: str


# NASDAQ 100 (QQQ) varsayılan seviyeleri
DEFAULT_LEVELS = {
    "buy_level": 593.00,
    "weakness_level": 587.07,   # 593'ün %1 altı
    "sell_level": 569.28,       # 593'ün %4 altı
}

# 1H mumlar için: 7 saat/gün x 45 gün = 315 mum
DEFAULT_VOLUME_PERIOD = 315


def calculate_avg_volume(df: pd.DataFrame, period: int = DEFAULT_VOLUME_PERIOD) -> float:
    """Son N mumluk ortalama hacmi hesaplar."""
    if len(df) < period:
        return df["Volume"].mean()
    return df["Volume"].iloc[-period:].mean()


def generate_signal(
    df: pd.DataFrame,
    symbol: str,
    levels: dict | None = None,
    volume_period: int = DEFAULT_VOLUME_PERIOD,
    interval: str = "1h",
) -> SignalResult:
    """Son bar için sinyal üretir."""
    if levels is None:
        levels = DEFAULT_LEVELS

    last_row = df.iloc[-1]
    close = float(last_row["Close"])
    volume = float(last_row["Volume"])
    date_val = last_row["Date"]
    date_str = str(date_val) if not hasattr(date_val, "strftime") else date_val.strftime("%Y-%m-%d %H:%M")
    avg_vol = calculate_avg_volume(df, volume_period)

    buy_level = levels.get("buy_level", DEFAULT_LEVELS["buy_level"])
    weakness_level = levels.get("weakness_level", DEFAULT_LEVELS["weakness_level"])
    sell_level = levels.get("sell_level", DEFAULT_LEVELS["sell_level"])

    # Sinyal üretme kuralları
    if close > buy_level and volume > avg_vol:
        signal = "BUY"
        reason = (
            f"Close ({close:.2f}) > {buy_level:.2f} "
            f"& volume ({volume:,.0f}) > {volume_period}-bar avg ({avg_vol:,.0f})"
        )
    elif close < sell_level:
        signal = "SELL"
        reason = f"Close ({close:.2f}) < {sell_level:.2f}"
    elif close < weakness_level:
        signal = "WEAKNESS"
        reason = f"Close ({close:.2f}) < {weakness_level:.2f}"
    elif close > buy_level and volume <= avg_vol:
        signal = "NO_SIGNAL"
        reason = (
            f"Close ({close:.2f}) > {buy_level:.2f} "
            f"but volume ({volume:,.0f}) < {volume_period}-bar avg ({avg_vol:,.0f})"
        )
    else:
        signal = "NO_SIGNAL"
        reason = "No condition met"

    return SignalResult(
        symbol=symbol,
        date=date_str,
        close=close,
        volume=volume,
        avg_volume=avg_vol,
        signal=signal,
        reason=reason,
        interval=interval,
    )
