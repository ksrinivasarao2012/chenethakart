"""Single source of truth for cart totals. The frontend asks /pricing/quote instead of
duplicating this logic, and /orders re-runs it so the client can never dictate prices."""

from dataclasses import dataclass
from typing import Optional

FREE_SHIPPING_THRESHOLD = 999
STANDARD_SHIPPING = 60
EXPRESS_SHIPPING = 149

SHIPPING_METHODS = {
    "standard": {"label": "Standard delivery", "eta": "5–7 business days"},
    "express": {"label": "Express delivery", "eta": "2–3 business days"},
}

COUPONS = {
    "HANDMADE10": {"kind": "percent", "value": 10, "cap": 200, "min": 0,
                   "description": "10% off (up to ₹200)"},
    "WELCOME100": {"kind": "flat", "value": 100, "min": 500,
                   "description": "₹100 off orders above ₹500"},
    "FREESHIP": {"kind": "freeship", "value": 0, "min": 0,
                 "description": "Free standard shipping"},
}


@dataclass
class Quote:
    subtotal: int
    discount: int
    shipping: int
    total: int
    coupon: Optional[str]
    coupon_message: Optional[str]
    coupon_valid: bool
    free_shipping_gap: int


def quote(subtotal: int, shipping_method: str = "standard", coupon_code: Optional[str] = None) -> Quote:
    base_shipping = EXPRESS_SHIPPING if shipping_method == "express" else (
        0 if subtotal >= FREE_SHIPPING_THRESHOLD or subtotal == 0 else STANDARD_SHIPPING
    )
    discount = 0
    shipping = base_shipping
    applied: Optional[str] = None
    message: Optional[str] = None
    valid = False

    code = (coupon_code or "").strip().upper()
    if code:
        c = COUPONS.get(code)
        if c is None:
            message = "That coupon code isn't valid."
        elif subtotal < c["min"]:
            message = f"Add ₹{c['min'] - subtotal} more to use {code}."
        else:
            applied, valid = code, True
            message = f"{code} applied — {c['description']}."
            if c["kind"] == "percent":
                discount = min(round(subtotal * c["value"] / 100), c["cap"])
            elif c["kind"] == "flat":
                discount = min(c["value"], subtotal)
            elif c["kind"] == "freeship":
                shipping = max(0, base_shipping - STANDARD_SHIPPING)

    gap = max(0, FREE_SHIPPING_THRESHOLD - subtotal) if subtotal else 0
    return Quote(subtotal, discount, shipping, max(0, subtotal - discount) + shipping,
                 applied, message, valid, gap)
