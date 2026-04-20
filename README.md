# 🚀 BizLens

**Stop guessing. Start knowing where your money goes.**

BizLens is a **financial decision engine** for freelancers and small businesses. It turns transactions into **signals**: where cash is leaking, what changed, and **what to do next**—not another passive spreadsheet or bloated accounting screen.

---

## 🧠 The problem

- **Owners don’t really “see” their finances.** Revenue and expenses live in invoices, cards, and ad platforms—not in one coherent story.
- **Typical tools are the wrong shape.** Spreadsheets are flexible but don’t *tell* you anything. Full accounting suites are powerful but heavy; many teams never get to “what should I do Monday?”
- **Decisions get made on gut feel.** Without timely comparisons, concentration risk, and leak detection, people optimize the wrong things—or miss problems until the bank account says so.

---

## 💡 The solution (BizLens)

BizLens **closes the loop**: data → insight → **action**.

- **Real-time intelligence** on your transactions—weekly and monthly lenses, category drivers, profit trajectory.
- **Money-leak detection** that highlights *which* category is costing you vs. a sane baseline—not just “you spent more.”
- **Actionable alerts** with severity and context (spend spikes, profit drop, stale data, recurring patterns)—nudges when it matters.
- **A dashboard you can use daily**—filters, bilingual UI (EN/AR), RTL support, and flows built for fast logging and review.

---

## 🔥 Key features

### Insights engine

- Detect **profit pressure** and expense shifts with period-over-period context  
- **Weekly and monthly** comparisons—with “why” drivers where it adds clarity  
- **Top categories** and concentration—see *where* money went, not only totals  

### Smart alerts

- **Profit drop** and **spend spike** signals (rule-based, deduped, persisted per user)  
- **Recurring expense** detection for subscription-style review  
- **Money-leak** and **forecast** hooks so warnings tie to *behavior*, not vanity metrics  

### Financial dashboard

- **Income, expenses, net profit**, and margin-oriented views (mode-aware: freelancer, e‑commerce, service business)  
- **Trends and breakdowns** (including visual summaries where enabled)  
- **Time-range filters** so metrics, insights, and widgets stay **consistent** across the board  

### Transactions & categories

- Full **CRUD** with validation and safe numeric handling  
- **Filtering** (type, category, date range) and quick-add flows  
- **Categories** as first-class structure (defaults, colors, types) so reporting stays trustworthy  

---

## 🧪 Demo preview

1. **Landing page** — Problem → solution story, bilingual positioning, and a clear “why this exists” before signup.  
2. **Dashboard** — KPIs, insight cards, and widgets that answer *what changed* and *where to look*.  
3. **Alerts** — In-app alert center and critical signals surfaced so the product feels **alive**, not static.  

**Flow:** awareness (landing) → orientation (dashboard) → **action** (alerts & deep links).

---

## 🏗️ Tech stack

| Layer | Technology |
|--------|------------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript, Prisma |
| **Database** | PostgreSQL |
| **Server state** | TanStack React Query |
| **Global UI state** | Zustand (theme, locale, etc.) |
| **Marketing** | Next.js (App Router), Tailwind |

Auth: **JWT + HTTP-only cookies**. Validation: **Zod**. API: versioned REST (`/api/v1/...`).

---

## ⚙️ Getting started

### Prerequisites

- Node.js **≥ 18**  
- PostgreSQL **≥ 14**  
- npm **≥ 9**  

### Install

```bash
npm install
```

Installs all workspaces: `server`, `client`, `marketing`.

### Environment

Copy and configure from each workspace’s `.env.example`:

| Workspace | File |
|-----------|------|
| Server | `server/.env` |
| Client | `client/.env` |
| Marketing | `marketing/.env.local` |

Set `DATABASE_URL` in `server/.env` to your Postgres instance.

### Database

```bash
cd server
npx prisma migrate dev
npm run db:seed          # optional — baseline / demo seed
npm run db:seed:rich     # optional — richer multi-month demo data
```

### Run (development)

From the **repository root**:

```bash
npm run dev:server      # API
npm run dev:client      # App SPA
npm run dev:marketing   # Landing site
```

| Service | URL |
|---------|-----|
| API | http://localhost:4000 |
| App | http://localhost:5173 |
| Marketing | http://localhost:3000 |

### Build

```bash
npm run build:server
npm run build:client
npm run build:marketing
```

---

## 🧠 What makes this different

- **Not just a tracker** — the product is built around **decisions**: leaks, comparisons, and alerts that imply a **next step**, not only historical totals.  
- **Actions over vanity metrics** — deep links, severities, and copy that point at *what to review*, not endless charts for their own sake.  
- **Product-shaped backend** — insight and alert logic live in dedicated services (rules, dedupe, persistence), not one-off controller snippets.  
- **Trust and craft** — safe math, **consistent date ranges** across widgets, **RTL** and **bilingual** polish—details that signal seniority.  
- **Monorepo with intent** — API, app, and marketing ship together so **positioning and behavior stay aligned**.  

Built to read as **shipping judgment**, not homework.

---

## 🚧 Future improvements

- **Smart budgets** — deeper caps, pacing, and scenario planning tied to alerts  
- **Subscription manager** — renewal intelligence, benchmarks, and save/cancel prompts  
- **Notifications** — email digests, mobile push, and routing for critical signals  
- **CSV / bank import** — mapping memory, duplicate detection, reconciliation workflows  

---

## 👤 Author

**Mohamed Zaki** — Frontend developer with a product mindset  

---

<p align="center"><sub>Financial clarity that drives action—not just charts.</sub></p>
