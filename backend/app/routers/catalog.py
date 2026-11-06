from datetime import timedelta
from typing import Any, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, or_
from sqlmodel import Session, col, select

from ..db import get_session
from ..models import Artisan, Product, Review, User, utcnow
from ..security import current_user
from ..seed import CATEGORIES

router = APIRouter(tags=["catalog"])

CATEGORY_NAMES = {c["slug"]: c["name"] for c in CATEGORIES}


def availability(stock: int) -> str:
    if stock <= 0:
        return "out_of_stock"
    return "low_stock" if stock <= 5 else "in_stock"


def artisan_brief(a: Artisan) -> dict[str, Any]:
    return {"slug": a.slug, "name": a.name, "location": a.location, "avatar": a.avatar,
            "specialisation": a.specialisation, "is_sample": a.is_sample}


def product_card(p: Product, a: Artisan) -> dict[str, Any]:
    return {
        "id": p.id, "slug": p.slug, "name": p.name, "category": p.category,
        "category_name": CATEGORY_NAMES.get(p.category, p.category), "price": p.price,
        "compare_at_price": p.compare_at_price, "short_description": p.short_description,
        "image": p.images[0] if p.images else None, "images": p.images, "rating": p.rating,
        "review_count": p.review_count, "stock": p.stock, "availability": availability(p.stock),
        "featured": p.featured, "bestseller": p.bestseller,
        "is_new": p.created_at > utcnow() - timedelta(days=30), "artisan": artisan_brief(a),
    }


def artisan_full(a: Artisan) -> dict[str, Any]:
    return {**artisan_brief(a), "tagline": a.tagline, "story": a.story, "journey": a.journey,
            "state": a.state, "years_experience": a.years_experience}


def cards(session: Session, stmt) -> list[dict[str, Any]]:
    rows = session.exec(stmt).all()
    return [product_card(p, a) for p, a in rows]


BASE = select(Product, Artisan).join(Artisan, Artisan.id == Product.artisan_id)


@router.get("/categories")
def categories(session: Session = Depends(get_session)):
    counts = dict(session.exec(select(Product.category, func.count(Product.id)).group_by(Product.category)).all())
    return [{**c, "count": counts.get(c["slug"], 0)} for c in CATEGORIES]


@router.get("/home")
def home(session: Session = Depends(get_session)):
    return {
        "featured": cards(session, BASE.where(Product.featured == True).order_by(col(Product.popularity).desc()).limit(4)),  # noqa: E712
        "bestsellers": cards(session, BASE.where(Product.bestseller == True).order_by(col(Product.popularity).desc()).limit(4)),  # noqa: E712
        "new_arrivals": cards(session, BASE.order_by(col(Product.created_at).desc()).limit(4)),
        "artisans": [artisan_full(a) for a in session.exec(select(Artisan).limit(3)).all()],
    }


@router.get("/products")
def list_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[int] = Query(default=None, ge=0),
    max_price: Optional[int] = Query(default=None, ge=0),
    in_stock: bool = False,
    ids: Optional[str] = None,
    sort: Literal["popular", "newest", "price_asc", "price_desc"] = "popular",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=8, ge=1, le=48),
    session: Session = Depends(get_session),
):
    stmt = BASE
    if q and q.strip():
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(col(Product.name).ilike(like), col(Product.short_description).ilike(like),
                              col(Product.description).ilike(like), col(Product.category).ilike(like),
                              col(Artisan.name).ilike(like)))
    if ids is not None:
        try:
            id_list = [int(x) for x in ids.split(',') if x.strip()]
        except ValueError:
            raise HTTPException(400, 'ids must be comma-separated numbers.')
        stmt = stmt.where(col(Product.id).in_(id_list or [0]))
    if category:
        stmt = stmt.where(Product.category == category)
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)
    if in_stock:
        stmt = stmt.where(Product.stock > 0)

    total = session.exec(select(func.count()).select_from(stmt.subquery())).one()
    order = {
        "popular": col(Product.popularity).desc(),
        "newest": col(Product.created_at).desc(),
        "price_asc": col(Product.price).asc(),
        "price_desc": col(Product.price).desc(),
    }[sort]
    items = cards(session, stmt.order_by(order).offset((page - 1) * page_size).limit(page_size))
    return {"items": items, "total": total, "page": page, "page_size": page_size,
            "pages": max(1, -(-total // page_size))}


@router.get("/products/{slug}")
def product_detail(slug: str, session: Session = Depends(get_session)):
    row = session.exec(BASE.where(Product.slug == slug)).first()
    if row is None:
        raise HTTPException(404, "Product not found.")
    p, a = row
    reviews = session.exec(select(Review).where(Review.product_id == p.id).order_by(col(Review.created_at).desc())).all()
    related = cards(session, BASE.where(Product.category == p.category, Product.id != p.id).limit(4))
    if len(related) < 4:
        have = {r["id"] for r in related} | {p.id}
        more = cards(session, BASE.where(col(Product.id).notin_(have)).order_by(col(Product.popularity).desc()).limit(4 - len(related)))
        related += more
    return {
        **product_card(p, a), "description": p.description, "materials": p.materials, "specs": p.specs,
        "care": p.care,
        "qc": {"status": p.qc_status, "checked_on": p.qc_checked_on, "checks": p.qc_checks},
        "artisan": artisan_full(a),
        "reviews": [{"id": r.id, "author": r.author, "rating": r.rating, "title": r.title, "body": r.body,
                     "created_at": r.created_at.strftime("%d %b %Y")} for r in reviews],
        "related": related,
    }


class ReviewIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: str = Field(min_length=2, max_length=80)
    body: str = Field(min_length=10, max_length=1000)


@router.post("/products/{slug}/reviews", status_code=201)
def add_review(slug: str, data: ReviewIn, user: User = Depends(current_user),
               session: Session = Depends(get_session)):
    p = session.exec(select(Product).where(Product.slug == slug)).first()
    if p is None:
        raise HTTPException(404, "Product not found.")
    session.add(Review(product_id=p.id, user_id=user.id, author=user.name, rating=data.rating,
                       title=data.title.strip(), body=data.body.strip()))
    p.rating = round((p.rating * p.review_count + data.rating) / (p.review_count + 1), 1)
    p.review_count += 1
    session.add(p)
    session.commit()
    return {"ok": True, "rating": p.rating, "review_count": p.review_count}


@router.get("/artisans")
def list_artisans(session: Session = Depends(get_session)):
    out = []
    for a in session.exec(select(Artisan)).all():
        n = session.exec(select(func.count(Product.id)).where(Product.artisan_id == a.id)).one()
        out.append({**artisan_full(a), "product_count": n})
    return out


@router.get("/artisans/{slug}")
def artisan_detail(slug: str, session: Session = Depends(get_session)):
    a = session.exec(select(Artisan).where(Artisan.slug == slug)).first()
    if a is None:
        raise HTTPException(404, "Artisan not found.")
    products = cards(session, BASE.where(Product.artisan_id == a.id).order_by(col(Product.popularity).desc()))
    return {**artisan_full(a), "products": products}
