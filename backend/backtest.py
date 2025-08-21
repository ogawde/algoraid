import os
import pandas as pd
from typing import Dict

try:
    from twelvedata import TDClient
    TWELVE_DATA_AVAILABLE = True
except ImportError:
    TWELVE_DATA_AVAILABLE = False

try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False


def download_data_twelvedata(ticker: str, start_date: str, end_date: str, api_key: str) -> pd.DataFrame:
    if not TWELVE_DATA_AVAILABLE:
        raise ImportError(
            "twelvedata package not installed. Install with: pip install twelvedata")

    td = TDClient(apikey=api_key)

    try:
        ts = td.time_series(
            symbol=ticker,
            interval="1day",
            start_date=start_date,
            end_date=end_date,
            outputsize=5000
        )

        df = ts.as_pandas()

        if df.empty:
            raise ValueError(
                f"No data found for ticker {ticker} in date range {start_date} to {end_date}")

        df.reset_index(inplace=True)
        df.columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']
        df['Date'] = pd.to_datetime(df['Date'])

        return df[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']]

    except Exception as e:
        raise ValueError(f"Failed to fetch data from Twelve Data: {str(e)}")


def download_data_yfinance(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    if not YFINANCE_AVAILABLE:
        raise ImportError(
            "yfinance package not installed. Install with: pip install yfinance")

    try:
        stock = yf.Ticker(ticker)
        df = stock.history(start=start_date, end=end_date)

        if df.empty:
            raise ValueError(
                f"No data found for ticker {ticker} in date range {start_date} to {end_date}")

        df.reset_index(inplace=True)
        df.columns = [col.replace(' ', '_') for col in df.columns]

        if 'Date' not in df.columns and 'Datetime' in df.columns:
            df['Date'] = df['Datetime']

        required_cols = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column: {col}")

        return df[required_cols]

    except Exception as e:
        raise ValueError(f"Failed to fetch data from yfinance: {str(e)}")


def download_data(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    api_key = os.getenv('TWELVE_DATA_API_KEY')

    if api_key and TWELVE_DATA_AVAILABLE:
        try:
            return download_data_twelvedata(ticker, start_date, end_date, api_key)
        except Exception as e:
            print(f"Twelve Data failed: {e}, falling back to yfinance...")

    if YFINANCE_AVAILABLE:
        return download_data_yfinance(ticker, start_date, end_date)
    else:
        raise ImportError(
            "No data source available. Either:\n"
            "1. Set TWELVE_DATA_API_KEY environment variable and install: pip install twelvedata\n"
            "2. Or install yfinance: pip install yfinance"
        )


def execute_strategy(code: str, df: pd.DataFrame) -> pd.DataFrame:
    df_copy = df.copy()
    namespace = {'df': df_copy, 'pd': pd}
    exec(code, namespace)

    if 'strategy' not in namespace:
        raise ValueError(
            "Strategy code must define a function named 'strategy'")

    strategy_func = namespace['strategy']
    result_df = strategy_func(df_copy)

    if 'Signal' not in result_df.columns:
        raise ValueError(
            "Strategy function must return a dataframe with a 'Signal' column")

    return result_df


def calculate_performance(df_with_signals: pd.DataFrame, initial_cash: float = 10000.0) -> Dict:
    cash = initial_cash
    shares = 0.0
    trades = []
    portfolio_values = []
    max_portfolio_value = initial_cash
    max_drawdown = 0.0

    for idx, row in df_with_signals.iterrows():
        signal = row['Signal']
        price = row['Close']
        date = row['Date']

        if signal == 1 and shares == 0:
            shares = cash / price
            cash = 0.0
            trades.append({
                'date': date.strftime('%Y-%m-%d') if hasattr(date, 'strftime') else str(date),
                'action': 'Buy',
                'price': round(price, 2),
                'shares': round(shares, 4)
            })
        elif signal == -1 and shares > 0:
            shares_to_sell = shares
            cash = shares * price
            shares = 0.0
            trades.append({
                'date': date.strftime('%Y-%m-%d') if hasattr(date, 'strftime') else str(date),
                'action': 'Sell',
                'price': round(price, 2),
                'shares': round(shares_to_sell, 4)
            })

        portfolio_value = cash + (shares * price)
        portfolio_values.append({
            'date': date.strftime('%Y-%m-%d') if hasattr(date, 'strftime') else str(date),
            'value': round(portfolio_value, 2)
        })

        if portfolio_value > max_portfolio_value:
            max_portfolio_value = portfolio_value

        drawdown = ((max_portfolio_value - portfolio_value) /
                    max_portfolio_value) * 100
        if drawdown > max_drawdown:
            max_drawdown = drawdown

    final_value = cash + (shares * df_with_signals.iloc[-1]['Close'])
    total_return = ((final_value - initial_cash) / initial_cash) * 100

    winning_trades = 0
    losing_trades = 0
    buy_trades = [t for t in trades if t['action'] == 'Buy']
    sell_trades = [t for t in trades if t['action'] == 'Sell']

    for i in range(min(len(buy_trades), len(sell_trades))):
        buy_price = buy_trades[i]['price']
        sell_price = sell_trades[i]['price']
        if sell_price > buy_price:
            winning_trades += 1
        else:
            losing_trades += 1

    total_trade_pairs = winning_trades + losing_trades
    win_rate = (winning_trades / total_trade_pairs *
                100) if total_trade_pairs > 0 else 0

    return {
        'trades': trades,
        'portfolio_values': portfolio_values,
        'metrics': {
            'total_return': round(total_return, 2),
            'total_trades': len(trades),
            'win_rate': round(win_rate, 2),
            'max_drawdown': round(max_drawdown, 2),
            'final_value': round(final_value, 2),
            'initial_cash': initial_cash
        }
    }
