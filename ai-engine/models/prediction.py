from datetime import datetime
try:
    from backend.database import db
except ImportError:
    from flask_sqlalchemy import SQLAlchemy
    db = SQLAlchemy()

class StockPrediction(db.Model):
    """
    Industry-level persistence for AI Market predictions.
    Used for historical performance audit and user analysis.
    """
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), nullable=False, index=True)
    risk_score = db.Column(db.Integer, nullable=False)
    explanation = db.Column(db.Text, nullable=False)
    price_at_prediction = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # AI Engine Specifics
    is_anomaly = db.Column(db.Boolean, default=False)
    sentiment_score = db.Column(db.Float)
    
    def __repr__(self):
        return f"<StockPrediction {self.symbol} - Risk: {self.risk_score}>"
