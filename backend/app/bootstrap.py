"""Create tables and load the sample catalogue once per process.

Done lazily and defensively: on serverless platforms there is no reliable startup hook, and several
cold starts can race. Unique constraints make a lost race harmless, so we just roll back and carry on.
"""

import logging
import threading
import time

from sqlalchemy.exc import DBAPIError, IntegrityError
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
        # Two cold starts can try to create the same tables at once; the loser gets a duplicate-key error.
        # Retrying is safe because create_all skips tables that now exist.
        for attempt in range(4):
            try:
                SQLModel.metadata.create_all(engine)
                break
            except DBAPIError:
                if attempt == 3:
                    raise
                log.info("Table creation raced with another instance; retrying.")
                time.sleep(0.5 * (attempt + 1))
        try:
            with Session(engine) as session:
                seed(session)
        except IntegrityError:
            log.info("Seed data was created by another instance; continuing.")
        _ready = True
