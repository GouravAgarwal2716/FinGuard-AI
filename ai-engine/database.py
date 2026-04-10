from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)  # For Google OAuth
    password_hash = db.Column(db.String(128), nullable=True)  # Optional for OAuth users
    google_id = db.Column(db.String(200), unique=True, nullable=True)  # Google OAuth ID
    profile_picture = db.Column(db.String(500), nullable=True)  # Google profile pic

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        if not self.password_hash:
            return False
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_json(self):
        return {
            "id": self.id, 
            "username": self.username,
            "email": self.email,
            "profile_picture": self.profile_picture
        }

class UserSearchHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ticker = db.Column(db.String(20), nullable=False)
    sentiment_score = db.Column(db.Float, nullable=True)
    risk_score = db.Column(db.Float, nullable=True)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', backref=db.backref('search_history', lazy=True))

    def to_json(self):
        return {
            "id": self.id,
            "ticker": self.ticker,
            "sentiment_score": self.sentiment_score,
            "risk_score": self.risk_score,
            "timestamp": self.timestamp.isoformat()
        }


