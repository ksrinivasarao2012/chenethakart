from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlmodel import Session, select

from ..db import get_session
from ..models import ContactMessage, NewsletterSub
from ..ratelimit import limit
from ..security import EMAIL_RE

router = APIRouter(tags=["misc"])


def _valid_email(v: str) -> str:
    v = v.strip().lower()
    if not EMAIL_RE.match(v):
        raise ValueError("Enter a valid email address.")
    return v


class NewsletterIn(BaseModel):
    email: str

    _v = field_validator("email")(_valid_email)


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str
    subject: str = Field(min_length=3, max_length=120)
    message: str = Field(min_length=10, max_length=2000)

    _v = field_validator("email")(_valid_email)


@router.post("/newsletter", status_code=201, dependencies=[Depends(limit("newsletter", 10, 3600))])
def subscribe(data: NewsletterIn, session: Session = Depends(get_session)):
    if session.exec(select(NewsletterSub).where(NewsletterSub.email == data.email)).first():
        return {"ok": True, "message": "You're already subscribed — thank you!"}
    session.add(NewsletterSub(email=data.email))
    session.commit()
    return {"ok": True, "message": "Welcome to the Chenethakart family! Check back for new arrivals."}


@router.post("/contact", status_code=201, dependencies=[Depends(limit("contact", 10, 3600))])
def contact(data: ContactIn, session: Session = Depends(get_session)):
    session.add(ContactMessage(**{**data.model_dump(), "email": data.email}))
    session.commit()
    return {"ok": True, "message": "Thanks for reaching out. We reply within 1 business day."}
