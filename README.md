# Chenethakart — Handmade Stories, Brighter Tomorrows.

A working e-commerce demo for an Indian handmade crochet and handloom marketplace.

| Part | Stack |
|---|---|
| `frontend/` | Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Lucide icons |
| `backend/` | FastAPI · SQLModel · SQLite · bcrypt + JWT (httpOnly cookie) — Python managed with **uv** |

## Run it

You need **Node.js 20+** and **[uv](https://docs.astral.sh/uv/)**. Open two terminals.

**Terminal 1 — API (http://localhost:8000)**
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```
The first start creates `chenethakart.db` and loads the sample data. To reset it: `uv run python -m app.seed --reset`.

**Terminal 2 — website (http://localhost:3000)**
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:3000. (For a production build: `npm run build && npm start`.)

The site talks to the API through a `/api` proxy (see `frontend/next.config.mjs`). If your API runs elsewhere, copy `frontend/.env.example` to `frontend/.env.local` and set `API_URL`.

Optional backend env vars: `JWT_SECRET` (set this for anything beyond local use), `DATABASE_URL` (e.g. a Postgres/Supabase URL instead of SQLite), `CORS_ORIGINS`.

## Try it
- Coupons: `HANDMADE10` (10% off, max ₹200), `WELCOME100` (₹100 off above ₹500), `FREESHIP`
- Test card (simulated): `4242 4242 4242 4242`, any future expiry, any CVV
- Free standard shipping from ₹999; Express is ₹149

## What really works vs. what is simulated

**Working (real code, real database)**
- Catalogue: search (with live suggestions), category and price filters, in-stock filter, sort by popularity / newest / price, load-more pagination, product detail with gallery, related products
- Cart and wishlist (kept in the browser; the wishlist also syncs to your account when logged in), quantity updates, free-shipping progress
- Cart totals, shipping and coupons are calculated **by the server**; the server also re-prices every order, checks stock and reduces it
- Checkout with full validation (address, PIN code, phone, UPI ID, card number Luhn check, expiry), guest checkout or logged-in checkout with saved addresses
- Sign up, log in, log out (bcrypt password hashes, signed cookie), profile, saved addresses (add / edit / delete / default), order history, change password
- Product reviews (logged-in users), newsletter sign-up and contact form (saved to the database)
- Artisan directory and profile pages, quality-assurance workflow pages, FAQs, shipping and returns info, responsive layout with a mobile bottom tab bar

**Simulated / placeholder — please read**
- **Payments:** UPI, card and COD screens are demonstrations. No money moves and card/UPI details are never sent to the server.
- **Order tracking:** the status advances automatically every 2 minutes for demo purposes. No courier is connected.
- **No emails or WhatsApp messages are actually sent** (order confirmations, newsletter, contact form replies). Submissions are only stored in the database.
- **Artisans are fictional sample profiles** (clearly labelled on the site). Customer reviews and the three homepage testimonials are sample text.
- **Contact email and WhatsApp number** (`frontend/src/lib/constants.ts`) are placeholders — replace them.
- **Product photos** are crops from the design reference image (low resolution) and two procedurally drawn woven-fabric images for the handloom items. Replace them with real photography in `frontend/public/images/products/` (three images per product: `<name>-1.jpg`, `-2`, `-3`) and update `backend/app/seed.py`.
- **Logo:** a placeholder wordmark and flower mark drawn for this build (`frontend/public/logo.svg`, `logo-mark.svg`). Replace with your own logo files.
- Catalogue has 9 sample products (the brief's six plus three more).

## Project layout
```
backend/app/        main.py, models.py, pricing.py, security.py, seed.py, routers/
frontend/src/app/   pages (home, shop, product, cart, checkout, order, account, artisans, about, quality, support …)
frontend/src/components/   layout/ product/ home/ cart/ order/ artisan/ ui/ …
frontend/src/context/      cart, wishlist, auth, toast state
frontend/src/lib/          api client, types, validation, constants
```

## Deploy on Vercel
The site is two Vercel projects from the same GitHub repo. **I could not deploy from my environment, so this setup is untested — expect to adjust something on the first try.**

1. **Database.** Create a free Postgres database (for example Neon or Supabase) and copy its connection string. Without one, the backend falls back to a temporary SQLite file that is wiped on every cold start (fine only for a quick look).
2. **Backend project.** Vercel → Add New → Project → import the repo → **Root Directory: `backend`**. Add environment variables:
   - `JWT_SECRET` — a random string of 32+ characters (the backend refuses to start in production without it). Generate one: `python -c "import secrets; print(secrets.token_urlsafe(48))"`
   - `DATABASE_URL` — your Postgres connection string.
   Deploy, then open `<backend-url>/health` — it should say `{"status":"ok"}`. The first request creates the tables and loads the sample data.
3. **Frontend project.** Add another project from the same repo → **Root Directory: `frontend`**. Add environment variables:
   - `API_URL` — the backend URL from step 2 (no trailing slash). The build fails on purpose if this is missing.
   - `NEXT_PUBLIC_SITE_URL` — your final site address, e.g. `https://chenethakart.vercel.app` (optional; used for sitemap and link previews).
4. Open the frontend URL and place a test order.

Notes: the login cookie is first-party because the browser only talks to `/api/*` on the frontend, which proxies to the backend (so no CORS setup is needed). The sign-up/login rate limiter lives in memory per serverless instance, so it is a best-effort guard, not a hard limit.

## Tests and CI
- Backend: `cd backend && uv run pytest` (14 tests; uses a temporary SQLite database, or set `TEST_DATABASE_URL` to test on Postgres).
- Frontend: `cd frontend && npm run typecheck && npm run build`.
- GitHub Actions (`.github/workflows/ci.yml`) runs both on every push and pull request.

## Before going live
- Connect a real payment gateway, an email/WhatsApp provider and courier tracking (all simulated today).
- Set a strong `JWT_SECRET` and a real Postgres `DATABASE_URL`.
- Replace sample artisans, reviews, photos, contact details and the logo.
- Re-generate `backend/requirements.txt` after changing backend dependencies: `cd backend && uv export --no-dev --no-hashes --no-emit-project -o requirements.txt`.
