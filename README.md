# Book Tracker AI

![CI](https://github.com/Auth3nticAI/book-tracker-ai/actions/workflows/ci.yml/badge.svg)

> A reading journal that turns your library into a queryable knowledge base. Track what you've read, capture page-anchored notes, get Claude-powered recommendations grounded in your actual ratings, and hand the whole library to a tool-use agent that can search, add, update, and delete on your behalf.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Anthropic](https://img.shields.io/badge/Claude-Sonnet_4.6-D97757?style=flat&logo=anthropic&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)

---

![docker compose ps — all three services healthy](screenshots/docker-compose-ps.png)

## What's interesting

Three Claude integrations, each demonstrating a different pattern:

- **Personalized recommendations** — `/ai/recommend` injects your library (titles, statuses, ratings) into the system prompt. The reply *cites the books you actually rated* rather than guessing.
- **Note synthesis** — `/ai/books/{id}/summarize-notes` pulls a single book's notes into a structured summary you can revisit later. Context injection of app data + format constraints.
- **Tool-use agent** — `/ai/agent` runs Claude in a tool loop with 5 tools (read, add, update, delete books). Handles multi-step requests like *"finished Dune, give it 5 stars — also what am I reading?"* with two tool calls in sequence.

![agent multi-step response](backend/screenshots/agent-multi-step.png)

## Stack

**Frontend** — Next.js 16 App Router · TypeScript · Tailwind 4 · 5 pages (Home, Books list, Add Book, Book detail with Notes panel, AI Chat) · loading + error states throughout · `NEXT_PUBLIC_API_URL` env var for the API base

**Backend** — FastAPI · SQLAlchemy 2 · Pydantic for validation · 11+ endpoints across books, notes, chat, recommend, agent, summarize · CORS for `localhost:3000`

**Data** — PostgreSQL 16 in a Docker volume · `Book` ←→ `Note` one-to-many with `ON DELETE CASCADE`

**Deploy** — Multi-stage Dockerfile for the frontend (standalone Next.js runtime) · backend Dockerfile · root `docker-compose.yml` wires everything · `env_file: ./backend/.env` keeps secrets off the compose file

## Run

```bash
# 1. Add your Claude API key to backend/.env
cat > backend/.env <<EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/booktracker
ANTHROPIC_API_KEY=sk-ant-...
EOF

# 2. Start everything
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend (Swagger) → http://localhost:8000/docs

## Demo flow (what to show in 3 minutes)

1. Add a book, mark it read, rate it 5/5
2. Open the detail page, add two notes with page numbers
3. Hit **AI synthesis** — Claude returns a structured summary citing the notes (with page numbers)
4. Open AI Assistant → Book Recommendations, ask *"what should I read next?"* — Claude cites the just-rated book
5. From Swagger UI, send `POST /ai/agent` with *"delete the book by Kleppmann"* — agent calls `get_books` then `delete_book`
6. `docker compose restart backend` — data persists across the restart

## Project layout

```
book-tracker-ai/
├── docker-compose.yml         # wires db + backend + frontend
├── backend/
│   ├── Dockerfile             # python:3.11-slim runtime
│   ├── main.py                # FastAPI routes
│   ├── agent.py               # tool schemas + tool functions + run_agent loop
│   ├── database.py            # engine, SessionLocal, Base, get_db
│   ├── models.py              # Book ←→ Note (cascade delete)
│   ├── schemas.py             # Pydantic models
│   └── requirements.txt
└── frontend/
    ├── Dockerfile             # multi-stage node:20-alpine → standalone runtime
    ├── next.config.ts         # output: "standalone"
    ├── app/                   # App Router pages
    └── lib/types.ts           # shared Book + Note types
```

## Background

Built as the Week 7 capstone for **CSE552 — Fullstack Software Development in the Age of AI Agents**. The course traced the full stack across seven weeks (HTML/CSS → React → FastAPI → Postgres → Claude → agents → Docker), and this is the end state — everything wired together, deployed via Compose, runnable on a recruiter's laptop with one command.
