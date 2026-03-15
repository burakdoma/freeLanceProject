"""Telegram Bot API entegrasyon modülü."""

import logging

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
        f"{emoji} {result.signal} Signal\n"
        f"━━━━━━━━━━━━━━━━━━\n"
        f"Symbol: {result.symbol}\n"
        f"Date: {result.date}\n"
        f"Interval: {result.interval}\n"
        f"Close: {result.close:.2f}\n"
        f"Volume: {result.volume:,.0f}\n"
        f"Avg Volume: {result.avg_volume:,.0f}\n"
        f"Signal: {result.signal}\n"
        f"Reason: {result.reason}\n"
        f"━━━━━━━━━━━━━━━━━━\n"
        f"⚠️ Not investment advice."
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
