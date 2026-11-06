import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlmodel import Session

from .bootstrap import ensure_ready
from .config import CORS_ORIGINS, IS_PROD
from .db import engine
from .routers import account, auth, catalog, misc, shop

log = logging.getLogger("chenethakart")

app = FastAPI(
    title="Chenethakart API",
    version="1.0.0",
    # Interactive docs are handy locally but not something to expose publicly.
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None,
    openapi_url=None if IS_PROD else "/openapi.json",
)


@app.middleware("http")
async def prepare_and_harden(request: Request, call_next):
    try:
        ensure_ready()  # creates tables / seeds sample data on the first request of each process
    except Exception:
        log.exception("Database is not ready")
        return JSONResponse(status_code=503, content={"detail": "The store is temporarily unavailable. Please try again shortly."})
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    if request.method != "GET" or request.url.path.startswith(("/auth", "/me", "/orders")):
        response.headers["Cache-Control"] = "no-store"
    return response


if CORS_ORIGINS:
    app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True,
                       allow_methods=["*"], allow_headers=["*"])


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError):
    """Return one friendly message plus per-field errors the forms can display."""
    fields: dict[str, str] = {}
    for err in exc.errors():
        loc = [str(p) for p in err["loc"] if p not in ("body", "query")]
        msg = err["msg"].removeprefix("Value error, ")
        fields[".".join(loc)] = msg
    first = next(iter(fields.values()), "Please check the details you entered.")
    return JSONResponse(status_code=422, content={"detail": first, "fields": fields})


for r in (catalog.router, auth.router, shop.router, account.router, misc.router):
    app.include_router(r)


@app.get("/health")
def health():
    """Liveness + database check, for uptime monitors."""
    try:
        with Session(engine) as s:
            s.execute(text("select 1"))
    except Exception:
        log.exception("Health check failed")
        return JSONResponse(status_code=503, content={"status": "database unavailable"})
    return {"status": "ok"}
