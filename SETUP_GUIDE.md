# 🔑 FinGuard AI: API Setup Guide

To unlock the full potential of the **FinGuard AI Professional Terminal**, you need to configure a few external service keys. Follow this guide to get up and running in minutes.

---

### 1. NewsAPI (Real-time Sentiment)
Used for fetching actual market headlines to calculate the "Vortex Sentiment Score."
1. Go to [NewsAPI.org](https://newsapi.org/register).
2. Register for a **Free Developer Key**.
3. Copy the API Key and paste it into `.env`:
   ```env
   NEWS_API_KEY=your_key_here
   ```

### 2. Google OAuth (One-Tap Access)
Used for the high-end "Continue with Google" login feature.
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **FinGuard AI**.
3. Go to **APIs & Services > Credentials**.
4. Click **Create Credentials > OAuth client ID**.
5. Select **Web application**.
6. Add `http://localhost:5173` to **Authorized JavaScript origins**.
7. Copy the **Client ID** and update `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   ```

### 3. Alpha Vantage (Institutional Data - Optional)
For more precise historical data than `yfinance`.
1. Request a free key at [Alpha Vantage](https://www.alphavantage.co/support/#api-key).
2. Add it to your `.env`:
   ```env
   ALPHA_VANTAGE_API_KEY=your_key_here
   ```

---

## 🚀 Finalizing Installation

Once your `.env` is ready, restart the systems:

**Backend:**
```bash
python backend/app.py
```

**Frontend:**
```bash
npm run dev
```

> [!IMPORTANT]
> **Data Privacy**: Your `.env` file should never be committed to version control. It is already included in `.gitignore` for your protection.

> [!TIP]
> **Graceful Degradation**: If an API key is missing, FinGuard AI will automatically fall back to "System Simulation Mode" with synthetic data so you can still explore the interface.
