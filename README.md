# 🛡️ FinGuard AI
**Professional Financial Intelligence & Fraud Detection Platform**

## 🎯 Project Goal
To empower Indian retail investors with a professional-grade platform that not only tracks stock prices but actively **detects market manipulation (fraud)** and **explains market movements** using AI. The goal is to bridge the gap between complex financial data and actionable, safety-focused insights.

---

## ✨ Key Features

### 1. 🔍 Dynamic Market Intelligence
*   **Global Search**: Search for any stock ticker (NSE, BSE, NASDAQ, etc.) to get instant real-time data.
*   **Live Dashboard**: Overview of top Indian stocks (NIFTY 50) with instant "Gain/Loss" indicators.

### 2. 📈 Professional Charting
*   **Interactive Graphs**: Integrated **TradingView Lightweight Charts** for zooming, panning, and precise technical analysis.
*   **Technical Indicators**: Visualizes Price, SMA (Simple Moving Averages), and Volume trends.

### 3. 🧠 AI "Smart Insights" (RAG Engine)
*   **The "Why" Behind the Move**: Our custom **Retrieval-Augmented Generation (RAG)** engine reads recent financial news and summarizes *why* a stock's price changed.
*   **Sentiment Analysis**: Automatically tags news as "Positive", "Negative", or "Neutral".

### 4. 🚨 Fraud & Risk Detection
*   **Pump & Dump Alerts**: Algorithms analyze Volume vs. Price variances to detect artificial price inflation scams.
*   **Volatility Checks**: Warns users if a stock is dangerously unstable (High Risk).

### 5. 🎮 Simulation Mode
*   **Market Simulator**: A "Forward 1 Day" button that simulates future market movements based on statistical trends, allowing users to practice trading strategies risk-free.

---

## 🛠️ Technical Implementation

### **Architecture: Full-Stack Client-Server**

#### **🖥️ Frontend (The Face)**
*   **Tech**: React.js (Vite) + Vanilla CSS.
*   **Design**: Custom-built "Dark Mode" UI for a premium fintech aesthetic.
*   **Visualization**: Uses `lightweight-charts` (Canvas-based) for high-performance rendering.

#### **🧠 Backend (The Brain)**
*   **Tech**: Flask (Python).
*   **Data Pipeline**:
    *   **Source**: `yfinance` for realtime OHLCV data.
    *   **Processing**: `pandas` and `numpy` for cleaning and calculating metrics (RSI, Volatility).
*   **AI/ML Layer**:
    *   **RAG**: Uses **TF-IDF** (Term Frequency-Inverse Document Frequency) and **Cosine Similarity** to retrieve relevant news for the specific stock.
    *   **Fraud Logic**: Statistical anomaly detection (Z-Score analysis) on Volume/Price ratios.

#### **🔒 Security**
*   **Auth**: JWT (JSON Web Tokens) for secure, stateless session management.
*   **Database**: SQLite with `bcrypt` encryption for storing user credentials.

---

## 🚀 How to Run

1.  **Start the Backend**:
    ```bash
    python backend/app.py
    ```
2.  **Start the Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
3.  **Access**: Open `http://localhost:5173`