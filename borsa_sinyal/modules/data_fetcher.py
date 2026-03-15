"""yfinance ile OHLCV veri çekme modülü."""

import logging

import pandas as pd
import yfinance as yf

logger = logging.getLogger(__name__)


def fetch_ohlcv(
    symbol: str,
    interval: str = "1h",
    period: str = "60d",
) -> pd.DataFrame:
    """
    yfinance ile OHLCV verisini çeker.

    Args:
        symbol: Hisse/endeks sembolü (örn: "QQQ", "AAPL", "^NDX")
        interval: Mum periyodu ("1h", "1d", "5m", vb.)
        period: Geçmiş veri süresi ("60d", "1mo", "1y", vb.)
                Not: 1h interval için yfinance max 730 gün destekler.

    Returns:
        OHLCV DataFrame (Date, Open, High, Low, Close, Volume)
    """
    logger.info("[%s] %s periyodunda %s verisi çekiliyor...", symbol, interval, period)

    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=interval)

    if df.empty:
        raise ValueError(
            f"[{symbol}] Veri çekilemedi. Sembol veya parametreleri kontrol edin. "
            f"(interval={interval}, period={period})"
        )

    # Kolon isimlerini standartlaştır
    df = df.reset_index()

    # yfinance "Datetime" veya "Date" döndürebilir
    date_col = "Datetime" if "Datetime" in df.columns else "Date"
    df = df.rename(columns={date_col: "Date"})

    # Sadece gerekli kolonları tut
    required = ["Date", "Open", "High", "Low", "Close", "Volume"]
    for col in required:
        if col not in df.columns:
            raise ValueError(f"[{symbol}] Beklenen kolon bulunamadı: {col}")

    df = df[required].copy()
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values("Date").reset_index(drop=True)

    logger.info("[%s] %d mum verisi çekildi. Son mum: %s", symbol, len(df), df["Date"].iloc[-1])
    return df


def fetch_multiple(
    symbols: list[str],
    interval: str = "1h",
    period: str = "60d",
) -> dict[str, pd.DataFrame]:
    """Birden fazla sembol için veri çeker."""
    results = {}
    for symbol in symbols:
        try:
            results[symbol] = fetch_ohlcv(symbol, interval, period)
        except Exception as e:
            logger.error("[%s] Veri çekme hatası: %s", symbol, e)
    return results
