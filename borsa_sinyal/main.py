"""
Borsa Sinyal Üreteci - Ana Çalışma Modülü

Gün sonu borsa verisini CSV'den okuyup teknik seviyelere göre
AL / SAT / ZAYIFLAMA sinyali üretir ve Telegram'a bildirim gönderir.

Kullanım:
    python main.py --csv data/THYAO.csv --symbol THYAO --token BOT_TOKEN --chat-id CHAT_ID
    python main.py --folder data/ --token BOT_TOKEN --chat-id CHAT_ID
    python main.py --csv data/THYAO.csv --symbol THYAO --dry-run

Bu uygulama yatırım tavsiyesi vermez.
Sadece önceden tanımlanmış teknik seviye ve hacim koşullarına göre otomatik alarm üretir.
"""

import argparse
import json
import logging
import sys
from pathlib import Path

from modules.csv_reader import read_csv, scan_csv_folder
from modules.signal_engine import generate_signal, DEFAULT_LEVELS
from modules.telegram_bot import send_signal, send_error, format_message
from modules.state_manager import load_state, save_state, is_already_sent, mark_as_sent

# Logging yapılandırması
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_DIR / "borsa_sinyal.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)


def process_single_csv(
    csv_path: str,
    symbol: str,
    bot_token: str | None,
    chat_id: str | None,
    state: dict,
    state_file: str,
    levels: dict | None = None,
    dry_run: bool = False,
) -> dict:
    """Tek bir CSV dosyasını işler, sinyal üretir ve gerekirse Telegram'a gönderir."""
    try:
        df = read_csv(csv_path)
        result = generate_signal(df, symbol, levels)

        logger.info(
            "[%s] %s - Kapanış: %.2f, Sinyal: %s",
            symbol, result.date, result.close, result.signal,
        )

        # NO_SIGNAL ise mesaj gönderme
        if result.signal == "NO_SIGNAL":
            logger.info("[%s] Sinyal yok, mesaj gönderilmeyecek.", symbol)
            print(format_message(result))
            return state

        # Tekrar kontrolü
        if is_already_sent(state, symbol, result.date, result.signal):
            logger.info(
                "[%s] %s tarihli %s sinyali zaten gönderilmiş.",
                symbol, result.date, result.signal,
            )
            return state

        # Mesaj gönder
        if dry_run:
            print("\n--- DRY RUN (Telegram'a gönderilmedi) ---")
            print(format_message(result))
            print("--- DRY RUN SON ---\n")
        elif bot_token and chat_id:
            success = send_signal(bot_token, chat_id, result)
            if success:
                state = mark_as_sent(state, symbol, result.date, result.signal)
                save_state(state, state_file)
                logger.info("[%s] Sinyal Telegram'a gönderildi.", symbol)
            else:
                logger.error("[%s] Telegram mesajı gönderilemedi!", symbol)
        else:
            print(format_message(result))
            logger.warning("[%s] Bot token/chat_id belirtilmedi, sadece konsola yazdırıldı.", symbol)

        return state

    except Exception as e:
        error_msg = f"[{symbol}] Hata: {e}"
        logger.error(error_msg)
        if bot_token and chat_id and not dry_run:
            send_error(bot_token, chat_id, str(e), symbol)
        return state


def run(args: argparse.Namespace) -> None:
    """Ana çalışma fonksiyonu."""
    state_file = args.state_file
    state = load_state(state_file)

    # Seviye ayarları
    levels = None
    if args.levels:
        try:
            levels = json.loads(args.levels)
        except json.JSONDecodeError as e:
            logger.error("Seviye JSON parse hatası: %s", e)
            sys.exit(1)

    bot_token = args.token
    chat_id = args.chat_id

    if args.folder:
        # Klasördeki tüm CSV'leri tara
        csv_files = scan_csv_folder(args.folder)
        if not csv_files:
            logger.warning("Klasörde CSV dosyası bulunamadı: %s", args.folder)
            return
        logger.info("%d CSV dosyası bulundu.", len(csv_files))
        for csv_path in csv_files:
            symbol = Path(csv_path).stem.upper()
            state = process_single_csv(
                csv_path, symbol, bot_token, chat_id,
                state, state_file, levels, args.dry_run,
            )
    elif args.csv:
        symbol = args.symbol or Path(args.csv).stem.upper()
        state = process_single_csv(
            args.csv, symbol, bot_token, chat_id,
            state, state_file, levels, args.dry_run,
        )
    else:
        logger.error("--csv veya --folder parametresi belirtilmeli.")
        sys.exit(1)


def parse_args() -> argparse.Namespace:
    """Komut satırı argümanlarını parse eder."""
    parser = argparse.ArgumentParser(
        description="Borsa Sinyal Üreteci - Teknik seviye ve hacim koşullarına göre sinyal üretir.",
    )
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--csv", help="CSV dosya yolu")
    source.add_argument("--folder", help="CSV dosyalarının bulunduğu klasör")

    parser.add_argument("--symbol", help="Hisse sembolü (belirtilmezse dosya adından alınır)")
    parser.add_argument("--token", help="Telegram Bot token")
    parser.add_argument("--chat-id", help="Telegram chat ID")
    parser.add_argument("--state-file", default="signal_state.json", help="State dosyası yolu")
    parser.add_argument(
        "--levels",
        help='Seviye ayarları JSON formatında. Örnek: \'{"buy_level": 13.90, "weakness_level": 12.95, "sell_level": 12.42}\'',
    )
    parser.add_argument("--dry-run", action="store_true", help="Telegram'a göndermeden test et")

    return parser.parse_args()


if __name__ == "__main__":
    logger.info("Borsa Sinyal Üreteci başlatılıyor...")
    run(parse_args())
    logger.info("İşlem tamamlandı.")
