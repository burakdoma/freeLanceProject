"""
NASDAQ 100 Signal Generator - 1H Candles

Fetches 1-hour OHLCV data via yfinance, generates BUY/SELL/WEAKNESS signals
based on predefined technical levels and volume conditions, and sends
alerts via Telegram.

Usage:
    # Fetch live data from yfinance
    python main.py --symbol QQQ --dry-run
    python main.py --symbol QQQ --token BOT_TOKEN --chat-id CHAT_ID
    python main.py --symbols QQQ AAPL MSFT --dry-run

    # Use CSV file instead
    python main.py --csv data/QQQ.csv --symbol QQQ --dry-run

    # Custom levels
    python main.py --symbol QQQ --levels '{"buy_level": 490, "weakness_level": 475, "sell_level": 470}' --dry-run

Not investment advice. Automated alerts based on predefined technical levels only.
"""

import argparse
import json
import logging
import sys
from pathlib import Path

from modules.csv_reader import read_csv
from modules.data_fetcher import fetch_ohlcv
from modules.signal_engine import generate_signal, DEFAULT_LEVELS, DEFAULT_VOLUME_PERIOD
from modules.telegram_bot import send_signal, send_error, format_message
from modules.state_manager import load_state, save_state, is_already_sent, mark_as_sent

# Logging
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


def process_symbol(
    symbol: str,
    df,
    bot_token: str | None,
    chat_id: str | None,
    state: dict,
    state_file: str,
    levels: dict | None = None,
    volume_period: int = DEFAULT_VOLUME_PERIOD,
    interval: str = "1h",
    dry_run: bool = False,
) -> dict:
    """Bir sembolün verisini işler, sinyal üretir ve gerekirse Telegram'a gönderir."""
    try:
        result = generate_signal(df, symbol, levels, volume_period, interval)

        logger.info(
            "[%s] %s - Close: %.2f, Signal: %s",
            symbol, result.date, result.close, result.signal,
        )

        # NO_SIGNAL ise mesaj gönderme
        if result.signal == "NO_SIGNAL":
            logger.info("[%s] No signal, skipping notification.", symbol)
            print(format_message(result))
            return state

        # Tekrar kontrolü
        if is_already_sent(state, symbol, result.date, result.signal):
            logger.info(
                "[%s] %s %s signal already sent, skipping.",
                symbol, result.date, result.signal,
            )
            return state

        # Mesaj gönder
        if dry_run:
            print("\n--- DRY RUN (not sent to Telegram) ---")
            print(format_message(result))
            print("--- DRY RUN END ---\n")
        elif bot_token and chat_id:
            success = send_signal(bot_token, chat_id, result)
            if success:
                state = mark_as_sent(state, symbol, result.date, result.signal)
                save_state(state, state_file)
                logger.info("[%s] Signal sent to Telegram.", symbol)
            else:
                logger.error("[%s] Failed to send Telegram message!", symbol)
        else:
            print(format_message(result))
            logger.warning("[%s] No bot token/chat_id, printing to console only.", symbol)

        return state

    except Exception as e:
        error_msg = f"[{symbol}] Error: {e}"
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
            logger.error("Invalid levels JSON: %s", e)
            sys.exit(1)

    bot_token = args.token
    chat_id = args.chat_id
    interval = args.interval
    period = args.period
    volume_period = args.volume_period

    if args.csv:
        # CSV modunda çalış
        symbol = args.symbol or Path(args.csv).stem.upper()
        df = read_csv(args.csv)
        state = process_symbol(
            symbol, df, bot_token, chat_id,
            state, state_file, levels, volume_period, interval, args.dry_run,
        )
    else:
        # yfinance modunda çalış
        symbols = args.symbols or ([args.symbol] if args.symbol else ["QQQ"])
        for symbol in symbols:
            try:
                df = fetch_ohlcv(symbol, interval=interval, period=period)
                state = process_symbol(
                    symbol, df, bot_token, chat_id,
                    state, state_file, levels, volume_period, interval, args.dry_run,
                )
            except Exception as e:
                logger.error("[%s] Failed to fetch data: %s", symbol, e)
                if bot_token and chat_id and not args.dry_run:
                    send_error(bot_token, chat_id, str(e), symbol)


def parse_args() -> argparse.Namespace:
    """Komut satırı argümanlarını parse eder."""
    parser = argparse.ArgumentParser(
        description="NASDAQ 100 Signal Generator - Technical level & volume based alerts (1H candles)",
    )

    # Data source
    parser.add_argument("--csv", help="CSV file path (alternative to yfinance)")
    parser.add_argument("--symbol", help="Single ticker symbol (e.g. QQQ)")
    parser.add_argument("--symbols", nargs="+", help="Multiple ticker symbols (e.g. QQQ AAPL MSFT)")

    # yfinance parameters
    parser.add_argument("--interval", default="1h", help="Candle interval (default: 1h)")
    parser.add_argument("--period", default="60d", help="Data period for yfinance (default: 60d)")
    parser.add_argument(
        "--volume-period", type=int, default=DEFAULT_VOLUME_PERIOD,
        help=f"Volume average period in candles (default: {DEFAULT_VOLUME_PERIOD})",
    )

    # Telegram
    parser.add_argument("--token", help="Telegram Bot token")
    parser.add_argument("--chat-id", help="Telegram chat ID")

    # Other
    parser.add_argument("--state-file", default="signal_state.json", help="State file path")
    parser.add_argument(
        "--levels",
        help='Signal levels as JSON. Example: \'{"buy_level": 485, "weakness_level": 470.55, "sell_level": 465.60}\'',
    )
    parser.add_argument("--dry-run", action="store_true", help="Test without sending to Telegram")

    return parser.parse_args()


if __name__ == "__main__":
    logger.info("NASDAQ 100 Signal Generator starting...")
    run(parse_args())
    logger.info("Done.")
