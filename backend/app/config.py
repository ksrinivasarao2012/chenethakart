"""Runtime configuration, read from environment variables.

Local development works with no configuration at all. In production (Vercel, or APP_ENV=production)
the app refuses to start with an insecure JWT secret, so a forgotten secret can't go live silently.
"""

import os

DEV_JWT_SECRET = "dev-only-secret-change-me-chenethakart-2026-0123456789"

APP_ENV = os.getenv("APP_ENV") or ("production" if os.getenv("VERCEL") else "development")
IS_PROD = APP_ENV == "production"

JWT_SECRET = os.getenv("JWT_SECRET", DEV_JWT_SECRET)
if IS_PROD and (JWT_SECRET == DEV_JWT_SECRET or len(JWT_SECRET) < 32):
    raise RuntimeError(
        "JWT_SECRET must be set to a random string of at least 32 characters in production. "
        'Generate one with: python -c "import secrets; print(secrets.token_urlsafe(48))"'
    )

# Cookies are only marked Secure over HTTPS (production); localhost dev runs on plain http.
COOKIE_SECURE = IS_PROD

CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()] or (
    [] if IS_PROD else ["http://localhost:3000", "http://127.0.0.1:3000"]
)
