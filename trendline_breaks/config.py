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
POSITION_SIZE_PCT = 0.25   # 25% of capital per trade

# Improved Strategy V2 Settings
EMA_FAST = 20              # Fast EMA period (trend direction)
EMA_SLOW = 50              # Slow EMA period (trend direction)
ADX_PERIOD = 14            # ADX period (trend strength)
ADX_THRESHOLD = 20.0       # Min ADX to confirm trending market
RSI_PERIOD = 14            # RSI period
RSI_OVERBOUGHT = 70.0      # Skip long entries above this RSI
RSI_OVERSOLD = 30.0        # Skip short entries below this RSI
ATR_SL_MULT = 1.5          # ATR multiplier for stop loss
TRAIL_ATR_MULT = 2.5       # ATR multiplier for trailing stop
ALLOW_SHORT = True          # Enable short selling
