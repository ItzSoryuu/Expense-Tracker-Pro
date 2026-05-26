import json
import os
from flask import Blueprint, jsonify, request

theme_bp = Blueprint("theme", __name__)

THEME_FILE = "theme.json"

def _data_path() -> str:
    base_dir = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")), "database")
    os.makedirs(base_dir, exist_ok=True)
    return os.path.join(base_dir, THEME_FILE)

@theme_bp.get("")
def get_theme() -> object:
    path = _data_path()
    if not os.path.exists(path):
        return jsonify({"theme": "normal"})
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        theme = data.get("theme", "normal")
        if theme not in ("normal", "dark"):
            theme = "normal"
        return jsonify({"theme": theme})
    except Exception:
        return jsonify({"theme": "normal"})

@theme_bp.post("")
def set_theme() -> object:
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Invalid JSON body"}), 400

    theme = payload.get("theme", "normal")
    if theme not in ("normal", "dark"):
        return jsonify({"error": "theme must be 'normal' or 'dark'"}), 400

    with open(_data_path(), "w", encoding="utf-8") as f:
        json.dump({"theme": theme}, f, ensure_ascii=False, indent=2)

    return jsonify({"theme": theme})
