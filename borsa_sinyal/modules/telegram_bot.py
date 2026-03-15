"""Telegram Bot API entegrasyon modülü."""

import logging
from urllib.parse import quote

import requests

from .signal_engine import SignalResult

logger = logging.getLogger(__name__)

SIGNAL_EMOJI = {
    "BUY": "🟢",
    "SELL": "🔴",
    "WEAKNESS": "🟡",
    "NO_SIGNAL": "⚪",
}


def format_message(result: SignalResult) -> str:
    """Sinyal sonucunu Telegram mesaj formatına çevirir."""
    emoji = SIGNAL_EMOJI.get(result.signal, "⚪")
    return (
        f"{emoji} {result.signal} Sinyali\n"
        f"━━━━━━━━━━━━━━━━━━\n"
        f"Sembol: {result.symbol}\n"
        f"Tarih: {result.date}\n"
        f"Kapanış: {result.close:.2f}\n"
        f"Hacim: {result.volume:,.0f}\n"
        f"45G Ort. Hacim: {result.avg_volume_45:,.0f}\n"
        f"Sinyal: {result.signal}\n"
        f"Neden: {result.reason}\n"
        f"━━━━━━━━━━━━━━━━━━\n"
        f"⚠️ Bu yatırım tavsiyesi değildir."
    )


def format_error_message(error: str, symbol: str = "") -> str:
    """Hata mesajını Telegram formatına çevirir."""
    prefix = f"[{symbol}] " if symbol else ""
    return f"❌ HATA {prefix}\n{error}"


def send_telegram_message(
    bot_token: str,
    chat_id: str,
    message: str,
    timeout: int = 10,
) -> bool:
    """Telegram Bot API ile mesaj gönderir."""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML",
    }
    try:
        response = requests.post(url, json=payload, timeout=timeout)
        response.raise_for_status()
        logger.info("Telegram mesajı gönderildi (chat_id=%s)", chat_id)
        return True
    except requests.RequestException as e:
        logger.error("Telegram mesaj gönderilemedi: %s", e)
        return False


def send_signal(
    bot_token: str,
    chat_id: str,
    result: SignalResult,
) -> bool:
    """Sinyal sonucunu Telegram'a gönderir."""
    message = format_message(result)
    return send_telegram_message(bot_token, chat_id, message)


def send_error(
    bot_token: str,
    chat_id: str,
    error: str,
    symbol: str = "",
) -> bool:
    """Hata mesajını Telegram'a gönderir."""
    message = format_error_message(error, symbol)
    return send_telegram_message(bot_token, chat_id, message)
