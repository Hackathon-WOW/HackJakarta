# Grow — Hubungkan UMKM dengan Investor

A platform that helps Indonesian MSMEs (UMKM) assemble credible, investor-ready financial
reports & documents — directly from their POS or spreadsheets — and helps investors discover
the most prospective businesses.

Built for **HackJakarta**. Three roles: **MSME**, **INVESTOR**, **ADMIN**.

---

## Architecture

A **microservices** backend (Bun + Elysia) behind a **custom API gateway**, with a **Next.js**
frontend. Postgres + Redis + RabbitMQ for storage, caching, and events.

```
frontend/                Next.js 14 · Tailwind · Framer Motion · Recharts (theme: emerald + amber)
backend/
  gateway/               Elysia API gateway :8080 — verifies JWT, injects identity, proxies, CORS
  services/
    auth-service/        :3004  register / login / me   (bcrypt + JWT, roles)
    umkm-core-service/   :3003  UMKM profiles, showcase, prospect score, investor interest, admin
    finance-report-service/ :3002  CSV/Excel parsing, manual entry, monthly reports, documents
    pos-integration-service/ :3001  simulated POS connectors (Moka/Pawoon/majoo/GoBiz) + sync
  shared/                Prisma schema + client, auth, redis, rabbitmq, scoring, metrics, seed
docker-compose.yml       postgres · redis · rabbitmq · migrate(seed) · 4 services · gateway
```

**Event flow:** POS sync → `POS_TRANSACTION_SYNCED` (RabbitMQ) → finance-service rebuilds the
monthly reports and recomputes the **Prospect Score** (0–100: profitability, scale, growth,
data completeness, documents).

**Data sources for investor-ready reports:** branded POS connectors (Moka POS, Pawoon, majoo,
GoBiz/GoFood — simulated, structured so a real adapter can drop in), real CSV/Excel upload
(POS-export or ledger schemas), and manual transaction entry.

---

## Run with Docker (recommended)

```bash
docker compose up --build
```

Brings up Postgres, Redis, RabbitMQ, runs migrations + seeds demo data, then starts all four
services and the gateway. Gateway is at **http://localhost:8080**.

Then start the frontend:

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

## Run locally (without Docker for the services)

```bash
# 1. infra only
docker compose up -d postgres redis rabbitmq

# 2. backend
cd backend
bun install
cp .env.example .env
bun run prisma:generate
bun run prisma:migrate      # or prisma:deploy
bun run seed
bun run dev:all             # auth + umkm + finance + pos + gateway

# 3. frontend
cd ../frontend
npm install
npm run dev
```

> Note: if running services on the host, stop them before `docker compose up` (ports overlap).

---

## Demo accounts (created by the seed)

| Role     | Email                     | Password     |
|----------|---------------------------|--------------|
| Admin    | `admin@grow.id`      | `admin123`   |
| Investor | `investor@grow.id`   | `investor123`|
| MSME     | `kopi.senja@umkm.id`      | `umkm123`    |

(Other seeded MSMEs share the `umkm123` password — see `backend/shared/seed.ts`.)

---

## Demo walkthrough

1. **MSME** — log in → Dashboard shows Prospect Score + readiness checklist. Connect a POS
   (Integrasi POS) and **Sync**, or upload a CSV/Excel in **Keuangan**, or add a manual
   transaction. Reports & charts update automatically. Generate investor documents, then
   **Terbitkan** to the showcase.
2. **Admin** — log in → review queue → **Setujui** to publish an MSME to the public showcase.
3. **Investor** — browse **/showcase**, open a profile, view the financial analysis, and
   **Nyatakan Minat**. Manage the pipeline (Interested → Meeting → Deal) in the dashboard.

## Deploy (DigitalOcean)

Production is a single command on a Droplet via `docker-compose.prod.yml` (frontend + gateway +
services + Postgres/Redis/RabbitMQ + Caddy for TLS on one domain). See **[DEPLOY.md](DEPLOY.md)**.

```bash
cp .env.production.example .env   # edit PUBLIC_URL, DOMAIN, JWT_SECRET, POSTGRES_PASSWORD, AI_API_KEY
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml run --rm migrate bun run shared/seed.ts   # seed once
```

## AI features

A dedicated **`ai-service`** (`:3005`, route `/api/ai/*`) powers four AI features, each grounded
in the MSME's real financial data:

1. **AI Insights** (MSME dashboard) — analysis of margins, growth, and data completeness + next steps.
2. **AI Investor Brief** (UMKM detail page) — strengths, risks, and due-diligence questions for investors.
3. **AI Document Writer** (Documents page) — generates business profile / financial statement / pitch in Markdown.
4. **AI Advisor chat** (`/dashboard/advisor`) — a co-pilot that answers investor-readiness questions.

It's **provider-agnostic** via the OpenAI-compatible Chat API and ships with a **data-driven fallback**,
so it works out of the box with zero config. To enable real AI, set these in `backend/.env` (all free):

```bash
# Groq (free, fast)
AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_KEY=gsk_your_free_key
AI_MODEL=llama-3.3-70b-versatile

# or Google Gemini (free tier)
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
AI_API_KEY=your_gemini_key
AI_MODEL=gemini-2.0-flash

# or Ollama (fully local, no key)
AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=ollama
AI_MODEL=llama3.2
```

(For Docker, pass the same vars via the environment — they're wired into `docker-compose.yml`.)

## Tech

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Framer Motion, Recharts, lucide-react,
  react-hot-toast, react-dropzone. Fonts: Fraunces (display) + Plus Jakarta Sans (body).
- **Backend:** Bun, Elysia, Prisma, PostgreSQL, Redis, RabbitMQ, JWT (jsonwebtoken), bcryptjs,
  papaparse + SheetJS (xlsx).
