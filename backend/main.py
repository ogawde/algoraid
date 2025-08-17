from fastapi import FastAPI
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

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



