## What is Equora.AI?

Equora.AI is a full-stack FinTech platform that combines **real-time market data**, **news sentiment analysis**, and an **AI financial assistant** to help users **understand**, **plan**, and **act** on financial insights—fast.

**Highlights**

* AI Assistant (Gemini) for **conversational finance queries**
* **Real-time** market & crypto data with technical indicators (RSI, MACD, MAs)
* **Sentiment analysis** over news to visualize market mood & impact
* **Personalized planning** and portfolio tracking
* **Global & geographic** market visualization

VIEW THE WEBSITE HERE!! 
[https://equoraai.vercel.app/](Link)

---

## Problem → Solution

**Problem:** Most platforms show raw prices but lack **AI insights**, **live sentiment**, and **personalized planning**—and data is fragmented across many tools.

**Solution:** Equora.AI unifies **data ingestion**, **AI reasoning**, and **visual analytics** into a single, responsive dashboard.

---

## Architecture (High Level)

```
Frontend (React+TS, Vite)
  ├─ Firebase Auth (Email/OAuth)
  ├─ React Query (data fetching & cache)
  ├─ Recharts (viz), Framer Motion (UX)
  └─ Routes: /dashboard /markets /portfolio /ai

Backend (Node+Express)
  ├─ API Gateway & Auth middleware (Firebase token verify)
  ├─ Prisma ORM → PostgreSQL
  ├─ Integrations: Alpha Vantage, Yahoo Finance
  ├─ AI Service: Google Gemini
  ├─ Jobs: node-cron (newsletters, refresh)
  └─ Nodemailer (alerts/newsletter)

Data Flow
  User → Firebase → Backend verify
  Market Requests → External APIs → Normalize → Cache/DB → Frontend
  AI Query → Gemini → Post-process → Respond
  Portfolio Updates → DB (Prisma) → UI
```

---

## Tech Stack

**Frontend**

* **React 18 + TypeScript** — type safety, fewer runtime bugs
* **Vite** — fast dev server & HMR
* **Tailwind CSS + shadcn/ui + Radix UI** — rapid, accessible components
* **React Query** — declarative data fetching & caching
* **React Router DOM** — SPA navigation
* **Recharts** — robust charts
* **Framer Motion** — micro-interactions & animations
* **Firebase Auth** — secure, scalable auth + social login

**Backend**

* **Node.js + Express** — performant, JS end-to-end
* **Prisma + PostgreSQL** — type-safe DB access, great DX
* **Google Gemini** — AI analysis & recommendations
* **Axios** — API client
* **Nodemailer** — transactional emails/newsletters
* **node-cron** — scheduled refreshes & jobs

---

## Monorepo Structure (example)

```
equora-ai/
├─ EquoraAI_Dashboard/
│  ├─ frontend/
├─ Equora_AI_node_backend/ 
├─ node_modules/
└─ README.md
```

---

## Setup & Installation

### 1) Prerequisites

* Node.js ≥ 18
* PostgreSQL ≥ 13
* A Firebase project (for Auth)
* API keys (Alpha Vantage / Yahoo Finance alt), Google Gemini
* (Optional) SMTP creds for Nodemailer

### 2) Clone

```bash
git clone https://github.com/<your-username>/equora-ai.git
cd equora-ai
```

### 3) Backend env

Create `apps/backend/.env`:

```env
# Server
PORT=8080
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/equora_ai?schema=public"

# External APIs
ALPHAVANTAGE_API_KEY=your_key
YAHOO_FINANCE_API_KEY=your_key  # if applicable

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=service-account@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Gemini
GEMINI_API_KEY=your_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
```

### 4) Frontend env

Create `apps/frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_APP_ID=your_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

### 5) Install deps & generate Prisma client

```bash
# Backend
cd apps/backend
npm install
npx prisma migrate dev --name init
npx prisma db seed   # if you have a seed script

# Frontend
cd ../frontend
npm install
```

### 6) Run locally

```bash
# Backend
cd apps/backend
npm run dev   # starts on http://localhost:8080

# Frontend
cd ../frontend
npm run dev   # Vite on http://localhost:5173
```

---

## 🔌 API Overview (sample)

*Base URL:* `/api`

**Auth**

* `POST /auth/verify` — verify Firebase ID token (middleware usage)

**Markets**

* `GET /markets/summary` — global snapshot
* `GET /markets/quotes?symbol=AAPL` — live quote
* `GET /markets/indicators?symbol=AAPL&ind=rsi,macd` — technicals
* `GET /markets/sentiment?symbol=AAPL` — news sentiment

**Portfolio**

* `GET /portfolio` — user holdings
* `POST /portfolio` — add/update positions
* `DELETE /portfolio/:id` — remove holding

**AI**

* `POST /ai/ask` — `{ question, context? }` → Gemini response

**Newsletter/Alerts**

* `POST /notify/subscribe`
* (cron) `/jobs/daily-digest` — internal

---

## 🗃️ Database (Prisma snapshot)

`User`, `Portfolio`, `Holding`, `Plan`, `Recommendation`, `NewsItem`, `SentimentSnapshot`

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  displayName   String?
  createdAt     DateTime @default(now())
  portfolio     Portfolio?
  preferences   Json?
}

model Portfolio {
  id        String    @id @default(cuid())
  userId    String    @unique
  user      User      @relation(fields: [userId], references: [id])
  holdings  Holding[]
  updatedAt DateTime  @updatedAt
}

model Holding {
  id        String   @id @default(cuid())
  portfolio Portfolio @relation(fields: [portfolioId], references: [id])
  portfolioId String
  symbol    String
  quantity  Float
  avgPrice  Float
  createdAt DateTime @default(now())
}
```

---

## Scheduled Jobs (node-cron)

* **Daily Market Refresh** — cache important tickers (faster UI)
* **Sentiment Sweep** — refresh sentiment snapshots
* **Daily Digest Email** — top movers, portfolio P/L, AI summary

---

## Security

* **Auth**: Firebase (ID token verified server-side)
* **API**: rate limiting, input validation, error normalization
* **Secrets**: environment variables, never committed
* **DB**: parameterized queries via Prisma

---

## Performance

* React Query cache & background refresh
* Batched API calls and normalized responses
* Lazy-loaded routes & code splitting
* Minimal over-fetching with indicator-scoped endpoints
  
---

## 🤝 Contributing

PRs welcome. Please open an issue to discuss features/bugs.
Run `eslint` / `prettier` before committing.
