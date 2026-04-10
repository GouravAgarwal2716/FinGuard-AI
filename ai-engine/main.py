from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import sys
import pandas as pd
import numpy as np
import yfinance as yf
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load the AI modules
from modules.anomaly_detection import AnomalyDetector
from modules.sentiment_analysis import SentimentAnalyzer
from modules.risk_model import RiskModel

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI(title="FinGuard AI Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Engines
anomaly_engine = AnomalyDetector()
sentiment_engine = SentimentAnalyzer()
risk_engine = RiskModel()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

# ─── Models ───────────────────────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    symbol: str
    days: Optional[int] = 90

class SentimentRequest(BaseModel):
    symbol: str
    company_name: Optional[str] = None

# ─── Helpers ──────────────────────────────────────────────────────────────────

def fetch_stock_data(symbol: str, days: int = 90) -> pd.DataFrame:
    """Fetch stock data with Alpha Vantage primary, yfinance fallback."""
    # Try Alpha Vantage first
    if ALPHA_VANTAGE_KEY:
        try:
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={symbol.split('.')[0]}&apikey={ALPHA_VANTAGE_KEY}&outputsize=compact"
            r = requests.get(url, timeout=10)
            data = r.json()
            if "Time Series (Daily)" in data:
                ts = data["Time Series (Daily)"]
                df = pd.DataFrame.from_dict(ts, orient='index')
                df = df.rename(columns={"1. open": "Open", "2. high": "High", "3. low": "Low", "4. close": "Close", "6. volume": "Volume"})
                df.index = pd.to_datetime(df.index)
                df = df.astype(float).sort_index()
                return df.tail(days)
        except Exception:
            pass

    # Fallback: yfinance
    try:
        stock = yf.Ticker(symbol)
        df = stock.history(period=f"{days}d")
        if not df.empty:
            return df
    except Exception:
        pass

    return pd.DataFrame()


def fetch_news(symbol: str, company: str = None) -> List[str]:
    """Fetch recent news headlines for sentiment analysis."""
    query = company or symbol.split('.')[0]
    if NEWS_API_KEY:
        try:
            url = f"https://newsapi.org/v2/everything?q={query}&language=en&sortBy=publishedAt&pageSize=20&apiKey={NEWS_API_KEY}"
            r = requests.get(url, timeout=10)
            articles = r.json().get("articles", [])
            headlines = [a["title"] for a in articles if a.get("title")]
            if headlines:
                return headlines
        except Exception:
            pass
    return [f"Market analysis active for {symbol}.", "Institutional flow monitoring in progress."]


def compute_technical_indicators(df: pd.DataFrame) -> Dict[str, Any]:
    """Compute key technical indicators."""
    close = df["Close"]
    volume = df["Volume"]

    # Moving averages
    sma_20 = close.rolling(20).mean().iloc[-1]
    sma_50 = close.rolling(50).mean().iloc[-1] if len(df) >= 50 else sma_20
    ema_12 = close.ewm(span=12, adjust=False).mean().iloc[-1]
    ema_26 = close.ewm(span=26, adjust=False).mean().iloc[-1]

    # MACD
    macd = ema_12 - ema_26
    macd_signal = close.ewm(span=12, adjust=False).mean().ewm(span=9, adjust=False).mean().iloc[-1]

    # RSI
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(14).mean().iloc[-1]
    loss = (-delta.clip(upper=0)).rolling(14).mean().iloc[-1]
    rsi = 100 - (100 / (1 + gain / loss)) if loss != 0 else 50

    # Bollinger Bands
    bb_mid = close.rolling(20).mean().iloc[-1]
    bb_std = close.rolling(20).std().iloc[-1]
    bb_upper = bb_mid + 2 * bb_std
    bb_lower = bb_mid - 2 * bb_std

    # Volume analysis
    vol_avg_20 = volume.rolling(20).mean().iloc[-1]
    vol_current = volume.iloc[-1]
    vol_ratio = vol_current / vol_avg_20 if vol_avg_20 > 0 else 1.0

    return {
        "sma_20": round(float(sma_20), 2),
        "sma_50": round(float(sma_50), 2),
        "ema_12": round(float(ema_12), 2),
        "macd": round(float(macd), 4),
        "macd_signal": round(float(macd_signal), 4),
        "rsi": round(float(rsi), 2),
        "bb_upper": round(float(bb_upper), 2),
        "bb_lower": round(float(bb_lower), 2),
        "vol_ratio": round(float(vol_ratio), 2),
        "vol_avg_20": round(float(vol_avg_20), 0),
    }


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "FinGuard AI Engine Online", "version": "2.0.0", "timestamp": datetime.utcnow()}


@app.get("/api/tickers")
def get_default_tickers():
    return ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", "AAPL", "NVDA", "TSLA", "MSFT", "GOOGL"]


