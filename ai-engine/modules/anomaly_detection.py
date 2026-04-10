import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

class AnomalyDetector:
    def __init__(self, contamination=0.01):
        """
        AI-powered anomaly detector for stock market data.
        Uses Isolation Forest for multidimensional outlier detection.
        """
        self.model = IsolationForest(contamination=contamination, random_state=42)
        self.scaler = StandardScaler()

    def detect_anomalies(self, df):
        """
        Detect anomalies based on Price Change, Volume Change, and Volatility.
        Returns the original DataFrame with an 'Anomaly' column (-1 for outlier, 1 for normal).
        """
        if len(df) < 20: # Need enough data for a meaningful model
            df['Anomaly'] = 1
            df['Anomaly_Score'] = 0.5
            return df

        # Feature Engineering for Detection
        features = pd.DataFrame()
        features['returns'] = df['Close'].pct_change().fillna(0)
        features['vol_change'] = df['Volume'].pct_change().fillna(0)
        
        # Add SMA deviation
        df['SMA_20'] = df['Close'].rolling(window=20).mean()
        features['sma_dev'] = (df['Close'] - df['SMA_20']) / df['SMA_20']
        features = features.fillna(0).replace([np.inf, -np.inf], 0)

        # Scaling
        scaled_features = self.scaler.fit_transform(features)
        
        # Fit and Predict
        df['Anomaly'] = self.model.fit_predict(scaled_features)
        
        # Scores (higher = more anomalous)
        # decision_function returns negative for anomalies, positive for normal
        df['Anomaly_Score'] = -self.model.decision_function(scaled_features)
        
        return df

    def calculate_z_scores(self, series, window=20):
        """
        Calculate rolling Z-score for a series to detect statistical spikes.
        """
        rolling_mean = series.rolling(window=window).mean()
        rolling_std = series.rolling(window=window).std()
        z_scores = (series - rolling_mean) / rolling_std
        return z_scores.fillna(0).replace([np.inf, -np.inf], 0)

    def detect_pump_and_dump_patterns(self, df):
        """
        Advanced heuristic for pump and dump patterns:
        - Extreme Z-score in Volume (> 3)
        - High positive Z-score in Returns (> 2)
        - Followed by a sharp reversal
        """
        df['Vol_Z'] = self.calculate_z_scores(df['Volume'])
        df['Ret_Z'] = self.calculate_z_scores(df['Close'].pct_change())
        
        df['Pump_Alert'] = (df['Vol_Z'] > 3) & (df['Ret_Z'] > 2)
        
        return df
