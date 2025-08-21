from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import database
import backtest

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database.init_db()


class StrategyRequest(BaseModel):
    name: str
    code: str
    ticker: str
    start_date: str
    end_date: str


@app.post("/api/strategies")
async def create_strategy(request: StrategyRequest):
    try:
        strategy_id = database.save_strategy(request.name, request.code)
        df = backtest.download_data(request.ticker, request.start_date, request.end_date)
        df_with_signals = backtest.execute_strategy(request.code, df)
        result = backtest.calculate_performance(df_with_signals)
        backtest_id = database.save_backtest(
            strategy_id,
            request.ticker,
            request.start_date,
            request.end_date,
            result
        )
        return {
            "backtest_id": backtest_id,
            "strategy_id": strategy_id,
            "results": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/strategies")
async def get_strategies():
    try:
        strategies = database.list_strategies()
        return strategies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/backtests")
async def get_backtests():
    try:
        backtests = database.list_backtests()
        return backtests
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/backtest/{backtest_id}")
async def get_backtest(backtest_id: int):
    try:
        backtest_data = database.get_backtest(backtest_id)
        if not backtest_data:
            raise HTTPException(status_code=404, detail="Backtest not found")
        return backtest_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

