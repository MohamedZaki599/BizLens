# 🚀 BizLens

**Stop guessing. Start knowing where your money goes.**

BizLens is a **financial decision engine** for freelancers and small businesses. It turns transactions into **signals**: where cash is leaking, what changed, and **what to do next**—not another passive spreadsheet or bloated accounting screen.

---

## 🧠 The Problem

- **Owners don't really "see" their finances.** Revenue and expenses live in invoices, cards, and ad platforms—not in one coherent story.
- **Typical tools are the wrong shape.** Spreadsheets are flexible but don't *tell* you anything. Full accounting suites are powerful but heavy.
- **Decisions get made on gut feel.** Without timely comparisons, concentration risk, and leak detection, people miss problems until the bank account says so.

---

## 💡 The Solution

BizLens **closes the loop**: data → insight → **action**.

| What | How |
|------|-----|
| **Real-time intelligence** | Weekly/monthly lenses, category drivers, profit trajectory |
| **Money-leak detection** | Highlights *which* category is costing you vs. a sane baseline |
| **Actionable alerts** | Spend spikes, profit drop, stale data, recurring patterns—with severity and context |
| **Daily dashboard** | Filters, bilingual UI (EN/AR), RTL support, fast logging and review |

---

## 🔥 Key Features

### Intelligence Engine
- Detect **profit pressure** and expense shifts with period-over-period context
- **Weekly and monthly** comparisons with "why" drivers
- **Top categories** and concentration risk detection
- **Semantic localization** — 131 typed translation keys, language-agnostic reasoning chains

### Smart Alerts
- **Profit drop** and **spend spike** signals (rule-based, deduped, persisted per user)
- **Recurring expense** detection for subscription-style review
- **Money-leak** and **forecast** warnings tied to behavior, not vanity metrics

### Financial Dashboard
- **Income, expenses, net profit**, and margin-oriented views (mode-aware: freelancer, e‑commerce, service business)
- **Trends and breakdowns** with visual summaries
- **Time-range filters** — metrics, insights, and widgets stay consistent

### Decision Assistant
- Plain-language digest: *"what changed this week"*, *"where did profit drop"*, *"what to review first"*
- Deep-link actions to the right transaction filter
- Prioritized notes (profit trend, biggest swing, forecast, subscriptions, stale-data)

### Transactions & Categories
- Full **CRUD** with validation and safe numeric handling
- **Filtering** (type, category, date range) and quick-add flows
- **CSV import** with duplicate detection and structured summaries

### Settings & Budgets
- Profile, theme, language, currency, and business mode
- Monthly budget caps with progress bars and **suggested caps** (3-month padded average)
- Locale-aware currency formatting throughout

---

## 🏗️ Tech Stack

| Layer | Technology |
|--------|------------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript, Prisma |
| **Database** | PostgreSQL |
| **Server State** | TanStack React Query |
| **UI State** | Zustand (theme, locale, currency) |
| **Marketing** | Next.js (App Router), Tailwind |
| **Testing** | Node.js native test runner (322 tests) |
| **i18n** | Custom typed key registry (EN + AR, RTL) |

**Auth:** JWT + HTTP-only cookies with rate limiting · **Validation:** Zod · **Logging:** Structured with request IDs · **API:** Versioned REST (`/api/v1/...`)

---

## ⚙️ Getting Started

### Prerequisites

- Node.js **≥ 18**
- PostgreSQL **≥ 14**
- npm **≥ 9**

### Install

```bash
npm install
```

### Environment

Copy `.env.example` files in each workspace:

| Workspace | File |
|-----------|------|
| Server | `server/.env` |
| Client | `client/.env` |
| Marketing | `marketing/.env.local` |

### Database

```bash
cd server
npx prisma migrate dev
npm run db:seed          # baseline seed
npm run db:seed:rich     # multi-month demo data
```

### Development

```bash
npm run dev:server      # API → http://localhost:4000
npm run dev:client      # App → http://localhost:5173
npm run dev:marketing   # Landing → http://localhost:3000
```

### Test

```bash
npm test
```

322 tests using Node's native `node:test` — no extra framework, no DB required.

### Build

```bash
npm run build:server
npm run build:client
npm run build:marketing
```

---

## 📸 Demo Flow

1. **Landing page** — Problem → solution story, bilingual positioning
2. **Dashboard** — KPIs, insight cards, widgets answering *what changed* and *where to look*
3. **Alerts** — In-app alert center with critical signals surfaced
4. **Assistant** — Prioritized plain-language notes with actionable deep links

**Flow:** awareness (landing) → orientation (dashboard) → **action** (alerts & deep links)

---

## 🧠 What Makes This Different

- **Decisions, not dashboards** — leaks, comparisons, and alerts that imply a next step
- **Actions over vanity metrics** — deep links and severities that point at *what to review*
- **Product-shaped backend** — insight and alert logic in dedicated services with rules, dedupe, and persistence
- **Full i18n architecture** — semantic keys with typed contracts; backend emits keys + raw params, frontend resolves to locale-specific strings
- **Trust and craft** — safe math, consistent date ranges, RTL polish, 322 governance tests
- **Monorepo with intent** — API, app, and marketing ship together

---

## 🚧 Roadmap

- **Notifications** — email digests, mobile push for critical signals
- **Bank-feed import** — direct connectors with mapping memory and reconciliation
- **Team mode** — accountant invites, role-based access, exportable summaries
- **Scenario planning** — "what if I cut category X by 20%?" against the forecast

---

## 👤 Author

**Mohamed Zaki** — Frontend developer with a product mindset

---

<p align="center"><sub>Financial clarity that drives action—not just charts.</sub></p>
