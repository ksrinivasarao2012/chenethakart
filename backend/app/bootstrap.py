"""Create tables and load the sample catalogue once per process.

Done lazily and defensively: on serverless platforms there is no reliable startup hook, and several
cold starts can race. Unique constraints make a lost race harmless, so we just roll back and carry on.
"""

import logging
import threading

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, SQLModel

from .db import engine
from .seed import seed

log = logging.getLogger("chenethakart")
_lock = threading.Lock()
_ready = False


def ensure_ready() -> None:
    global _ready
    if _ready:
        return
    with _lock:
        if _ready:
            return
        SQLModel.metadata.create_all(engine)
        try:
            with Session(engine) as session:
                seed(session)
        except IntegrityError:
            log.info("Seed data was created by another instance; continuing.")
        _ready = True
