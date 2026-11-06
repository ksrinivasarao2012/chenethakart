import os
from collections.abc import Iterator

from sqlmodel import Session, create_engine


def database_url() -> str:
    url = os.getenv("DATABASE_URL", "").strip()
    if not url:
        if os.getenv("VERCEL"):
            # Vercel's filesystem is read-only except /tmp. This keeps a demo deploy alive, but the data is
            # ephemeral and per-instance. Set DATABASE_URL to a hosted Postgres for anything real.
            return "sqlite:////tmp/chenethakart.db"
        return "sqlite:///./chenethakart.db"
    # Providers hand out postgres:// or postgresql:// URLs; SQLAlchemy needs the driver name.
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    return url


DATABASE_URL = database_url()

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Small pool + pre-ping suits serverless platforms and pooled providers (Neon, Supabase).
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=2, max_overflow=3, pool_recycle=300)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
