# BizLens - SaaS Dashboard Architecture & Implementation Plan

## 1. Overall System Architecture

BizLens follows a modern, decoupled **Client-Server architecture** utilizing the REST architectural style. This setup ensures separation of concerns, scalability, and an excellent developer experience.

*   **Marketing Site (Landing Page):** A separate frontend application built with **Next.js**. It handles marketing, SEO, and user acquisition. Features include a Hero section, problem/solution explanations, i18n (EN/AR), Theme toggling (Light/Dark), and clear CTAs directing to the main app.
*   **Web App (Client):** A Single Page Application (SPA) built with React (via Vite) and TypeScript for the core dashboard. It uses Tailwind CSS for pragmatic UI components, **Lucide icons** for consistency, and React Query to handle server state and caching. Global UI state (Theme, Language) is managed centrally.
*   **Backend (Server):** A Node.js API powered by Express and TypeScript. It is responsible for handling business logic, authenticating users, and securely communicating with the database. Includes core services like the **Insight Engine**.
*   **Database:** PostgreSQL, chosen for its ACID compliance and relational integrity—crucial for financial data.
*   **ORM:** **Prisma**. The `schema.prisma` file acts as a single-source-of-truth, providing end-to-end type safety.
*   **Data Flow:**
    1.  User interacts with the React UI.
    2.  React Query checks local cache or makes an HTTP request via Axios.
    3.  Express routes the request through authentication and validation middlewares.
    4.  The Service layer (including specialized engines like the Insight Engine) executes business logic and uses Prisma to query PostgreSQL.
    5.  Data updates the React Query cache, triggering UI re-renders with micro-interactions and smooth transitions.

---

## 2. Core Product Enhancements

### User Personalization System ("User Mode")
To provide a tailored experience, the system supports a "User Mode" configuration at the account level.
*   **Modes:** Freelancer, E-commerce, Service Business.
*   **Impact:** 
    *   *Database:* Seeded with mode-specific default categories upon signup.
    *   *Backend:* API logic adapts metric calculations based on the mode.
    *   *Frontend:* Dynamic dashboard rendering. Widgets and layout adapt to surface the most relevant KPIs for the chosen mode.

### Insight Engine (Backend Service)
A dedicated, scalable backend service responsible for generating actionable insights from user transactions.
*   **Capabilities:**
    *   **Weekly Comparison:** Analyzes period-over-period financial health.
    *   **Category Analysis:** Identifies top spending/earning areas and anomalies.
    *   **Trend Detection:** Highlights sustained changes in revenue or expenses.

---

## 3. Clean Folder Structure

Moving to a **feature-based (or modular)** structure keeps related code co-located.

### Marketing Site (`/marketing`)
```text
src/
├── app/              # Next.js App Router (Pages, Layouts)
├── components/       # Marketing components (Hero, Features, CTA)
├── lib/              # Utilities (i18n, Theme switchers)
└── public/           # Static assets
```

### Frontend Web App (`/client`)
```text
src/
├── components/       # Shared UI (Buttons, Inputs, Loading Skeletons)
├── features/         # Domain-driven modules
│   ├── auth/         # Login Form, Auth hooks
│   ├── transactions/ # Transaction List, Quick Add Modal
│   ├── categories/   # Category management
│   └── dashboard/    # Dynamic widgets, Insight Card
├── hooks/            # Global hooks (useTheme, useLanguage, useUserMode)
├── store/            # Global UI State (Zustand/Context for Theme/i18n)
├── lib/              # 3rd party configurations
├── layouts/          # DashboardLayout, AuthLayout
├── pages/            # Page-level components
└── types/            # Shared TypeScript types
```

### Backend (`/server`)
```text
src/
├── config/           # Environment validation, Constants
├── modules/          # Feature modules (routes, controllers, services)
│   ├── auth/         
│   ├── transactions/ 
│   ├── categories/   
│   └── dashboard/    
├── services/         # Core cross-domain services
│   └── insight-engine/ # Insight generation logic
├── middlewares/      # Global Middlewares
├── utils/            # Shared backend utilities
└── prisma/           # schema.prisma, migrations
```

---

## 4. Database Schema (Prisma)

Updated to support User Modes and dynamic requirements.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  passwordHash String
  name         String?
  userMode     UserMode      @default(FREELANCER) // Personalization System
  language     String        @default("en") // i18n preference
  theme        String        @default("light") // UI preference
  
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  transactions Transaction[]
  categories   Category[]
}

