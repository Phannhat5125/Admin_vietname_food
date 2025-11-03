from flask import Blueprint, request, jsonify
import models.mon_an_model as model

# Thông tin bảng (các cột): id (PRIMARY KEY, AUTO INCREMENT), ten_mon, vung_mien, tinh_thanh, nguyen_lieu, calo
# id mới thêm: không yêu cầu client gửi khi tạo; nếu gửi sẽ bỏ qua để tránh lỗi / xung đột.

# Blueprint cho các route của món ăn
mon_an_bp = Blueprint('mon_an', __name__)

def _get_payload():
    """Lấy dữ liệu từ JSON hoặc form; trả về dict (có thể rỗng)."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = request.form.to_dict()
    return data or {}

# --- READ ALL ---
@mon_an_bp.route('/monan', methods=['GET'])
def get_all_mon_an():
    try:
        data = model.get_all()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- READ ONE ---
@mon_an_bp.route('/monan/<int:mon_id>', methods=['GET'])
def get_mon_an(mon_id):
    try:
        mon = model.get_by_id(mon_id)
        if mon:
            return jsonify(mon), 200
        return jsonify({"message": "Không tìm thấy món ăn"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- CREATE ---
@mon_an_bp.route('/monan', methods=['POST'])
def create_mon_an():
    try:
        data = _get_payload()
        # Bỏ qua id nếu client gửi (DB tự sinh)
        data.pop("id", None)
        required = ("ten_mon", "vung_mien", "tinh_thanh", "nguyen_lieu", "calo")
        if not all(k in data and data[k] not in (None, "") for k in required):
            return jsonify({"error": "Thiếu dữ liệu (cần: ten_mon, vung_mien, tinh_thanh, nguyen_lieu, calo)"}), 400

        new_id = model.create(data)
        return jsonify({"message": "Thêm món ăn thành công", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- UPDATE ---
@mon_an_bp.route('/monan/<int:mon_id>', methods=['PUT'])
def update_mon_an(mon_id):
    try:
        data = _get_payload()
        if not data:
            return jsonify({"error": "Thiếu dữ liệu"}), 400

        existing = model.get_by_id(mon_id)
        if not existing:
            return jsonify({"message": "Không tìm thấy món ăn"}), 404

        # Không cho phép sửa id
        if "id" in data:
            data.pop("id", None)

        model.update(mon_id, data)
        return jsonify({"message": "Cập nhật món ăn thành công"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- DELETE ---
@mon_an_bp.route('/monan/<int:mon_id>', methods=['DELETE'])
def delete_mon_an(mon_id):
    try:
        existing = model.get_by_id(mon_id)
        if not existing:
            return jsonify({"message": "Không tìm thấy món ăn"}), 404

        model.delete(mon_id)
        return jsonify({"message": "Xóa món ăn thành công"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
