from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session, col, select

from ..db import get_session
from ..models import Address, Order, Product, User, WishlistItem
from ..security import current_user
from .shop import AddressIn, order_out

router = APIRouter(prefix="/me", tags=["account"])


class AddressBody(AddressIn):
    label: str = Field(default="Home", max_length=30)
    is_default: bool = False


def addr_out(a: Address) -> dict:
    return {"id": a.id, "label": a.label, "full_name": a.full_name, "phone": a.phone, "line1": a.line1,
            "line2": a.line2, "city": a.city, "state": a.state, "pincode": a.pincode, "is_default": a.is_default}


def _clear_default(session: Session, user_id: int) -> None:
    for a in session.exec(select(Address).where(Address.user_id == user_id, Address.is_default == True)):  # noqa: E712
        a.is_default = False
        session.add(a)


@router.get("/addresses")
def list_addresses(user: User = Depends(current_user), session: Session = Depends(get_session)):
    rows = session.exec(select(Address).where(Address.user_id == user.id).order_by(col(Address.is_default).desc(), Address.id)).all()
    return [addr_out(a) for a in rows]


@router.post("/addresses", status_code=201)
def add_address(data: AddressBody, user: User = Depends(current_user), session: Session = Depends(get_session)):
    first = session.exec(select(Address).where(Address.user_id == user.id)).first() is None
    if data.is_default or first:
        _clear_default(session, user.id)
    a = Address(user_id=user.id, **{**data.model_dump(), "is_default": data.is_default or first})
    session.add(a)
    session.commit()
    session.refresh(a)
    return addr_out(a)


def _own(session: Session, user: User, address_id: int) -> Address:
    a = session.get(Address, address_id)
    if a is None or a.user_id != user.id:
        raise HTTPException(404, "Address not found.")
    return a


@router.put("/addresses/{address_id}")
def update_address(address_id: int, data: AddressBody, user: User = Depends(current_user),
                   session: Session = Depends(get_session)):
    a = _own(session, user, address_id)
    if data.is_default:
        _clear_default(session, user.id)
    for k, v in data.model_dump().items():
        setattr(a, k, v)
    session.add(a)
    session.commit()
    return addr_out(a)


@router.delete("/addresses/{address_id}")
def delete_address(address_id: int, user: User = Depends(current_user), session: Session = Depends(get_session)):
    a = _own(session, user, address_id)
    was_default = a.is_default
    session.delete(a)
    session.commit()
    if was_default:
        nxt = session.exec(select(Address).where(Address.user_id == user.id)).first()
        if nxt:
            nxt.is_default = True
            session.add(nxt)
            session.commit()
    return {"ok": True}


@router.get("/orders")
def my_orders(user: User = Depends(current_user), session: Session = Depends(get_session)):
    rows = session.exec(select(Order).where(Order.user_id == user.id).order_by(col(Order.created_at).desc())).all()
    return [order_out(o) for o in rows]


class WishlistIn(BaseModel):
    product_ids: list[int]


@router.get("/wishlist")
def get_wishlist(user: User = Depends(current_user), session: Session = Depends(get_session)):
    return {"product_ids": [w.product_id for w in session.exec(select(WishlistItem).where(WishlistItem.user_id == user.id))]}


@router.put("/wishlist")
def put_wishlist(data: WishlistIn, user: User = Depends(current_user), session: Session = Depends(get_session)):
    valid = {p.id for p in session.exec(select(Product).where(col(Product.id).in_(data.product_ids or [0])))}
    for w in session.exec(select(WishlistItem).where(WishlistItem.user_id == user.id)):
        session.delete(w)
    session.flush()
    for pid in dict.fromkeys(data.product_ids):
        if pid in valid:
            session.add(WishlistItem(user_id=user.id, product_id=pid))
    session.commit()
    return {"product_ids": [pid for pid in dict.fromkeys(data.product_ids) if pid in valid]}
