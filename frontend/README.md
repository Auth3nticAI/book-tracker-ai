# Book Tracker — Frontend (Week 5: AI)

Frontend for the Book Tracker app, extended in Week 5 with an AI assistant page that talks to the Claude-backed endpoints in [week-05-api](https://github.com/Auth3nticAI/week-05-api).

The Week 4 pages (books list, detail, add) are unchanged. What's new is `/chat` — a two-mode chat UI with persistent conversation history.

## Stack

- **Next.js 16** (App Router) with **TypeScript** and **Tailwind CSS v4**
- Client-side fetching with `useEffect` / `useState`
- No extra dependencies — just `next`, `react`, `tailwindcss`

## Pages

| Path | Purpose |
|---|---|
| `/` | Homepage with hero + quick links |
| `/books` | List books, filter empty / loading / error states |
| `/books/new` | Add a new book via a form |
| `/books/[id]` | Book detail + status update + rating + delete |
| `/chat` | AI assistant with two modes: General Chat and Book Recommendations |

## The chat page (`/chat`)

- **Two modes** via a segmented control:
  - **General Chat** → POST `/ai/chat` — generic book assistant, no library context
  - **Book Recommendations** → POST `/ai/recommend` — assistant is given your library and recommends accordingly
- **Conversation history** is held in client state and sent back to the server on every turn so the assistant has full context.
- **Switching modes clears history** so the two contexts don't bleed into each other.
- **Loading state** is a bouncing "Thinking..." bubble in the message stream.
- **Error state** appears as a red bar above the input.
- **User messages** are right-aligned blue bubbles; **assistant messages** are left-aligned slate bubbles.
- **Auto-scrolls** to the bottom when new messages arrive.

## Run

```bash
# 1. Backend must be running on http://localhost:8000
#    See: https://github.com/Auth3nticAI/week-05-api

# 2. Install
npm install

# 3. Configure
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local

# 4. Dev server
npm run dev
```

Open http://localhost:3000.

## Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend (defaults to `http://127.0.0.1:8000`) |

`.env.local` is gitignored by default in Next.js.

## What changed from Week 4

- Added `app/chat/page.tsx` (~210 lines) — the chat UI
- Added "AI Assistant" link to the nav in `layout.tsx`
- Updated the footer label to "Week 5 Lab (AI)"

That's it. The interesting work is on the backend.
