import numpy as np

class RiskModel:
    def __init__(self):
        """
        AI Risk Score Generator (0-100).
        Aggregates anomaly data, sentiment, and technical patterns.
        """
        pass

    def calculate_risk_score(self, ticker_data, sentiment_score, anomaly_dict):
        """
        Weights for the Risk Score.
        Volatility: 25%
        Volume Surge: 25%
        AI Anomaly Detection: 30%
        Sentiment Mismatch: 20%
        """
        weights = {
            'volatility': 0.25,
            'volume': 0.25,
            'anomaly': 0.30,
            'sentiment': 0.20
        }
        
        # 1. Price Volatility (0-100)
        # 252 days = 1 year, annualized volatility
        returns = ticker_data['Close'].pct_change().dropna()
        volatility = np.std(returns) * np.sqrt(252) * 100
        vol_score = min(volatility * 2, 100) # Threshold for "High Risk" is around 50% vol

        # 2. Volume Spike (0-100)
        latest_vol = ticker_data['Volume'].iloc[-1]
        avg_vol = ticker_data['Volume'].rolling(window=20).mean().iloc[-1]
        volume_ratio = latest_vol / avg_vol if avg_vol > 0 else 1
        vol_spike_score = min((volume_ratio - 1) * 20, 100) if volume_ratio > 1 else 0

        # 3. AI Anomaly Score (0-100)
        # From Isolation Forest (decision function scaled)
        # Score is between 0 and 1 theoretically in our implementation_plan
        ai_score = anomaly_dict.get('anomaly_score', 0) * 100
        ai_score = max(min(ai_score, 100), 0)

        # 4. Sentiment Risk (0-100)
        # Extreme sentiment or mismatch is risky
        sent_risk = 0
        if sentiment_score < -0.5: # Extremely negative
            sent_risk = 80
        elif sentiment_score > 0.8: # Extremely positive (potential bubble/hype)
            sent_risk = 50
        
        # Final Score
        final_risk = (
            weights['volatility'] * vol_score +
            weights['volume'] * vol_spike_score +
            weights['anomaly'] * ai_score +
            weights['sentiment'] * sent_risk
        )
        
        final_risk = int(min(max(final_risk, 0), 100))
        
        # Industry-Level Explanation
        explanation = self.generate_explanation(final_risk, vol_score, vol_spike_score, ai_score, sentiment_score)
        
        return final_risk, explanation

    def generate_explanation(self, risk, vol, v_spike, ai, sent):
        reasons = []
        if risk > 70:
            status = "🔴 CRITICAL RISK"
        elif risk > 40:
            status = "🟡 MODERATE RISK"
        else:
            status = "🟢 SAFE"

        if vol > 60:
            reasons.append(f"Extreme Price Volatility ({int(vol)}%) detected.")
        if v_spike > 50:
            reasons.append("Unusual Volume Surge (Market Manipulation indicator).")
        if ai > 60:
            reasons.append("AI Anomaly Engine detected 'Black Swan' patterns.")
        if sent < -0.3:
            reasons.append("Negative News Sentiment spreading rapidly.")
        elif sent > 0.7:
             reasons.append("Extreme Hype/Bubble sentiment detected.")

        if not reasons:
            return f"{status}: Market behavior is stable and fits historical norms."
        
        return f"{status}: " + " ".join(reasons)
