import os
import tempfile

# Each test run gets its own throwaway database (SQLite by default, or TEST_DATABASE_URL for Postgres).
_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = os.getenv("TEST_DATABASE_URL") or f"sqlite:///{_tmp}/test.db"
os.environ.setdefault("APP_ENV", "development")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import ratelimit  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def _client():
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def client(_client):
    ratelimit.reset()
    _client.cookies.clear()
    return _client


ADDRESS = {"full_name": "Priya Sharma", "phone": "9876543210", "line1": "12 MG Road",
           "city": "Hyderabad", "state": "Telangana", "pincode": "500081"}


def order_body(items, **over):
    body = {"items": items, "shipping_method": "standard", "payment_method": "upi", "name": "Priya Sharma",
            "email": "priya@example.com", "phone": "9876543210", "address": ADDRESS}
    body.update(over)
    return body


def product_id(client, slug):
    return client.get(f"/products/{slug}").json()["id"]
