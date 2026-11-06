import threading

from app.pricing import quote

from .conftest import order_body, product_id

# ---------- pricing rules ----------


def test_shipping_free_from_999_and_express_flat():
    assert quote(998).shipping == 60
    assert quote(999).shipping == 0
    assert quote(500, "express").shipping == 149


def test_coupons():
    assert quote(1000, coupon_code="handmade10").discount == 100
    assert quote(5000, coupon_code="HANDMADE10").discount == 200  # capped
    assert quote(400, coupon_code="WELCOME100").coupon_valid is False  # below minimum
    assert quote(500, coupon_code="WELCOME100").discount == 100
    assert quote(500, coupon_code="FREESHIP").shipping == 0
    assert quote(500, coupon_code="NOPE").coupon_valid is False
    q = quote(1500, "standard", "HANDMADE10")
    assert q.total == 1500 - 150


# ---------- catalogue ----------


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_products_listing_sort_filter_search(client):
    d = client.get("/products?page_size=48").json()
    assert d["total"] == 9
    prices = [p["price"] for p in client.get("/products?sort=price_asc&page_size=48").json()["items"]]
    assert prices == sorted(prices)
    d = client.get("/products?min_price=300&max_price=600&page_size=48").json()
    assert d["items"] and all(300 <= p["price"] <= 600 for p in d["items"])
    assert [p["name"] for p in client.get("/products?q=octopus").json()["items"]] == ["Crochet Octopus Keychain"]
    assert client.get("/products?category=crochet-bags").json()["total"] == 1
    page2 = client.get("/products?page_size=8&page=2").json()
    assert len(page2["items"]) == 1 and page2["pages"] == 2


def test_product_detail_and_404(client):
    d = client.get("/products/crochet-turtle-toy").json()
    assert d["artisan"]["name"] == "Savitri Devi" and d["qc"]["status"] == "Passed" and d["related"]
    assert client.get("/products/does-not-exist").status_code == 404
    assert client.get("/products?ids=abc").status_code == 400


# ---------- auth ----------


def signup(client, email="buyer@example.com", password="password123"):
    return client.post("/auth/signup", json={"name": "Test Buyer", "email": email, "password": password})


def test_signup_login_logout_session(client):
    assert client.get("/auth/session").json() == {"user": None}
    assert client.get("/auth/me").status_code == 401
    r = signup(client)
    assert r.status_code == 201 and "ck_token" in r.cookies
    assert "httponly" in r.headers["set-cookie"].lower()
    assert client.get("/auth/me").json()["email"] == "buyer@example.com"
    assert signup(client).status_code == 409  # duplicate
    client.post("/auth/logout")
    assert client.get("/auth/session").json() == {"user": None}
    assert client.post("/auth/login", json={"email": "buyer@example.com", "password": "wrong"}).status_code == 401
    assert client.post("/auth/login", json={"email": "BUYER@example.com", "password": "password123"}).status_code == 200


def test_signup_validation_including_bcrypt_limit(client):
    assert signup(client, email="bad", password="password123").status_code == 422
    assert signup(client, email="a@b.co", password="short").status_code == 422
    long = signup(client, email="long@example.com", password="x" * 80)
    assert long.status_code == 422 and "72" in long.json()["detail"]  # must not crash with a 500


def test_login_is_rate_limited(client):
    codes = [client.post("/auth/login", json={"email": "no@example.com", "password": "nope"}).status_code for _ in range(12)]
    assert codes[:10] == [401] * 10 and codes[10:] == [429, 429]


def test_private_endpoints_require_login(client):
    for path in ("/me/orders", "/me/addresses", "/me/wishlist"):
        assert client.get(path).status_code == 401


# ---------- orders ----------


def test_order_flow_prices_stock_and_tracking(client):
    pid = product_id(client, "crochet-octopus-keychain")
    before = client.get("/products/crochet-octopus-keychain").json()["stock"]
    # the client cannot dictate price: only ids and quantities are accepted
    r = client.post("/orders", json=order_body([{"product_id": pid, "quantity": 2}], coupon="HANDMADE10"))
    assert r.status_code == 201
    o = r.json()
    assert o["subtotal"] == 598 and o["discount"] == 60 and o["shipping"] == 60 and o["total"] == 598
    assert o["payment_status"] == "Paid (simulated)" and o["number"].startswith("CK-")
    assert client.get("/products/crochet-octopus-keychain").json()["stock"] == before - 2
    # guest tracking needs the matching email
    assert client.post("/orders/track", json={"number": o["number"], "email": "priya@example.com"}).status_code == 200
    assert client.post("/orders/track", json={"number": o["number"], "email": "other@example.com"}).status_code == 404
    # guests cannot open it directly
    assert client.get(f"/orders/{o['number']}").status_code == 401


