import os
import pandas as pd
from typing import Dict, List
from datetime import datetime


try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False





def download_data_yfinance(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    """Download historical stock data using yfinance (fallback)"""
    if not YFINANCE_AVAILABLE:
        raise ImportError("yfinance issue")
    
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(start=start_date, end=end_date)
        
        if df.empty:
            raise ValueError(f"No data found for ticker {ticker} in date range {start_date} to {end_date}")
        
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


def execute_strategy(code: str, df: pd.DataFrame) -> pd.DataFrame:
    df_copy = df.copy()
    namespace = {'df': df_copy, 'pd': pd}
    exec(code, namespace)
    
    if 'strategy' not in namespace:
        raise ValueError("Strategy code must define a function named 'strategy'")
    
    strategy_func = namespace['strategy']
    result_df = strategy_func(df_copy)
    
    if 'Signal' not in result_df.columns:
        raise ValueError("Strategy function must return a dataframe with a 'Signal' column")
    
    return result_df
