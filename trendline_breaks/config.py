# Trendlines with Breaks - Configuration
# Based on LuxAlgo Pine Script indicator

# Indicator Settings
SWING_LOOKBACK = 14        # Swing Detection Lookback (Pine: length)
SLOPE_MULT = 1.0           # Slope multiplier (Pine: mult)
SLOPE_METHOD = "atr"       # Options: "atr", "stdev", "linreg"

# Data Settings
DEFAULT_SYMBOL = "AAPL"
DEFAULT_INTERVAL = "1d"    # 1m, 5m, 15m, 1h, 1d, 1wk
DEFAULT_PERIOD = "1y"      # 1mo, 3mo, 6mo, 1y, 2y, 5y

# Live Signal Settings
WATCHLIST = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
CHECK_INTERVAL_MINUTES = 15

# Backtest Settings
INITIAL_CAPITAL = 10000.0
POSITION_SIZE_PCT = 0.1    # %10 of capital per trade