@app.post("/api/analyze/{symbol}")
@app.get("/api/analyze/{symbol}")
def analyze_stock(symbol: str, days: int = 90):
    """
    Full AI analysis pipeline for a given symbol.
    Returns: price data, risk score, anomalies, sentiment, technicals, XAI explanation.
    """
    # 1. Fetch Data
    df = fetch_stock_data(symbol, days)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"No data found for symbol '{symbol}'. Try adding .NS for Indian stocks.")

    # 2. Anomaly Detection (Isolation Forest)
    df_with_anomalies = anomaly_engine.detect_anomalies(df.copy())
    df_with_pump = anomaly_engine.detect_pump_and_dump_patterns(df_with_anomalies.copy())

    is_anomaly = bool(df_with_anomalies['Anomaly'].iloc[-1] == -1)
    anomaly_score = float(df_with_anomalies['Anomaly_Score'].iloc[-1])
    pump_alert = bool(df_with_pump['Pump_Alert'].iloc[-1]) if 'Pump_Alert' in df_with_pump.columns else False

    # 3. Sentiment Analysis
    headlines = fetch_news(symbol)
    news_df = pd.DataFrame({'title': headlines})
    avg_sentiment, sentiment_results = sentiment_engine.analyze_news_df(news_df)

    # 4. Risk Score (weighted composite)
    risk_score, explanation = risk_engine.calculate_risk_score(
        df,
        avg_sentiment,
        {'anomaly_score': anomaly_score}
    )

    # 5. Technical Indicators
    try:
        technicals = compute_technical_indicators(df)
    except Exception:
        technicals = {}

    # 6. Historical data for charts (last 60 data points)
    historical = []
    for idx, row in df.tail(60).iterrows():
        historical.append({
            "date": str(idx.date()),
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "close": round(float(row["Close"]), 2),
            "volume": int(row["Volume"]),
        })

    # 7. Anomaly points for chart overlay
    anomaly_points = []
    anomaly_df = df_with_anomalies[df_with_anomalies['Anomaly'] == -1].tail(20)
    for idx, row in anomaly_df.iterrows():
        anomaly_points.append({
            "date": str(idx.date()),
            "price": round(float(row["Close"]), 2),
            "score": round(float(row["Anomaly_Score"]), 4)
        })

    # 8. XAI Explanation
    xai = build_xai_explanation(risk_score, anomaly_score, avg_sentiment, pump_alert, technicals, df)

    # 9. Risk category
    if risk_score < 30:
        risk_category = "SAFE"
        risk_color = "green"
    elif risk_score < 50:
        risk_category = "CAUTION"
        risk_color = "yellow"
    elif risk_score < 70:
        risk_category = "WARNING"
        risk_color = "orange"
    else:
        risk_category = "HIGH_RISK"
        risk_color = "red"

    return {
        "symbol": symbol,
        "current_price": round(float(df['Close'].iloc[-1]), 2),
        "price_change_1d": round(float(df['Close'].iloc[-1] - df['Close'].iloc[-2]), 2) if len(df) > 1 else 0,
        "price_change_pct": round(float((df['Close'].iloc[-1] - df['Close'].iloc[-2]) / df['Close'].iloc[-2] * 100), 2) if len(df) > 1 else 0,
        "historical_data": historical,
        "anomaly_points": anomaly_points,
        "analysis": {
            "risk_score": risk_score,
            "risk_category": risk_category,
            "risk_color": risk_color,
            "explanation": explanation,
            "is_anomaly": is_anomaly,
            "pump_alert": pump_alert,
            "sentiment_score": round(avg_sentiment, 4),
            "sentiment_label": "POSITIVE" if avg_sentiment > 0.1 else ("NEGATIVE" if avg_sentiment < -0.1 else "NEUTRAL"),
            "anomaly_score": round(anomaly_score, 4),
        },
        "technicals": technicals,
        "xai": xai,
        "news_headlines": headlines[:5],
        "analyzed_at": datetime.utcnow().isoformat(),
    }


