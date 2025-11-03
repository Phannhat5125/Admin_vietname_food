import mysql.connector
from config import db_config

def get_connection():
    return mysql.connector.connect(**db_config)

def get_all():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM mon_an")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

def get_by_id(mon_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM mon_an WHERE id = %s", (mon_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row

def create(data):
    conn = get_connection()
    cursor = conn.cursor()
    sql = """INSERT INTO mon_an 
             (ten_mon, vung_mien, tinh_thanh, nguyen_lieu, calo) 
             VALUES (%s, %s, %s, %s, %s)"""
    val = (data['ten_mon'], data['vung_mien'], data['tinh_thanh'], data['nguyen_lieu'], data['calo'])
    cursor.execute(sql, val)
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return new_id

def update(mon_id, data):
    conn = get_connection()
    cursor = conn.cursor()
    sql = """UPDATE mon_an 
             SET ten_mon=%s, vung_mien=%s, tinh_thanh=%s, nguyen_lieu=%s, calo=%s 
             WHERE id=%s"""
    val = (data['ten_mon'], data['vung_mien'], data['tinh_thanh'], data['nguyen_lieu'], data['calo'], mon_id)
    cursor.execute(sql, val)
    conn.commit()
    cursor.close()
    conn.close()

def delete(mon_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM mon_an WHERE id=%s", (mon_id,))
    conn.commit()
    cursor.close()
    conn.close()
