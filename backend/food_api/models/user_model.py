import mysql.connector
from config import db_config
from datetime import datetime

# Using werkzeug.security for password hashing (Flask dependency)
from werkzeug.security import generate_password_hash, check_password_hash


def get_connection():
    return mysql.connector.connect(**db_config)


def find_by_email(email: str):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, username, email, password, fullName, created_at FROM user WHERE email=%s", (email,))
    row = cur.fetchone()
    cur.close(); conn.close()
    return row


def find_by_username(username: str):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, username, email, password, fullName, created_at FROM user WHERE username=%s", (username,))
    row = cur.fetchone()
    cur.close(); conn.close()
    return row


def create_user(username: str, email: str, password_plain: str, full_name: str):
    password_hash = generate_password_hash(password_plain)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO user (username, email, password, fullName, created_at) VALUES (%s, %s, %s, %s, %s)",
        (username, email, password_hash, full_name, datetime.utcnow())
    )
    conn.commit()
    new_id = cur.lastrowid
    cur.close(); conn.close()
    return new_id


def verify_password(password_plain: str, password_hash: str) -> bool:
    try:
        return check_password_hash(password_hash, password_plain)
    except Exception:
        return False
