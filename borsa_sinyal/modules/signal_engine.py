"""Teknik sinyal üretme modülü."""

from dataclasses import dataclass

import pandas as pd


@dataclass
class SignalResult:
    symbol: str
    date: str
    close: float
    volume: float
    avg_volume_45: float
    signal: str  # BUY, SELL, WEAKNESS, NO_SIGNAL
    reason: str


# Varsayılan seviyeler
DEFAULT_LEVELS = {
    "buy_level": 13.90,
    "weakness_level": 12.95,
    "sell_level": 12.42,
}


def calculate_avg_volume(df: pd.DataFrame, period: int = 45) -> float:
    """Son N günlük ortalama hacmi hesaplar."""
    if len(df) < period:
        return df["Volume"].mean()
    return df["Volume"].iloc[-period:].mean()


def generate_signal(
    df: pd.DataFrame,
    symbol: str,
    levels: dict | None = None,
    volume_period: int = 45,
) -> SignalResult:
    """Son bar için sinyal üretir."""
    if levels is None:
        levels = DEFAULT_LEVELS

    last_row = df.iloc[-1]
    close = float(last_row["Close"])
    volume = float(last_row["Volume"])
    date_str = str(last_row["Date"].date()) if hasattr(last_row["Date"], "date") else str(last_row["Date"])
    avg_vol = calculate_avg_volume(df, volume_period)

    buy_level = levels.get("buy_level", DEFAULT_LEVELS["buy_level"])
    weakness_level = levels.get("weakness_level", DEFAULT_LEVELS["weakness_level"])
    sell_level = levels.get("sell_level", DEFAULT_LEVELS["sell_level"])

    # Sinyal üretme kuralları
    if close > buy_level and volume > avg_vol:
        signal = "BUY"
        reason = (
            f"Kapanış ({close:.2f}) > {buy_level:.2f} "
            f"ve hacim ({volume:,.0f}) > 45 günlük ort. ({avg_vol:,.0f})"
        )
    elif close < sell_level:
        signal = "SELL"
        reason = f"Kapanış ({close:.2f}) < {sell_level:.2f}"
    elif close < weakness_level:
        signal = "WEAKNESS"
        reason = f"Kapanış ({close:.2f}) < {weakness_level:.2f}"
    elif close > buy_level and volume <= avg_vol:
        signal = "NO_SIGNAL"
        reason = (
            f"Kapanış ({close:.2f}) > {buy_level:.2f} "
            f"ama hacim ({volume:,.0f}) < 45 günlük ort. ({avg_vol:,.0f})"
        )
    else:
        signal = "NO_SIGNAL"
        reason = "Hiçbir koşul oluşmadı"

    return SignalResult(
        symbol=symbol,
        date=date_str,
        close=close,
        volume=volume,
        avg_volume_45=avg_vol,
        signal=signal,
        reason=reason,
    )
