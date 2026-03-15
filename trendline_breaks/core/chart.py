"""
Chart module - visualize trendlines and breakout signals.
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates


def plot_trendlines(df: pd.DataFrame, signals: pd.DataFrame,
                    symbol: str = "", save_path: str | None = None):
    """
    Plot price chart with trendlines and breakout markers.

    Args:
        df: OHLCV DataFrame
        signals: Output from compute_trendlines()
        symbol: Ticker symbol for the title
        save_path: If provided, save chart to this path instead of showing
    """
    fig, ax = plt.subplots(figsize=(14, 7))

    # Price
    ax.plot(df.index, df["Close"], color="white", linewidth=1, label="Close", alpha=0.9)

    # Trendlines
    ax.plot(df.index, signals["upper"], color="teal", linewidth=1.5,
            label="Upper Trendline (resistance)", linestyle="--")
    ax.plot(df.index, signals["lower"], color="red", linewidth=1.5,
            label="Lower Trendline (support)", linestyle="--")

    # Breakout markers
    bull_breaks = df.index[signals["upper_break"]]
    bear_breaks = df.index[signals["lower_break"]]

    if len(bull_breaks) > 0:
        ax.scatter(bull_breaks, df.loc[bull_breaks, "Low"] * 0.995,
                   marker="^", color="teal", s=100, zorder=5, label="Bullish Break")
    if len(bear_breaks) > 0:
        ax.scatter(bear_breaks, df.loc[bear_breaks, "High"] * 1.005,
                   marker="v", color="red", s=100, zorder=5, label="Bearish Break")

    # Styling
    ax.set_facecolor("#1a1a2e")
    fig.patch.set_facecolor("#16213e")
    ax.tick_params(colors="white")
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y-%m-%d"))
    ax.xaxis.set_major_locator(mdates.AutoDateLocator())
    fig.autofmt_xdate()

    ax.set_title(f"Trendlines with Breaks - {symbol}", color="white", fontsize=14)
    ax.set_ylabel("Price", color="white")
    ax.legend(loc="upper left", facecolor="#16213e", edgecolor="white",
              labelcolor="white")
    ax.grid(True, alpha=0.2, color="gray")

    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        print(f"Chart saved to {save_path}")
    else:
        plt.show()

    plt.close()