def build_xai_explanation(risk_score, anomaly_score, sentiment, pump_alert, technicals, df):
    """Build explainable AI output with factor breakdown."""
    factors = []

    # Volume factor
    vol_ratio = technicals.get("vol_ratio", 1.0)
    if vol_ratio > 3:
        factors.append({
            "factor": "Volume Spike",
            "severity": "HIGH",
            "impact": f"+{int(vol_ratio * 8)} to risk score",
            "explanation": f"Trading volume is {vol_ratio:.1f}x the 20-day average — classic manipulation signal.",
            "icon": "trending-up"
        })
    elif vol_ratio > 2:
        factors.append({
            "factor": "Elevated Volume",
            "severity": "MEDIUM",
            "impact": f"+{int(vol_ratio * 5)} to risk score",
            "explanation": f"Volume significantly above average ({vol_ratio:.1f}x). Monitor closely.",
            "icon": "bar-chart"
        })

    # Anomaly factor
    if anomaly_score > 0.3:
        factors.append({
            "factor": "AI Anomaly Detected",
            "severity": "HIGH" if anomaly_score > 0.6 else "MEDIUM",
            "impact": f"+{int(anomaly_score * 35)} to risk score",
            "explanation": f"Isolation Forest model flagged abnormal price-volume behavior (score: {anomaly_score:.2f}).",
            "icon": "alert-triangle"
        })

    # Pump & Dump
    if pump_alert:
        factors.append({
            "factor": "Pump & Dump Pattern",
            "severity": "CRITICAL",
            "impact": "+40 to risk score",
            "explanation": "Statistical analysis detected coordinated pump pattern: extreme volume Z-score (>3) with price surge.",
            "icon": "zap"
        })

    # Sentiment factor
    if sentiment < -0.3:
        factors.append({
            "factor": "Negative News Sentiment",
            "severity": "MEDIUM",
            "impact": f"+{int(abs(sentiment) * 25)} to risk score",
            "explanation": f"News sentiment score is {sentiment:.2f} — predominantly negative coverage detected.",
            "icon": "newspaper"
        })
    elif sentiment > 0.7:
        factors.append({
            "factor": "Hype / Bubble Risk",
            "severity": "MEDIUM",
            "impact": "+15 to risk score",
            "explanation": f"Extreme positive sentiment ({sentiment:.2f}) vs price action — classic hype cycle warning.",
            "icon": "trending-up"
        })

    # RSI overbought/oversold
    rsi = technicals.get("rsi", 50)
    if rsi > 75:
        factors.append({
            "factor": "RSI Overbought",
            "severity": "MEDIUM",
            "impact": "+10 to risk score",
            "explanation": f"RSI at {rsi:.0f} — stock is technically overbought. Reversal risk elevated.",
            "icon": "activity"
        })
    elif rsi < 25:
        factors.append({
            "factor": "RSI Oversold",
            "severity": "LOW",
            "impact": "Monitoring",
            "explanation": f"RSI at {rsi:.0f} — stock is technically oversold. Potential bounce or continued selloff.",
            "icon": "activity"
        })

    if not factors:
        factors.append({
            "factor": "No Significant Risk Factors",
            "severity": "LOW",
            "impact": "None",
            "explanation": "Market behavior aligns with historical norms. No manipulation signals detected.",
            "icon": "shield-check"
        })

    # Recommendations
    recommendations = []
    if risk_score > 70:
        recommendations = [
            "Avoid new positions until risk normalizes",
            "Set stop-loss at -10% from current price",
            "Monitor insider selling disclosures",
            "Review portfolio exposure to this asset"
        ]
    elif risk_score > 50:
        recommendations = [
            "Reduce position size if holding",
            "Watch for continued volume spikes",
            "Monitor news sentiment for further deterioration"
        ]
    else:
        recommendations = [
            "Standard position sizing applies",
            "Continue monitoring at regular intervals",
            "No immediate action required"
        ]

    return {
        "summary": f"Risk score {risk_score}/100 driven by {len([f for f in factors if f['severity'] != 'LOW'])} elevated risk factors.",
        "risk_factors": factors,
        "recommendations": recommendations,
    }


@app.get("/api/sentiment/{symbol}")
def get_sentiment(symbol: str):
    headlines = fetch_news(symbol)
    news_df = pd.DataFrame({'title': headlines})
    avg_sentiment, results = sentiment_engine.analyze_news_df(news_df)
    return {
        "symbol": symbol,
        "sentiment_score": round(avg_sentiment, 4),
        "label": "POSITIVE" if avg_sentiment > 0.1 else ("NEGATIVE" if avg_sentiment < -0.1 else "NEUTRAL"),
        "headlines": headlines[:10],
    }


@app.get("/api/market/overview")
def market_overview():
    """Returns a quick overview of key tickers for the dashboard."""
    tickers = ["^NSEI", "^BSESN", "AAPL", "NVDA", "RELIANCE.NS"]
    result = []
    for t in tickers:
        try:
            df = fetch_stock_data(t, days=5)
            if not df.empty:
                change_pct = round((df['Close'].iloc[-1] - df['Close'].iloc[-2]) / df['Close'].iloc[-2] * 100, 2)
                result.append({
                    "symbol": t,
                    "price": round(float(df['Close'].iloc[-1]), 2),
                    "change_pct": change_pct,
                    "direction": "up" if change_pct >= 0 else "down"
                })
        except Exception:
            pass
    return {"market": result, "timestamp": datetime.utcnow().isoformat()}
