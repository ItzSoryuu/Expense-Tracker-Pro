from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Literal, Tuple

from flask import Blueprint, jsonify

from backend.database.transactions_store import load_transactions

statistics_bp = Blueprint("statistics", __name__)


def _app_root_path() -> str:
    import os

    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def _parse_date(value: str) -> date:
    # expects DD-MM-YYYY
    return datetime.strptime(value, "%d-%m-%Y").date()


def _range_for(period: Literal["weekly", "monthly", "all"]) -> Tuple[date, date]:
    today = date.today()
    if period == "all":
        return date.min, today

    if period == "weekly":
        # 7 hari terakhir termasuk hari ini
        start = today - timedelta(days=6)
        return start, today

    if period == "monthly":
        # bulan kalender berjalan
        start = today.replace(day=1)
        # end = hari terakhir bulan ini
        if today.month == 12:
            next_month = today.replace(year=today.year + 1, month=1, day=1)
        else:
            next_month = today.replace(month=today.month + 1, day=1)
        end = next_month - timedelta(days=1)
        return start, end

    # fallback
    return date.min, today


def _filter_transactions(txs: List[Dict[str, Any]], period: str) -> List[Dict[str, Any]]:
    start, end = _range_for(period)  # type: ignore[arg-type]
    filtered: List[Dict[str, Any]] = []
    for tx in txs:
        # Desain menyebut created_at, tapi payload JSON kita memakai date
        d = tx.get("date") or tx.get("created_at")
        if not d:
            continue
        try:
            tx_date = _parse_date(str(d))
        except ValueError:
            continue
        if start <= tx_date <= end:
            filtered.append(tx)
    return filtered


@statistics_bp.get("")
def statistics() -> Any:
    period = str((__import__("flask").request.args.get("period", "all"))).lower()  # avoid circular import
    if period not in ("weekly", "monthly", "all"):
        period = "all"

    txs = load_transactions(_app_root_path())
    filtered = _filter_transactions(txs, period)

    total = sum(int(tx.get("amount", 0)) for tx in filtered)
    by_category: Dict[str, int] = defaultdict(int)
    for tx in filtered:
        cat = str(tx.get("category", "")).strip() or "Uncategorized"
        by_category[cat] += int(tx.get("amount", 0))

    categories = list(by_category.keys())
    values = [by_category[c] for c in categories]

    # format chart: pie chart labels + values
    return jsonify(
        {
            "period": period,
            "total": total,
            "transactions": filtered,
            "pie": {
                "labels": categories,
                "values": values,
            },
        }
    )
