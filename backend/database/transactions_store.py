import json
import os
from dataclasses import dataclass
from datetime import date, datetime
from typing import Any, Dict, List, Optional


TRANSACTIONS_FILE = "transactions.json"


@dataclass(frozen=True)
class Transaction:
    name: str
    category: str
    amount: int
    description: str
    date: str  # DD-MM-YYYY


def _get_data_path(app_root_path: str) -> str:
    # Data JSON disimpan di backend/database/transactions.json
    # tapi kita tetap pastikan foldernya ada.
    base_dir = os.path.join(app_root_path, "database")
    os.makedirs(base_dir, exist_ok=True)
    return os.path.join(base_dir, TRANSACTIONS_FILE)


def load_transactions(app_root_path: str) -> List[Dict[str, Any]]:
    path = _get_data_path(app_root_path)
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return []
    if not isinstance(data, list):
        return []
    return data


def save_transactions(app_root_path: str, transactions: List[Dict[str, Any]]) -> None:
    path = _get_data_path(app_root_path)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(transactions, f, ensure_ascii=False, indent=2)


def normalize_date(value: Optional[str]) -> str:
    # Jika kosong, gunakan hari ini
    if not value:
        return date.today().strftime("%d-%m-%Y")

    try:
        # terima DD-MM-YYYY
        parsed = datetime.strptime(value, "%d-%m-%Y")
        return parsed.date().strftime("%d-%m-%Y")
    except ValueError:
        # fallback: tetap lempar error agar backend bisa balas 400
        raise


def validate_transaction_payload(payload: Dict[str, Any]) -> Transaction:
    # payload: name/category/amount/description/date
    required_fields = ["name", "category", "amount"]
    for field in required_fields:
        if field not in payload:
            raise ValueError(f"Missing field: {field}")

    name = str(payload["name"]).strip()
    category = str(payload["category"]).strip()
    description = str(payload.get("description", "")).strip() or "-"

    if not name:
        raise ValueError("Field 'name' cannot be empty")
    if not category:
        raise ValueError("Field 'category' cannot be empty")


    try:
        amount = int(payload["amount"])
    except (TypeError, ValueError):
        raise ValueError("Field 'amount' must be an integer")

    if amount <= 0:
        raise ValueError("Field 'amount' must be a positive integer")

    tx_date = normalize_date(payload.get("date"))
    return Transaction(name=name, category=category, amount=amount, description=description, date=tx_date)


def upsert_transaction_by_index(
    app_root_path: str,
    index: int,
    new_tx: Transaction,
) -> List[Dict[str, Any]]:
    transactions = load_transactions(app_root_path)
    if index < 0 or index >= len(transactions):
        raise IndexError("Transaction not found")

    transactions[index] = {
        "name": new_tx.name,
        "category": new_tx.category,
        "amount": new_tx.amount,
        "description": new_tx.description,
        "date": new_tx.date,
    }
    save_transactions(app_root_path, transactions)
    return transactions


def delete_transaction_by_index(app_root_path: str, index: int) -> List[Dict[str, Any]]:
    transactions = load_transactions(app_root_path)
    if index < 0 or index >= len(transactions):
        raise IndexError("Transaction not found")

    transactions.pop(index)
    save_transactions(app_root_path, transactions)
    return transactions


def create_transaction(app_root_path: str, tx: Transaction) -> List[Dict[str, Any]]:
    transactions = load_transactions(app_root_path)
    transactions.append(
        {
            "name": tx.name,
            "category": tx.category,
            "amount": tx.amount,
            "description": tx.description,
            "date": tx.date,
        }
    )
    save_transactions(app_root_path, transactions)
    return transactions
