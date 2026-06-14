# Deploying Book Tracker AI

The repo ships a [`render.yaml`](./render.yaml) Blueprint that provisions all three
tiers — Postgres, the FastAPI backend, and the Next.js frontend — on [Render](https://render.com)'s
free plan.

## One-time deploy (Render Blueprint)

1. **Push to GitHub** (done) and sign in to Render with that GitHub account.
2. **New → Blueprint**, pick this repo. Render reads `render.yaml` and shows the three services.
3. **Set the secret**: on `book-tracker-backend`, set `ANTHROPIC_API_KEY` to your Claude key.
4. **Apply.** Render builds the images and creates the database (first build takes a few minutes).
5. **Wire the two URLs** (they only exist after the first deploy):
   - On **book-tracker-backend** → `ALLOWED_ORIGINS` = your frontend URL
     (e.g. `https://book-tracker-frontend.onrender.com`). Save → it restarts; CORS now allows the browser.
   - On **book-tracker-frontend** → `NEXT_PUBLIC_API_URL` = your backend URL
     (e.g. `https://book-tracker-backend.onrender.com`). Save → **Manual Deploy → Clear build cache & deploy**
     (this value is baked into the bundle at build time, so it needs a rebuild).
6. Open the frontend URL.

## 💸 Cost safety (important for a public demo)

The backend calls the Claude API with **your** key, so a public URL means strangers can spend your
credits. Before sharing the link, set a **spend limit** in the
[Anthropic console](https://console.anthropic.com/settings/limits). Render's free web services also
sleep after ~15 min idle, which caps casual abuse but isn't a real control.

## Config reference

| Variable | Service | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | Wired automatically from the Render Postgres instance |
| `ANTHROPIC_API_KEY` | backend | Your Claude key (secret) |
| `ALLOWED_ORIGINS` | backend | Comma-separated browser origins allowed by CORS; defaults to localhost |
| `NEXT_PUBLIC_API_URL` | frontend | Backend base URL, baked into the browser bundle at build time |

## Local (unchanged)

```bash
docker compose up --build   # http://localhost:3000, API at http://localhost:8000/docs
```
