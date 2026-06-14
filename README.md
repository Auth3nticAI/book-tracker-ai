# Book Tracker — Week 7 Lab

A full-stack AI book journal. Track what you've read, capture quotes and reactions while you read, get AI-driven recommendations grounded in your library, and run a Claude agent that can manage your collection through natural language.

**Stack:** Next.js (App Router) + Tailwind frontend · FastAPI + SQLAlchemy backend · PostgreSQL 16 · Claude API. Everything containerised. One command to run the whole thing: `docker compose up --build`.

CSE552 Week 7 Lab — built on the Week 4–6 labs and extended with a second model (notes), a second AI endpoint (notes synthesis), and a Docker Compose deployment.

## Project description (for the submission portal)

> Book Tracker is an AI-powered reading journal that helps deliberate readers turn their library into a usable knowledge base. Users CRUD books, capture notes (quotes, page numbers, reactions) tied to each book, get Claude-powered recommendations that cite their actual ratings and currently-reading list, and converse with an AI agent that can search, add, update, and delete books on their behalf. The "AI synthesis" feature pulls a single book's notes into a structured summary so the reader can revisit what they got out of the book without re-reading it.

## What's in the box

**Backend** (`backend/`)
- 11+ API endpoints across two resources (books, notes) and three AI endpoints
- Two SQLAlchemy models with a one-to-many relationship: `Book` ← `Note` (FK with `ON DELETE CASCADE`)
- Three Claude-backed endpoints:
  - `POST /ai/chat` — general book assistant
  - `POST /ai/recommend` — personalised, injects the user's library into the system prompt
  - `POST /ai/agent` — tool-use loop with 5 tools (read/write/delete books)
  - `POST /ai/books/{id}/summarize-notes` — synthesises a book's notes into a structured summary
- CORS configured for `http://localhost:3000`
- Pydantic schemas for every request/response

**Frontend** (`frontend/`)
- 5 pages: Home, Books list, Add book, Book detail (with Notes panel + AI synthesis), AI chat
- Two chat modes: general + book-aware recommendations
- Loading and error states on every fetching page
- `NEXT_PUBLIC_API_URL` env var for the API base URL
- Built as a Next.js **standalone** output for a slim Docker runtime

**Docker**
- Backend `Dockerfile` (python:3.11-slim + libpq for psycopg2)
- Frontend `Dockerfile` (multi-stage node:20-alpine → standalone runtime)
- Root `docker-compose.yml` wires db (Postgres 16 with healthcheck) + backend + frontend
- Backend uses `env_file: ./backend/.env` so the `ANTHROPIC_API_KEY` never appears in the compose file
- Postgres data persisted in the `pgdata` named volume — survives container restarts

## Run it

```bash
# 1. Add your Claude API key to backend/.env
cat > backend/.env <<EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/booktracker
ANTHROPIC_API_KEY=sk-ant-...
EOF

# 2. Start everything
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend Swagger UI: http://localhost:8000/docs
- Postgres: inside the `db` container, port 5432 (not exposed by default)

To stop: `docker compose down`. Data is preserved between runs via the `pgdata` volume.

## Verified end-to-end

After `docker compose up --build`:
- ✅ `docker compose ps` shows all three services healthy ([screenshots/docker-compose-ps.png](screenshots/docker-compose-ps.png))
- ✅ Create a book via the UI or `POST /books`
- ✅ Add notes tied to that book via `POST /books/{id}/notes`
- ✅ AI synthesis pulls notes into a structured summary citing the actual content + page numbers
- ✅ Agent responds to multi-step requests like *"finished Dune, give it 5 stars, also what am I reading?"* with two tool calls in sequence
- ✅ `docker compose restart backend` — data persists; books and notes are still there

## Code layout

```
week-07-lab/
├── docker-compose.yml         # wires db + backend + frontend
├── backend/
│   ├── Dockerfile             # python:3.11-slim runtime
│   ├── .dockerignore
│   ├── main.py                # FastAPI routes (books, notes, chat, recommend, agent, summarize)
│   ├── agent.py               # tool schemas, tool functions, run_agent loop
│   ├── database.py            # engine, SessionLocal, Base, get_db
│   ├── models.py              # Book ↔ Note (one-to-many, cascade delete)
│   ├── schemas.py             # Pydantic models
│   ├── requirements.txt
│   └── reflection.md          # Week 6 lab reflection (kept for context)
└── frontend/
    ├── Dockerfile             # multi-stage: builder + standalone runner
    ├── .dockerignore
    ├── next.config.ts         # output: "standalone"
    ├── app/                   # App Router pages
    │   ├── page.tsx           # home
    │   ├── books/
    │   │   ├── page.tsx       # list
    │   │   ├── new/page.tsx   # add form
    │   │   └── [id]/page.tsx  # detail + Notes panel + AI synthesis
    │   └── chat/page.tsx      # AI chat with 2 modes
    └── lib/types.ts           # shared Book + Note types
```

## Demo flow (5 minutes)

1. **What you built** (30s) — A reading journal that gets smarter as you use it. For people who want their books to stay in their head, not just on a shelf.
2. **Live demo** (3min)
   - Show `docker compose ps` — all three services healthy
   - Add a book, mark it read, rate it 5 stars
   - Open the detail page, add two notes with page numbers
   - Hit "AI synthesis" — Claude returns a structured summary citing the notes
   - Switch to AI Assistant → Book Recommendations, ask "what should I read next?" — Claude cites the just-rated book
   - Switch to AI Agent (via `/docs` or curl), ask "delete the book about Kleppmann" — agent calls `get_books` then `delete_book`
3. **Technical highlight** (1min) — The agent loop. Five tool schemas, the run_agent function that handles `tool_use` vs `end_turn`, and the step logger that lets the UI show what tools were called. Walk through one iteration.
4. **What's next** (30s) — Per-book embeddings + a "find me something like this" semantic search powered by a Postgres pgvector column. Same agent loop, one more tool.
```
