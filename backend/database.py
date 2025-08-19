import sqlite3
import json
from typing import List, Dict, Optional

DB_PATH = "backtests.db"


def get_connection():
    return sqlite3.connect(DB_PATH)


def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS strategies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS backtests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            strategy_id INTEGER NOT NULL,
            ticker TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            results TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (strategy_id) REFERENCES strategies(id)
        )
    """)
    
    conn.commit()
    conn.close()


def save_strategy(name: str, code: str) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO strategies (name, code) VALUES (?, ?)",
        (name, code)
    )
    strategy_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return strategy_id


def save_backtest(strategy_id: int, ticker: str, start_date: str, end_date: str, results: dict) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    results_json = json.dumps(results)
    cursor.execute(
        """INSERT INTO backtests (strategy_id, ticker, start_date, end_date, results)
           VALUES (?, ?, ?, ?, ?)""",
        (strategy_id, ticker, start_date, end_date, results_json)
    )
    backtest_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return backtest_id


def get_strategy(strategy_id: int) -> Optional[Dict]:
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM strategies WHERE id = ?", (strategy_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def get_backtest(backtest_id: int) -> Optional[Dict]:
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM backtests WHERE id = ?", (backtest_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        result = dict(row)
        result['results'] = json.loads(result['results'])
        strategy = get_strategy(result['strategy_id'])
        if strategy:
            result['strategy_name'] = strategy['name']
        return result
    return None


def list_strategies() -> List[Dict]:
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM strategies ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def list_backtests() -> List[Dict]:
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT b.*, s.name as strategy_name
        FROM backtests b
        JOIN strategies s ON b.strategy_id = s.id
        ORDER BY b.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    result = []
    for row in rows:
        backtest_dict = dict(row)
        results = json.loads(backtest_dict['results'])
        backtest_dict['total_return'] = results.get('metrics', {}).get('total_return', 0)
        result.append(backtest_dict)
    return result

