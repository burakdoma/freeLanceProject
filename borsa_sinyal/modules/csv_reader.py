"""CSV dosyası okuma ve kolon normalizasyon modülü."""

import pandas as pd
from pathlib import Path

# Türkçe -> İngilizce kolon eşleştirmesi
COLUMN_MAP = {
    "tarih": "Date",
    "açılış": "Open",
    "acilis": "Open",
    "yüksek": "High",
    "yuksek": "High",
    "düşük": "Low",
    "dusuk": "Low",
    "kapanış": "Close",
    "kapanis": "Close",
    "hacim": "Volume",
}

REQUIRED_COLUMNS = {"Date", "Open", "High", "Low", "Close", "Volume"}


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Kolon isimlerini standart İngilizce formata çevirir."""
    renamed = {}
    for col in df.columns:
        key = col.strip().lower()
        if key in COLUMN_MAP:
            renamed[col] = COLUMN_MAP[key]
        else:
            # Zaten İngilizce olan kolonları capitalize et
            capitalized = col.strip().capitalize()
            if capitalized in REQUIRED_COLUMNS:
                renamed[col] = capitalized
    if renamed:
        df = df.rename(columns=renamed)
    return df


def validate_columns(df: pd.DataFrame) -> None:
    """Gerekli kolonların varlığını kontrol eder."""
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(
            f"CSV dosyasında eksik kolonlar: {', '.join(sorted(missing))}. "
            f"Beklenen kolonlar: {', '.join(sorted(REQUIRED_COLUMNS))}"
        )


def read_csv(file_path: str) -> pd.DataFrame:
    """CSV dosyasını okur, kolonları normalize eder ve doğrular."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"CSV dosyası bulunamadı: {file_path}")
    if not path.suffix.lower() == ".csv":
        raise ValueError(f"Dosya CSV formatında değil: {file_path}")

    df = pd.read_csv(file_path)
    if df.empty:
        raise ValueError(f"CSV dosyası boş: {file_path}")

    df = normalize_columns(df)
    validate_columns(df)

    # Tarih kolonunu parse et
    df["Date"] = pd.to_datetime(df["Date"], dayfirst=False, errors="coerce")
    df = df.sort_values("Date").reset_index(drop=True)

    # Sayısal kolonları dönüştür
    for col in ["Open", "High", "Low", "Close", "Volume"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def scan_csv_folder(folder_path: str) -> list[str]:
    """Klasördeki tüm CSV dosyalarının yollarını döndürür."""
    folder = Path(folder_path)
    if not folder.is_dir():
        raise NotADirectoryError(f"Klasör bulunamadı: {folder_path}")
    return sorted(str(f) for f in folder.glob("*.csv"))
