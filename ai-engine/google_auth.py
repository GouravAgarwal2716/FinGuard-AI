from flask import Blueprint, request, jsonify, redirect, session
from database import db, User
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import jwt
import datetime
import os

google_auth_bp = Blueprint('google_auth', __name__)

# Load from environment
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
SECRET_KEY = os.getenv('JWT_SECRET', 'super_secret_hackathon_key')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

@google_auth_bp.route('/google/auth', methods=['POST'])
def google_auth():
    """
    Verify Google ID token and create/login user
    """
    try:
        data = request.get_json()
        token = data.get('credential')  # Google ID token from frontend
        
        if not token:
            return jsonify({"error": "No credential provided"}), 400

        # Verify the token with Google
        try:
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                GOOGLE_CLIENT_ID
            )
            
            # Extract user information
            google_id = idinfo['sub']
            email = idinfo.get('email')
            name = idinfo.get('name', email.split('@')[0])
            picture = idinfo.get('picture')
            
            # Check if user exists by google_id
            user = User.query.filter_by(google_id=google_id).first()
            
            if not user:
                # Check if email already exists (traditional signup)
                user = User.query.filter_by(email=email).first()
                if user:
                    # Link Google account to existing user
                    user.google_id = google_id
                    user.profile_picture = picture
                else:
                    # Create new user
                    # Generate unique username from email
                    base_username = email.split('@')[0]
                    username = base_username
                    counter = 1
                    while User.query.filter_by(username=username).first():
                        username = f"{base_username}{counter}"
                        counter += 1
                    
                    user = User(
                        username=username,
                        email=email,
                        google_id=google_id,
                        profile_picture=picture
                    )
                    db.session.add(user)
                
                db.session.commit()
            
            # Generate JWT token
            jwt_token = jwt.encode({
                'user_id': user.id,
                'username': user.username,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, SECRET_KEY, algorithm='HS256')
            
            return jsonify({
                "token": jwt_token,
                "user": user.to_json(),
                "message": "Google authentication successful"
            }), 200
            
        except ValueError as e:
            # Invalid token
            print(f"Token verification failed: {e}")
            return jsonify({"error": "Invalid Google token"}), 401
            
    except Exception as e:
        print(f"Google auth error: {e}")
        return jsonify({"error": str(e)}), 500


@google_auth_bp.route('/google/demo-login', methods=['POST'])
def demo_google_login():
    """
    Demo Google login (when real credentials not available)
    """
    data = request.get_json()
    email = data.get('email', 'demo@google.com')
    name = data.get('name', 'Demo User')
    
    # Create or get demo user
    user = User.query.filter_by(email=email).first()
    if not user:
        username = email.split('@')[0]
        counter = 1
        original_username = username
        while User.query.filter_by(username=username).first():
            username = f"{original_username}{counter}"
            counter += 1
        
        user = User(
            username=username,
            email=email,
            google_id=f"demo_{email}",
            profile_picture="https://ui-avatars.com/api/?name=" + name.replace(' ', '+')
        )
        db.session.add(user)
        db.session.commit()
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'username': user.username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, SECRET_KEY, algorithm='HS256')
    
    return jsonify({
        "token": token,
        "user": user.to_json(),
        "message": "Demo Google login successful"
    }), 200
