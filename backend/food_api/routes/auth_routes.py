from flask import Blueprint, request, jsonify
import os, datetime, jwt
from models import user_model

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
JWT_SECRET = os.getenv('JWT_SECRET', 'dev-secret-key')
JWT_ALG = 'HS256'
TOKEN_EXP_HOURS = int(os.getenv('TOKEN_EXP_HOURS', '6'))


def _json():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return {}
    return data

@auth_bp.route('/register', methods=['POST'])
def register():
    body = _json()
    username = (body.get('username') or '').strip()
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    full_name = (body.get('fullName') or body.get('full_name') or '').strip()

    if not username or not email or not password or not full_name:
        return jsonify({'error': 'Thiếu username/fullName/email/password'}), 400

    # Simple password policy: length >= 8
    if len(password) < 8:
        return jsonify({'error': 'Mật khẩu phải có ít nhất 8 ký tự'}), 400

    existing_email = user_model.find_by_email(email)
    if existing_email:
        return jsonify({'error': 'Email đã tồn tại'}), 409

    existing_username = user_model.find_by_username(username)
    if existing_username:
        return jsonify({'error': 'Username đã tồn tại'}), 409

    new_id = user_model.create_user(username, email, password, full_name)
    return jsonify({'id': new_id, 'username': username, 'email': email, 'fullName': full_name}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    body = _json()
    # Switch to username-based login instead of email
    username = (body.get('username') or '').strip()
    password = body.get('password') or ''

    if not username or not password:
        return jsonify({'error': 'Thiếu username/password'}), 400

    user = user_model.find_by_username(username)
    if not user or not user_model.verify_password(password, user['password']):
        return jsonify({'error': 'Sai thông tin đăng nhập'}), 401

    payload = {
        'sub': user['id'],
        'username': user['username'],
        'email': user['email'],  # email retained in token for reference
        'fullName': user.get('fullName') or user.get('full_name'),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXP_HOURS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)
    return jsonify({'token': token, 'user': {'id': user['id'], 'username': user['username'], 'email': user['email'], 'fullName': payload['fullName']}}), 200
