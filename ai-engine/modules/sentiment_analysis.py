import pandas as pd
from textblob import TextBlob
from typing import Tuple, List, Optional

class SentimentAnalyzer:
    """
    Lightweight NLP sentiment analyzer using TextBlob.
    Returns sentiment polarity scores in range [-1, 1].
    """

    def analyze_text(self, text: str) -> float:
        """Analyze a single string. Returns polarity [-1, 1]."""
        if not text or not isinstance(text, str):
            return 0.0
        analysis = TextBlob(text)
        return analysis.sentiment.polarity

    def analyze_news_df(self, news_df: pd.DataFrame, title_col: str = 'title') -> Tuple[float, List[dict]]:
        """
        Analyze a DataFrame of headlines.
        Returns tuple: (average_sentiment_score, list_of_results)
        """
        if news_df.empty or title_col not in news_df.columns:
            return 0.0, []

        results = []
        scores = []

        for _, row in news_df.iterrows():
            title = str(row.get(title_col, ''))
            if not title or title == 'nan':
                continue

            score = self.analyze_text(title)
            label = 'POSITIVE' if score > 0.05 else ('NEGATIVE' if score < -0.05 else 'NEUTRAL')
            scores.append(score)
            results.append({
                'title': title,
                'sentiment_score': round(score, 4),
                'label': label
            })

        avg = sum(scores) / len(scores) if scores else 0.0
        return round(avg, 4), results

    def detect_mismatch(self, sentiment_score: float, price_change_pct: float) -> Optional[str]:
        """Detects sentiment vs price mismatches (classic manipulation signal)."""
        if sentiment_score > 0.3 and price_change_pct < -3:
            return "MISMATCH: Positive news sentiment but significant price decline — possible coordinated pump."
        if sentiment_score < -0.3 and price_change_pct > 3:
            return "MISMATCH: Negative sentiment with rising price — possible short squeeze or insider buying."
        return None
