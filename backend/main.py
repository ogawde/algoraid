import os
import pandas as pd
from typing import Dict, List
from datetime import datetime

from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from backtest import download_data_yfinance, execute_strategy, calculate_performance
import os


load_dotenv()

app = FastAPI(
    title=" FastAPI Backend",
    version="0.1.0",
)


@app.get("/")
def root():
    return {"message": "FastAPI is running 🎉"}


@app.get("/health")
def health():
    return {"status": "ok"}


class DownloadRequest(BaseModel):
    ticker: str
    start_date: str
    end_date: str


class StrategyRequest(BaseModel):
    code: str
    data: List[Dict]  


class PerformanceRequest(BaseModel):
    data: List[Dict] 
    initial_cash: float = 10000.0

@app.post("/download")
def download(req: DownloadRequest):
    df = download_data_yfinance(req.ticker, req.start_date, req.end_date)
    return df.to_dict(orient="records")


@app.post("/run-strategy")
def run_strategy(req: StrategyRequest):
    df = pd.DataFrame(req.data)
    result_df = execute_strategy(req.code, df)
    return result_df.to_dict(orient="records")


@app.post("/performance")
def performance(req: PerformanceRequest):
    df = pd.DataFrame(req.data)
    result = calculate_performance(df, req.initial_cash)
    return result