model Category {
  id           String        @id @default(uuid())
  name         String
  type         TransactionType 
  isDefault    Boolean       @default(false) // System-seeded based on userMode
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  
  @@unique([name, userId])
}

model Transaction {
  id           String          @id @default(uuid())
  amount       Decimal         @db.Decimal(10, 2)
  type         TransactionType 
  date         DateTime
  description  String?
  
  userId       String
  categoryId   String
  
  user         User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  category     Category        @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  @@index([date])
  @@index([userId])
}

enum TransactionType {
  INCOME
  EXPENSE
}

enum UserMode {
  FREELANCER
  ECOMMERCE
  SERVICE_BUSINESS
}
```

---

## 5. Frontend & UX Enhancements

*   **Global UI State:** Centralized state management for Theme (Light/Dark) and Language (EN/AR).
*   **Iconography:** Standardized on **Lucide Icons** across the platform.
*   **Dashboard Experience:**
    *   **Insight Card:** Prominently displayed at the top, driven by the backend Insight Engine.
    *   **Dynamic Layouts:** Dashboard widgets shift based on `UserMode` (e.g., E-commerce shows gross margin widgets, Freelancers show outstanding invoices widgets).
    *   **Quick Add Flow:** A global, accessible action button to quickly log transactions from anywhere in the app.
*   **Micro-Interactions & Polish:**
    *   **Smart Empty States:** Context-aware illustrations and CTAs when no data is present.
    *   **Loading Skeletons:** Used instead of spinners for perceived performance during data fetching.

---

## 6. API Endpoints Design

*(Endpoints follow RESTful conventions)*

**Auth & User Profile:**
*   `POST /api/v1/auth/register`
*   `POST /api/v1/auth/login` 
*   `GET  /api/v1/auth/me` 
*   `PATCH /api/v1/users/preferences` (Updates Theme, Language, UserMode)

**Transactions (Includes Global Quick Add):**
*   `GET    /api/v1/transactions` 
*   `POST   /api/v1/transactions` 
*   `PATCH  /api/v1/transactions/:id`
*   `DELETE /api/v1/transactions/:id`

**Dashboard & Insight Engine (Read Only):**
*   `GET /api/v1/dashboard/metrics` (Dynamic based on userMode)
*   `GET /api/v1/dashboard/insights` (Calls Insight Engine: Weekly comparison, Category analysis, Trend detection)

---

## 7. Implementation Roadmap

*   [ ] **Phase 1: Foundation & Planning**
    *   Initialize Git and Monorepo setup (`/marketing`, `/client`, `/server`).
    *   Configure ESLint, Prettier, and basic CI/CD.
*   [ ] **Phase 2: Marketing & Landing Page (Next.js)**
    *   Develop Hero section, problem/solution explanation.
    *   Implement Feature highlights and CTA.
    *   Add i18n (EN/AR) and Theme toggling (Light/Dark).
*   [ ] **Phase 3: Database & Backend Core**
    *   Deploy PostgreSQL and initialize Prisma with `UserMode` schema.
    *   Setup Express architecture, error handling, and Auth (JWT).
    *   Implement user registration with mode-specific default category seeding.
*   [ ] **Phase 4: Frontend Core (React/Vite)**
    *   Setup global UI state (Theme, i18n).
    *   Implement authentication screens and global layout.
    *   Integrate Lucide icons and basic UI components (Buttons, Inputs).
*   [ ] **Phase 5: Product Logic & CRUD**
    *   Build transaction and category APIs.
    *   Frontend transaction management and the Global Quick Add flow.
    *   Implement Smart Empty states and Loading Skeletons.
*   [ ] **Phase 6: Insight Engine & Dynamic Dashboard**
    *   Develop the backend Insight Engine service (comparisons, trends).
    *   Build dynamic dashboard API resolving widgets based on `UserMode`.
    *   Frontend Dashboard UI: Insight Card, dynamic widgets, micro-interactions.
*   [ ] **Phase 7: Final Polish & Deployment**
    *   End-to-end testing of data flows.
    *   Production deployment (Vercel for Next.js, Frontend, Neon DB/Railway for Backend).

---

## 8. MVP Scope (Strict)

The first version must only include:

- Authentication
- Transactions CRUD
- Categories
- Basic dashboard (income, expense, profit)
- 2–3 simple insights

Everything else is postponed.
