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

### Settings, budgets & assistant *(new)*

- **Settings page** — manage profile, theme, language, currency, and business mode in one place  
- **Locale-aware currency formatting** — every figure follows the user's preferred currency and locale, no more hardcoded `en-US`/`USD`  
- **Category budgets** — monthly caps with progress, over-budget chips, and **suggested caps** based on a 3-month padded average  
- **Decision Assistant** — plain-language digest answering *"what changed this week"*, *"where did profit drop"*, and *"what should I review first"*, each with a deep-link to the right transaction filter  
- **Smarter CSV import** — strict row validation, **duplicate detection** (per `category × amount × day`), and a clear post-import summary  

---

## ✅ Improvement plan delivered

Every to-do in the BizLens Improvement Plan has been shipped. The work spans correctness, security, UX, marketing polish, testing, and new product surfaces:

### 1. Stabilize correctness & product logic
- CSV import now invalidates **transactions, dashboard, and alerts** in one shot, so imported rows appear everywhere immediately.  
- Centralized React Query keys in `client/src/lib/query-keys.ts` — no more `DASHBOARD_KEY` leaking out of the transactions feature.  
- `PublicOnlyRoute` shows a real loading state instead of a blank flash.  
- Theme/language/currency are applied consistently after **register and login** (parity).  
- CSV dates and rows are validated client- and server-side before any DB write.  
- Budget endpoint replaced with **one grouped query per user / month** instead of N full-month aggregates.  
- Insight engine is honest about its windows — fixed comparison ranges, with a documented reason the API ignores `range`.  

### 2. Hardened server: security, reliability, maintainability
- **Prisma versions aligned** — `prisma` and `@prisma/client` both on `5.22`, with a workspace-aware `postinstall` symlink so `prisma generate` works under npm workspaces.  
- Auth hardened: cookie TTL aligned with `JWT_EXPIRES_IN`, **rate limiting** on login/register, JWT no longer round-tripped in the JSON body when the httpOnly cookie suffices.  
- **Prisma error mapping** — foreign-key, unique-constraint, and not-found errors return clean 400/404 responses instead of generic 500s.  
- Dashboard route file split into focused service modules: `dashboard.service.ts`, `assistant.service.ts`, `subscriptions.service.ts`, `budgets.service.ts`, `import.service.ts`, `dashboard.range.ts`.  
- **Structured logger + request IDs** — every log line carries a `requestId` so production traces are correlatable.  

### 3. Polished appearance & UX
- New **Settings page** (`/app/settings`) — profile, theme, language, currency, user mode.  
- New **Budgets page** (`/app/budgets`) — caps, progress bars, suggested budgets.  
- New **Decision Assistant page** (`/app/assistant`) — prioritized notes with deep-link actions.  
- `formatCurrency` is now a hook (`useFormatCurrency`) that respects `language + currency` preferences.  
- `window.confirm` replaced with a custom **`ConfirmDialog`** for a cohesive, accessible delete flow.  
- i18n coverage extended — toasts, mobile nav labels, marketing hero mock data, comparison table, FAQ, pricing, and legal pages all bilingual.  
- Empty states with `EmptyState` everywhere it counts — dashboard, transactions, budgets, alerts, import.  

### 4. Upgraded marketing site
- Mobile **slide-in nav drawer** with overlay and section links.  
- SEO upgraded — `metadataBase`, OG image, Twitter card, icons, locale alternates, plus `robots.ts` and `sitemap.ts`.  
- Switched from external Google Font `<link>` tags to **`next/font`** (Inter + Manrope).  
- Marketing sections kept **server-rendered**; only theme/language controls are client islands.  
- Centralized `siteConfig` (`marketing/src/lib/site.ts`) replaces every scattered `NEXT_PUBLIC_APP_URL` reference.  
- New trust pages — **Pricing**, **FAQ**, **Privacy**, **Terms** — all i18n-driven.  

### 5. Automated tests
- 50+ focused tests under `node:test` + `tsx`, covering:  
  - `safe-math` utilities (`toSafeNumber`, `percentChange`, `shareOf`, `formatMoney`)  
  - JWT token parsing (`auth.tokens`)  
  - Date-range resolution (`dashboard.range`)  
  - Rate-limiter middleware (`rate-limit`)  
  - Centralized error handler (`error-handler`)  
  - Validate middleware
  - Auth, transaction, import, and budget Zod schemas  

  Run with `npm test` from the repo root.

### 6. New product features
- **Settings & preferences** — profile, language, theme, currency, business mode.  
- **Budget management** — caps, progress, over-budget detection, **suggested caps** padded ~10% above a 3-month average and rounded to friendly increments.  
- **Subscription manager** — heuristic recurring detection, monthly + annual cost summary, category attribution.  
- **Smarter CSV import** — duplicate detection on `(userId, categoryId, amount, day)`, opt-out toggle, structured `imported` / `duplicatesSkipped` response.  
- **Actionable alerts** — severity chips, dedup, deep-links into filtered transactions, snooze/dismiss flows.  
- **Cash-flow forecast** — projected month-end profit, expense pace vs. last month, narrative summary.  
- **Decision Assistant** — prioritized plain-language notes (profit trend, biggest swing, forecast, subscriptions, stale-data, weekly pulse) with deep-link actions.  

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
| **Backend** | Node.js, Express, TypeScript, Prisma `5.22` |
| **Database** | PostgreSQL |
| **Server state** | TanStack React Query (centralized `QK` keys) |
| **Global UI state** | Zustand (theme, locale, currency) |
| **Marketing** | Next.js (App Router), Tailwind, `next/font` |
| **Testing** | `node:test` + `tsx` (no extra runtime) |

Auth: **JWT + HTTP-only cookies** with rate-limited login/register. Validation: **Zod**. Logging: **structured logger with request IDs**. API: versioned REST (`/api/v1/...`).

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

### Test

```bash
npm test                # runs every workspace's test script
npm run test --workspace=server
```

The server suite uses Node's native `node:test` with `tsx` — no extra test framework, no DB required.

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

- **Notifications** — email digests, mobile push, and routing for critical signals  
- **Bank-feed import** — direct connectors, mapping memory, undo / reconciliation flows on top of the existing duplicate detection  
- **Team / client mode** — accountant invites, role-based access, exportable monthly summaries  
- **Scenario planning** — “what if I cut category X by 20%?” against the existing forecast  
- **Marketing growth** — comparison pages, freelancer templates, and Arabic-SEO landing pages  

---

## 👤 Author

**Mohamed Zaki** — Frontend developer with a product mindset  

---

<p align="center"><sub>Financial clarity that drives action—not just charts.</sub></p>
