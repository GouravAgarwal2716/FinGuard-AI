from flask import Blueprint, request, jsonify
from database import db, User
import jwt
import datetime
import os

auth_bp = Blueprint('auth', __name__)

# Secret key for JWT (Should be in env, generating dynamic if missing for demo)
SECRET_KEY = os.getenv('JWT_SECRET', 'super_secret_hackathon_key')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    new_user = User(username=username)
    new_user.set_password(password)
    
    try:
        print(f" registering user: {username}")
        db.session.add(new_user)
        db.session.commit()
        print(f"User {username} registered successfully")
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(f"Error registering user {username}: {e}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        # Generate Token
        token = jwt.encode({
            'user_id': user.id,
            'username': user.username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm='HS256')

        return jsonify({
            "token": token,
            "user": user.to_json()
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401
