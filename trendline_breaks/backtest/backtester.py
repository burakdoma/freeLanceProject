"""
Backtesting module for Trendlines with Breaks strategy.
"""

import pandas as pd
import numpy as np


class BacktestResult:
    def __init__(self, trades: list[dict], equity_curve: pd.Series,
                 initial_capital: float):
        self.trades = trades
        self.equity_curve = equity_curve
        self.initial_capital = initial_capital

    @property
    def total_trades(self) -> int:
        return len(self.trades)

    @property
    def winning_trades(self) -> int:
        return sum(1 for t in self.trades if t["pnl"] > 0)

    @property
    def losing_trades(self) -> int:
        return sum(1 for t in self.trades if t["pnl"] <= 0)

    @property
    def win_rate(self) -> float:
        if self.total_trades == 0:
            return 0.0
        return self.winning_trades / self.total_trades * 100

    @property
    def total_pnl(self) -> float:
        return sum(t["pnl"] for t in self.trades)

    @property
    def total_return_pct(self) -> float:
        return self.total_pnl / self.initial_capital * 100

    @property
    def max_drawdown_pct(self) -> float:
        if self.equity_curve.empty:
            return 0.0
        peak = self.equity_curve.cummax()
        drawdown = (self.equity_curve - peak) / peak * 100
        return drawdown.min()

    def summary(self) -> str:
        return (
            f"=== Backtest Summary ===\n"
            f"Total Trades:    {self.total_trades}\n"
            f"Winning:         {self.winning_trades}\n"
            f"Losing:          {self.losing_trades}\n"
            f"Win Rate:        {self.win_rate:.1f}%\n"
            f"Total P&L:       ${self.total_pnl:,.2f}\n"
            f"Total Return:    {self.total_return_pct:.2f}%\n"
            f"Max Drawdown:    {self.max_drawdown_pct:.2f}%\n"
            f"Final Capital:   ${self.equity_curve.iloc[-1]:,.2f}"
        )


def run_backtest(df: pd.DataFrame, signals: pd.DataFrame,
                 initial_capital: float = 10000.0,
                 position_size_pct: float = 0.1) -> BacktestResult:
    """
    Run backtest on trendline break signals.

    Strategy:
    - upper_break (bullish): BUY
    - lower_break (bearish): SELL / close long position

    Args:
        df: OHLCV data
        signals: Output from compute_trendlines()
        initial_capital: Starting capital
        position_size_pct: Fraction of capital per trade
    """
    capital = initial_capital
    position = 0.0  # shares held
    entry_price = 0.0
    trades = []
    equity = []

    for i in range(len(df)):
        close = df["Close"].iloc[i]
        date = df.index[i]

        # Buy signal
        if signals["upper_break"].iloc[i] and position == 0:
            invest = capital * position_size_pct
            position = invest / close
            entry_price = close
            capital -= invest

        # Sell signal
        elif signals["lower_break"].iloc[i] and position > 0:
            sell_value = position * close
            pnl = sell_value - (position * entry_price)
            trades.append({
                "entry_date": trades[-1]["entry_date"] if trades and "exit_date" not in trades[-1] else date,
                "exit_date": date,
                "entry_price": entry_price,
                "exit_price": close,
                "shares": position,
                "pnl": pnl,
            })
            capital += sell_value
            position = 0.0
            entry_price = 0.0

        # Track equity
        portfolio_value = capital + (position * close)
        equity.append(portfolio_value)

    # Fix entry dates for trades
    # Re-run to get proper entry dates
    trades_clean = []
    pos = 0.0
    cap = initial_capital
    e_price = 0.0
    e_date = None

    for i in range(len(df)):
        close = df["Close"].iloc[i]
        date = df.index[i]

        if signals["upper_break"].iloc[i] and pos == 0:
            invest = cap * position_size_pct
            pos = invest / close
            e_price = close
            e_date = date
            cap -= invest

        elif signals["lower_break"].iloc[i] and pos > 0:
            sell_value = pos * close
            pnl = sell_value - (pos * e_price)
            trades_clean.append({
                "entry_date": e_date,
                "exit_date": date,
                "entry_price": e_price,
                "exit_price": close,
                "shares": pos,
                "pnl": pnl,
            })
            cap += sell_value
            pos = 0.0

    equity_series = pd.Series(equity, index=df.index)
    return BacktestResult(trades_clean, equity_series, initial_capital)