def test_order_rejections(client):
    pid = product_id(client, "crochet-turtle-toy")
    assert client.post("/orders", json=order_body([{"product_id": pid, "quantity": 1}], coupon="BOGUS")).status_code == 400
    assert client.post("/orders", json=order_body([{"product_id": 999999, "quantity": 1}])).status_code == 400
    assert client.post("/orders", json=order_body([])).status_code == 422
    bad = order_body([{"product_id": pid, "quantity": 1}])
    bad["address"] = {**bad["address"], "pincode": "123"}
    assert client.post("/orders", json=bad).status_code == 422
    sold_out = product_id(client, "handloom-woven-coaster-set")
    r = client.post("/orders", json=order_body([{"product_id": sold_out, "quantity": 1}]))
    assert r.status_code == 409 and "sold out" in r.json()["detail"]


def test_cannot_oversell_last_items(client):
    pid = product_id(client, "amigurumi-bunny-with-carrot")
    stock = client.get("/products/amigurumi-bunny-with-carrot").json()["stock"]
    results = []

    def buy():
        results.append(client.post("/orders", json=order_body([{"product_id": pid, "quantity": 1}])).status_code)

    threads = [threading.Thread(target=buy) for _ in range(stock + 3)]
    [t.start() for t in threads]
    [t.join() for t in threads]
    assert results.count(201) == stock and results.count(409) == 3
    assert client.get("/products/amigurumi-bunny-with-carrot").json()["stock"] == 0


def test_logged_in_orders_addresses_wishlist_reviews(client):
    signup(client, email="member@example.com")
    pid = product_id(client, "crochet-sunflower-bouquet")
    o = client.post("/orders", json=order_body([{"product_id": pid, "quantity": 1}], payment_method="cod")).json()
    assert o["payment_status"] == "Pay on delivery"
    assert [x["number"] for x in client.get("/me/orders").json()] == [o["number"]]
    assert client.get(f"/orders/{o['number']}").status_code == 200
    # another user cannot see it
    client.post("/auth/logout")
    signup(client, email="other@example.com")
    assert client.get(f"/orders/{o['number']}").status_code == 404
    # addresses
    a = client.post("/me/addresses", json={**{k: v for k, v in order_body([])["address"].items()}, "label": "Home"}).json()
    assert a["is_default"] is True
    assert len(client.get("/me/addresses").json()) == 1
    assert client.delete(f"/me/addresses/{a['id']}").status_code == 200
    # wishlist
    assert client.put("/me/wishlist", json={"product_ids": [pid, pid, 999999]}).json() == {"product_ids": [pid]}
    assert client.get("/me/wishlist").json() == {"product_ids": [pid]}
    # reviews update the rating
    before = client.get("/products/crochet-sunflower-bouquet").json()
    r = client.post("/products/crochet-sunflower-bouquet/reviews", json={"rating": 5, "title": "Lovely", "body": "Beautiful and bright."})
    assert r.status_code == 201 and r.json()["review_count"] == before["review_count"] + 1
    client.post("/auth/logout")
    assert client.post("/products/crochet-sunflower-bouquet/reviews", json={"rating": 5, "title": "x", "body": "no login here"}).status_code == 401


def test_newsletter_and_contact(client):
    assert client.post("/newsletter", json={"email": "bad"}).status_code == 422
    assert client.post("/newsletter", json={"email": "fan@example.com"}).status_code == 201
    assert "already" in client.post("/newsletter", json={"email": "fan@example.com"}).json()["message"]
    assert client.post("/contact", json={"name": "Asha", "email": "asha@example.com", "subject": "Hello", "message": "Where is my parcel?"}).status_code == 201
    assert client.post("/contact", json={"name": "A", "email": "x", "subject": "", "message": ""}).status_code == 422
