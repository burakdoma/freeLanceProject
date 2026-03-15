"""Tekrar mesaj engelleme için state yönetim modülü."""

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

DEFAULT_STATE_FILE = "signal_state.json"


def load_state(state_file: str = DEFAULT_STATE_FILE) -> dict:
    """State dosyasını okur."""
    path = Path(state_file)
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        logger.warning("State dosyası okunamadı, sıfırlanıyor: %s", e)
        return {}


def save_state(state: dict, state_file: str = DEFAULT_STATE_FILE) -> None:
    """State dosyasını yazar."""
    path = Path(state_file)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")


def is_already_sent(
    state: dict,
    symbol: str,
    date: str,
    signal: str,
) -> bool:
    """Aynı gün aynı sinyalin daha önce gönderilip gönderilmediğini kontrol eder."""
    key = f"{symbol}_{date}"
    return state.get(key) == signal


def mark_as_sent(
    state: dict,
    symbol: str,
    date: str,
    signal: str,
) -> dict:
    """Sinyali gönderildi olarak işaretler."""
    key = f"{symbol}_{date}"
    state[key] = signal
    return state
