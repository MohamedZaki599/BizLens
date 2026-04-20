# BizLens

> **Understand your business in under 10 seconds.**

BizLens is a streamlined SaaS financial dashboard built for freelancers, small business owners, and service providers. It translates raw transactions into instant clarity through a dedicated **Insight Engine**.

## Monorepo Structure

```
bizlens/
├── server/      # Express + TypeScript + Prisma + PostgreSQL API
├── client/      # Vite + React + TypeScript + Tailwind dashboard SPA
└── marketing/   # Next.js marketing/landing site
```

## Tech Stack

| Layer        | Tech                                                            |
| ------------ | --------------------------------------------------------------- |
| Backend      | Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt   |
| Client (App) | React 18, Vite, TypeScript, Tailwind CSS, React Query, Zustand  |
| Marketing    | Next.js 14 (App Router), Tailwind CSS, i18n                     |
| Tooling      | ESLint, Prettier, Zod, React Hook Form, Lucide Icons            |

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

### Install

```bash
npm install
```

This installs dependencies for all workspaces (`server`, `client`, `marketing`).

### Environment

Create the following `.env` files (copy from each workspace's `.env.example`):

- `server/.env`
- `client/.env`
- `marketing/.env.local`

### Database

```bash
cd server
npx prisma migrate dev --name init
npm run db:seed   # optional: seed default categories
```

### Run

```bash
# Terminal 1 - API
npm run dev:server

# Terminal 2 - Client SPA
npm run dev:client

# Terminal 3 - Marketing site
npm run dev:marketing
```

| App        | URL                       |
| ---------- | ------------------------- |
| API        | http://localhost:4000     |
| Client     | http://localhost:5173     |
| Marketing  | http://localhost:3000     |

## MVP Scope

- Authentication (register / login / me)
- Categories CRUD (with seeded defaults per User Mode)
- Transactions CRUD (with global Quick Add)
- Dashboard metrics (income, expense, profit)
- Insight Engine (2–3 simple insights)

## License

Proprietary — BizLens.
