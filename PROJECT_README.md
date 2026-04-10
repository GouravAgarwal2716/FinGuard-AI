# FinGuard AI - Stock Market Risk Intelligence System

<div align="center">

![FinGuard AI Banner](https://img.shields.io/badge/FinGuard-AI%20Powered-blue?style=for-the-badge&logo=artificial-intelligence)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**An AI-powered stock market risk detection and fraud prediction system that proactively identifies suspicious stock behavior before investors lose money.**

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Usage](#usage) • [Architecture](#architecture)

</div>

---

## 🎯 Problem Statement

Retail investors face numerous challenges:
- Pump-and-dump schemes
- Sudden price spikes with weak fundamentals
- Insider trading signals
- Fake hype and news manipulation
- Unusual volume movements without clear reasons

Most platforms are **reactive** - they show what happened, not what might happen.

**FinGuard AI** is **proactive** - it detects fraud risk patterns, combines multiple signals, and provides a unified risk score.

---

## ✨ Features

### 1. **Real-Time Stock Monitoring**
- Tracks selected stocks continuously
- Updates price and volume data in real-time
- Identifies abnormal spikes instantly

### 2. **Advanced Risk Engine** 🧠
- **Unified Risk Score (0-100)**: Combines:
  - Price Volatility (30%)
  - Volume Anomalies (30%)
  - Sentiment Risk (20%)
  - ML-based Anomaly Detection (20%)
- **Human-Readable Explanations**: "High volatility detected (65%), unusual volume spike"

### 3. **Anomaly Detection**
- Uses **Isolation Forest** (scikit-learn) for outlier detection
- Identifies:
  - Sudden price jumps
  - Unusual volume surges
  - Volatility beyond normal range
  - Pattern deviations from historical behavior

### 4. **Sentiment Analysis** 📰
- **NLP Engine** using TextBlob
- Analyzes financial news headlines
- Detects extreme emotional shifts
- Example: *"Stock sentiment is 82% positive but fundamentals unchanged — risk of artificial hype."*

### 5. **Fraud Pattern Recognition**
- Identifies patterns similar to:
  - Pump → Hype → Spike → Dump
  - Coordinated price-volume manipulation
  - Short-term artificial volatility

### 6. **Interactive Dashboard**
- Risk meter (speedometer-style gauge)
- Price and volume charts
- Sentiment trend graphs
- Risk explanation breakdown
- AI Recommendations (BUY/HOLD/AVOID)

### 7. **Early Warning Alerts** ⚠️
- High-risk alerts
- Suspicious activity warnings
- Sudden volatility notifications
- Sentiment-driven movement alerts

---

## 🛠 Tech Stack

### **Backend** (Python/Flask)
- **Flask**: REST API framework
- **yfinance**: Real-time market data
- **scikit-learn**: Machine learning (Isolation Forest)
- **TextBlob**: NLP for sentiment analysis
- **NumPy, Pandas**: Data processing
- **SQLAlchemy**: User authentication database

### **Frontend** (React/Vite)
- **React 19**: Modern UI components
- **Recharts**: Risk meter and data visualization
- **Lucide React**: Premium icons
- **Axios**: API communication
- **React Router**: Navigation

### **Design**
- **Glassmorphism** effects with `backdrop-filter`
- **Dark Mode** with "Slate" color palette
- **Smooth Animations** for enhanced UX

---

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Quick Start (Recommended)

#### 1. Clone and Navigate
```bash
cd "FinGuard AI"
```

#### 2. Backend Setup
```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Download NLP data
python -m textblob.download_corpora

# Start backend server
python backend/app.py
```

Backend will run on `http://localhost:5000`

#### 3. Frontend Setup (New Terminal)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will run on `http://localhost:5173` (or next available port)

### Environment Variables (Optional)

Create a `.env` file in the root directory if you want to use real news API:

```env
NEWS_API_KEY=your_newsapi_key_here
```

> **Note**: The application works perfectly fine without a NEWS_API_KEY as it uses mock news for demonstration.

---

## 🚀 Usage

### 1. **Register/Login**
- Navigate to `http://localhost:5173`
- Create an account or log in
- Credentials are stored securely with bcrypt hashing

### 2. **View Dashboard**
- See curated stock cards with risk indicators
- AI-driven insights for each stock
- Quick access to detailed analysis

### 3. **Analyze a Stock**
- Click on any stock card or search for a ticker
- View:
  - **Risk Meter**: AI-calculated risk score (0-100)
  - **Price Chart**: Interactive TradingView-style chart
  - **Risk Factors**: Volatility, Volume, Sentiment breakdown
  - **AI Insight**: Detailed market analysis
  - **News Sentiment**: Analyzed headlines
  - **AI Recommendation**: BUY/HOLD/AVOID with confidence score

### 4. **Simulation Mode**
- Click "Forward 1 Day" to simulate future scenarios
- Test how risk scores change over time
- Useful for demonstration and testing

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│          Frontend (React + Vite)                │
│  ┌──────────────────────────────────────────┐   │
│  │  Dashboard → Stock Cards with Risk       │   │
│  │  StockDetail → Risk Meter + Breakdown    │   │
│  │  Login/Signup → Modern Glass UI          │   │
│  └──────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────┘
                  │ Axios HTTP
                  ▼
┌─────────────────────────────────────────────────┐
│           Backend (Flask API)                   │
│  ┌──────────────────────────────────────────┐   │
│  │  RiskEngine (Anomaly Detection + Scoring)│   │
│  │  SentimentAnalyzer (NLP + TextBlob)      │   │
│  │  FraudDetector (Pattern Recognition)     │   │
│  │  RAGEngine (AI Insights)                 │   │
│  └──────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │   yfinance (Market)  │
       │   TextBlob (NLP)     │
       │   scikit-learn (ML)  │
       └──────────────────────┘
```

---

## 🎓 For Viva / Presentation

**"What is your project about?"**

> *FinGuard AI is an AI-based stock market risk detection system that combines **anomaly detection**, **time-series analysis**, and **NLP-based sentiment analysis** to identify suspicious stock behavior and generate early-warning risk scores for retail investors.*

**Why is this project strong?**
1. **Finance + AI**: High-value, real-world domain
2. **Multi-Modal ML**: Combines structured (price/volume) + unstructured data (news)
3. **Production-Grade**: Complete full-stack implementation
4. **Scalable**: Can be extended to portfolio-level analysis, social media monitoring, etc.
5. **Explainable**: Every AI decision is explained to the user

---

## 🔮 Future Enhancements

- **Portfolio-Level Risk Scoring**: Aggregate risk across multiple stocks
- **Social Media Monitoring**: Integrate Reddit/Twitter sentiment
- **Real-Time Streaming**: WebSocket integration for live updates
- **Advanced ML Models**: LSTM for time-series forecasting
- **Mobile App**: React Native for iOS/Android
- **Deployment**: Docker + Cloud hosting (AWS/GCP)

---

## 📊 Key Differentiators

| Traditional Platforms | FinGuard AI |
|----------------------|-------------|
| Shows past data | **Predicts future risk** |
| Reactive alerts | **Proactive detection** |
| Technical indicators only | **AI + NLP + Sentiment** |
| No fraud detection | **Pump-and-dump detection** |
| Generic recommendations | **Personalized risk scores** |

---

## 🏆 Project Highlights

✅ **Full-Stack Implementation**: Backend (Flask) + Frontend (React)  
✅ **Machine Learning**: Isolation Forest for anomaly detection  
✅ **Natural Language Processing**: TextBlob for sentiment analysis  
✅ **Premium UI/UX**: Glassmorphism, dark mode, smooth animations  
✅ **Real-World Data**: Powered by yfinance API  
✅ **Explainable AI**: Every decision comes with a reason  
✅ **Production-Ready**: Authentication, error handling, testing  

---

## 📝 License

MIT License - Feel free to use this for learning and demonstration purposes.

---

<div align="center">

**Built with ❤️ using AI/ML, Python, and React**

*Protecting retail investors, one prediction at a time.*

</div>
