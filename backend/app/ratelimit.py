"""Small in-memory rate limiter for abuse-prone endpoints (login, signup, contact, newsletter).

Best effort only: counters live in one process, so on serverless platforms each instance counts
separately. For stronger protection put a shared limiter (Redis / the platform's firewall) in front.
"""

import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

_hits: dict[str, deque[float]] = defaultdict(deque)
_lock = threading.Lock()


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def limit(name: str, max_hits: int, per_seconds: int):
    """FastAPI dependency factory: allow `max_hits` calls per `per_seconds` for each client IP."""

    def dependency(request: Request) -> None:
        key = f"{name}:{client_ip(request)}"
        now = time.monotonic()
        with _lock:
            q = _hits[key]
            while q and now - q[0] > per_seconds:
                q.popleft()
            if len(q) >= max_hits:
                retry = int(per_seconds - (now - q[0])) + 1
                raise HTTPException(429, "Too many attempts. Please wait a moment and try again.",
                                    headers={"Retry-After": str(retry)})
            q.append(now)
            if len(_hits) > 5000:  # keep memory bounded
                for k in [k for k, v in _hits.items() if not v][:1000]:
                    _hits.pop(k, None)

    return dependency


def reset() -> None:
    """Clear all counters (used by tests)."""
    with _lock:
        _hits.clear()
