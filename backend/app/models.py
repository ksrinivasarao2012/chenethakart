from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import NaiveDatetime
from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Artisan(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)
    name: str
    location: str
    state: str
    specialisation: str
    tagline: str
    story: str
    journey: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    avatar: Optional[str] = None
    years_experience: int = 0
    # Every artisan in the seed data is fictional until real data is supplied.
    is_sample: bool = True


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)
    name: str
    category: str = Field(index=True)
    price: int
    compare_at_price: Optional[int] = None
    short_description: str
    description: str
    images: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    materials: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    specs: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    care: str = ""
    stock: int = 10
    rating: float = 0
    review_count: int = 0
    popularity: int = 0
    featured: bool = False
    bestseller: bool = False
    created_at: NaiveDatetime = Field(default_factory=utcnow)
    artisan_id: int = Field(foreign_key="artisan.id")
    qc_status: str = "Passed"
    qc_checked_on: str = ""
    qc_checks: list[str] = Field(default_factory=list, sa_column=Column(JSON))


class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id", index=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    author: str
    rating: int
    title: str
    body: str
    created_at: NaiveDatetime = Field(default_factory=utcnow)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True, unique=True)
    phone: Optional[str] = None
    password_hash: str
    created_at: NaiveDatetime = Field(default_factory=utcnow)


class Address(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    label: str = "Home"
    full_name: str
    phone: str
    line1: str
    line2: str = ""
    city: str
    state: str
    pincode: str
    is_default: bool = False


class WishlistItem(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    product_id: int = Field(foreign_key="product.id", primary_key=True)


class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    number: str = Field(index=True, unique=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
    name: str
    email: str
    phone: str
    address: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    shipping_method: str
    payment_method: str
    items: list[dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    subtotal: int
    discount: int = 0
    shipping: int = 0
    total: int
    coupon: Optional[str] = None
    created_at: NaiveDatetime = Field(default_factory=utcnow)


class NewsletterSub(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    created_at: NaiveDatetime = Field(default_factory=utcnow)


class ContactMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    subject: str
    message: str
    created_at: NaiveDatetime = Field(default_factory=utcnow)
