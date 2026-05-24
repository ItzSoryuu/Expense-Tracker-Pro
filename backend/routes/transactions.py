from typing import Any, Dict, List

from flask import Blueprint, jsonify, request

from backend.database.transactions_store import (
    Transaction,
    create_transaction,
    delete_transaction_by_index,
    load_transactions,
    upsert_transaction_by_index,
    validate_transaction_payload,
)


transactions_bp = Blueprint("transactions", __name__)


def _app_root_path() -> str:
    # backend/app.py berada di backend/
    # app_root_path yang kita perlukan untuk menyimpan ke backend/database/
    import os

    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


@transactions_bp.get("")
def list_transactions() -> Any:
    txs: List[Dict[str, Any]] = load_transactions(_app_root_path())
    # frontend bisa pakai index sebagai id transaksi
    return jsonify(txs)


@transactions_bp.post("")
def add_transaction() -> Any:
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Invalid JSON body"}), 400

    try:
        tx = validate_transaction_payload(payload)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    txs = create_transaction(_app_root_path(), tx)
    return jsonify(txs), 201


@transactions_bp.put("/<int:index>")
def edit_transaction(index: int) -> Any:
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Invalid JSON body"}), 400

    try:
        tx = validate_transaction_payload(payload)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    try:
        txs = upsert_transaction_by_index(_app_root_path(), index, tx)
    except IndexError:
        return jsonify({"error": "Transaction not found"}), 404

    return jsonify(txs)


@transactions_bp.delete("/<int:index>")
def delete_transaction(index: int) -> Any:
    try:
        txs = delete_transaction_by_index(_app_root_path(), index)
    except IndexError:
        return jsonify({"error": "Transaction not found"}), 404

    return jsonify(txs)
