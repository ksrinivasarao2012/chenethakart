import secrets
import string
from dataclasses import asdict
from datetime import timedelta
from typing import Any, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, Field, field_validator
from sqlmodel import Session, select

from ..db import get_session
from ..models import Order, Product, User, utcnow
from ..pricing import COUPONS, SHIPPING_METHODS, quote
from ..security import EMAIL_RE, PHONE_RE, PINCODE_RE, current_user, optional_user

router = APIRouter(tags=["shop"])

# DEMO: tracking advances automatically with time so the flow can be shown end to end.
TRACKING_STAGES = ["Order placed", "Quality check", "Branded & packed", "Shipped", "Out for delivery", "Delivered"]
MINUTES_PER_STAGE = 2


class LineIn(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=10)


class QuoteIn(BaseModel):
    items: list[LineIn]
    shipping_method: Literal["standard", "express"] = "standard"
    coupon: Optional[str] = None


def price_lines(session: Session, lines: list[LineIn]) -> tuple[list[dict[str, Any]], int]:
    merged: dict[int, int] = {}
    for line in lines:
        merged[line.product_id] = min(10, merged.get(line.product_id, 0) + line.quantity)
    out, subtotal = [], 0
    for pid, qty in merged.items():
        p = session.get(Product, pid)
        if p is None:
            raise HTTPException(400, "A product in your cart no longer exists.")
        out.append({"product_id": p.id, "slug": p.slug, "name": p.name, "price": p.price,
                    "quantity": qty, "image": p.images[0] if p.images else None, "stock": p.stock})
        subtotal += p.price * qty
    return out, subtotal


@router.get("/shipping-methods")
def shipping_methods():
    return [{"id": k, **v} for k, v in SHIPPING_METHODS.items()]


@router.get("/coupons")
def coupons():
    return [{"code": k, "description": v["description"]} for k, v in COUPONS.items()]


@router.post("/pricing/quote")
def pricing_quote(data: QuoteIn, session: Session = Depends(get_session)):
    lines, subtotal = price_lines(session, data.items)
    return {"lines": lines, **asdict(quote(subtotal, data.shipping_method, data.coupon))}


class AddressIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=80)
    phone: str
    line1: str = Field(min_length=3, max_length=160)
    line2: str = Field(default="", max_length=160)
    city: str = Field(min_length=2, max_length=60)
    state: str = Field(min_length=2, max_length=60)
    pincode: str

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number.")
        return v

    @field_validator("pincode")
    @classmethod
    def _pin(cls, v: str) -> str:
        if not PINCODE_RE.match(v):
            raise ValueError("Enter a valid 6-digit PIN code.")
        return v


class OrderIn(BaseModel):
    items: list[LineIn] = Field(min_length=1)
    shipping_method: Literal["standard", "express"] = "standard"
    payment_method: Literal["upi", "card", "cod"]
    coupon: Optional[str] = None
    name: str = Field(min_length=2, max_length=80)
    email: str
    phone: str
    address: AddressIn

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_RE.match(v):
            raise ValueError("Enter a valid email address.")
        return v

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number.")
        return v


def order_number() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "CK-" + utcnow().strftime("%y%m") + "-" + "".join(secrets.choice(alphabet) for _ in range(5))


def order_out(o: Order) -> dict[str, Any]:
    elapsed = (utcnow() - o.created_at) / timedelta(minutes=1)
    stage = min(len(TRACKING_STAGES) - 1, int(elapsed // MINUTES_PER_STAGE))
    return {
        "number": o.number, "created_at": o.created_at.strftime("%d %b %Y, %I:%M %p"), "name": o.name,
        "email": o.email, "phone": o.phone, "address": o.address, "items": o.items,
        "shipping_method": o.shipping_method, "payment_method": o.payment_method,
        "payment_status": "Pay on delivery" if o.payment_method == "cod" else "Paid (simulated)",
        "subtotal": o.subtotal, "discount": o.discount, "shipping": o.shipping, "total": o.total,
        "coupon": o.coupon, "status": TRACKING_STAGES[stage], "stage": stage, "stages": TRACKING_STAGES,
        "tracking_is_simulated": True,
    }


@router.post("/orders", status_code=201)
def place_order(data: OrderIn, user: Optional[User] = Depends(optional_user),
                session: Session = Depends(get_session)):
    lines, subtotal = price_lines(session, data.items)
    for ln in lines:
        if ln["stock"] < ln["quantity"]:
            msg = "is sold out" if ln["stock"] <= 0 else f"has only {ln['stock']} left"
            raise HTTPException(409, f"{ln['name']} {msg}. Please update your cart.")
    q = quote(subtotal, data.shipping_method, data.coupon)
    if data.coupon and data.coupon.strip() and not q.coupon_valid:
        raise HTTPException(400, q.coupon_message or "Invalid coupon.")
    # Reduce stock with a conditional UPDATE so two simultaneous orders can never oversell the last item.
    for ln in lines:
        res = session.execute(
            update(Product).where(Product.id == ln["product_id"], Product.stock >= ln["quantity"])
            .values(stock=Product.stock - ln["quantity"])
        )
        if res.rowcount != 1:
            session.rollback()
            raise HTTPException(409, f"{ln['name']} just sold out or has fewer left than you chose. Please update your cart.")
        ln.pop("stock")
    # Order numbers are random (36^5 per month), so a collision is practically impossible;
    # if it ever happens the whole transaction, including the stock change, is rolled back.
    order = Order(
        number=order_number(), user_id=user.id if user else None, name=data.name.strip(), email=data.email,
        phone=data.phone, address=data.address.model_dump(), shipping_method=data.shipping_method,
        payment_method=data.payment_method, items=lines, subtotal=q.subtotal, discount=q.discount,
        shipping=q.shipping, total=q.total, coupon=q.coupon,
    )
    session.add(order)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(500, "We couldn't place your order. Please try again.")
    session.refresh(order)
    return order_out(order)


class TrackIn(BaseModel):
    number: str
    email: str


@router.post("/orders/track")
def track_order(data: TrackIn, session: Session = Depends(get_session)):
    o = session.exec(select(Order).where(Order.number == data.number.strip().upper())).first()
    if o is None or o.email != data.email.strip().lower():
        raise HTTPException(404, "We couldn't find an order with those details.")
    return order_out(o)


@router.get("/orders/{number}")
def get_order(number: str, user: User = Depends(current_user), session: Session = Depends(get_session)):
    o = session.exec(select(Order).where(Order.number == number.upper())).first()
    if o is None or o.user_id != user.id:
        raise HTTPException(404, "Order not found.")
    return order_out(o)
