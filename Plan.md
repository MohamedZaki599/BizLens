# Execution Plan: BizLens

This document serves as the strict, task-based execution plan for BizLens. It is designed for AI-assisted development, ensuring that work is predictable, trackable, and production-ready.

---

## Execution Rules

* **Do NOT skip tasks**
* **Do NOT jump ahead**
* **Each task must be completed and tested before moving on**
* **Keep tasks small and focused**

---

## AI-Assisted Development Workflow

This project leverages an AI-assisted development loop to maximize velocity and quality.

1. **AI generates the code:** Based on the specific Task instructions, the AI writes the implementation.
2. **Developer reviews the code:** The developer verifies the logic, tests the feature, and ensures it meets the Definition of Done.
3. **After approval:** The developer formally commits the work using the following commands:
   * `git add .`
   * `git commit -m "feat: <task name>"`
   * `git push origin main`

---

## Workflow System

Every task in this document must transition through the following states. Do not start a new task until the current one reaches `DONE`.

`TODO` &rarr; `IN PROGRESS` &rarr; `REVIEW` &rarr; `DONE`

---

## Epics & Tasks

### Epic 1: Project Setup

#### Task 1.1: Initialize Repositories
*   **Status:** `TODO`
*   **Description:** Set up the foundational monorepo structure for the frontend, backend, and marketing sites.
*   **Technical Requirements:** Initialize Git, configure `package.json` workspaces (if applicable), and set up global ESLint/Prettier configurations.
*   **Expected Output:** A clean, standardized repository ready for code.
*   **Definition of Done:** Linters run successfully, and the folder structure matches the architecture document.

#### Task 1.2: Database & ORM Setup
*   **Status:** `TODO`
*   **Description:** Initialize the PostgreSQL database and configure Prisma ORM.
*   **Technical Requirements:** Install Prisma, define the core `schema.prisma` (User, Category, Transaction), and run the initial migration.
*   **Expected Output:** Connected database with a generated Prisma client.
*   **Definition of Done:** `npx prisma db push` succeeds, and models are type-safe and accessible in the backend.

---

### Epic 2: Authentication

#### Task 2.1: User Registration & Login API
*   **Status:** `TODO`
*   **Description:** Build the backend routes for secure user authentication.
*   **Technical Requirements:** Implement `/api/v1/auth/register` and `/api/v1/auth/login`. Use bcrypt for password hashing and issue secure, HTTP-only JWT cookies.
*   **Expected Output:** Functional, secure authentication endpoints.
*   **Definition of Done:** API can successfully register a user and return a valid JWT cookie upon login.

#### Task 2.2: Frontend Auth Integration
*   **Status:** `TODO`
*   **Description:** Build login and registration screens and connect them to the Auth API.
*   **Technical Requirements:** Create React components utilizing Zod and React Hook Form. Implement an auth context/state provider.
*   **Expected Output:** Users can authenticate via the UI and access protected routes.
*   **Definition of Done:** Successful login redirects to the dashboard; invalid credentials display correct error messages.

---

### Epic 3: Categories

#### Task 3.1: Category API Endpoints
*   **Status:** `TODO`
*   **Description:** Build CRUD endpoints for user Categories.
*   **Technical Requirements:** Implement GET, POST, and DELETE routes. Enforce unique category names per user.
*   **Expected Output:** Fully functional Category REST API.
*   **Definition of Done:** Endpoints successfully process operations for a specifically authenticated user without bleeding data.

#### Task 3.2: Category UI Management
*   **Status:** `TODO`
*   **Description:** Build the frontend interfaces to manage categories.
*   **Technical Requirements:** React components for listing, adding, and removing categories. Manage server state with React Query.
*   **Expected Output:** A working category management view.
*   **Definition of Done:** User can add/delete a category, and the UI updates optimistically or via query invalidation.

---

### Epic 4: Transactions

#### Task 4.1: Transaction API Endpoints
*   **Status:** `TODO`
*   **Description:** Build CRUD endpoints for Transactions.
*   **Technical Requirements:** Implement GET (with date/type filtering), POST, PATCH, and DELETE routes. Validate currency inputs strictly.
*   **Expected Output:** Highly reliable Transaction REST API.
*   **Definition of Done:** API accurately records amounts, dates, and associations (User/Category) in the database.

#### Task 4.2: Global Quick Add UI
*   **Status:** `TODO`
*   **Description:** Implement the persistent "Quick Add" transaction modal.
*   **Technical Requirements:** Build a glassmorphic modal accessible from anywhere. Implement strict form validation (amount, date, type, category).
*   **Expected Output:** A frictionless, high-speed form for logging transactions.
*   **Definition of Done:** A user can add a transaction in < 5 seconds; the UI provides instant success feedback and closes automatically.

---

### Epic 5: Insight Engine

#### Task 5.1: Comparative Analytics Logic
*   **Status:** `TODO`
*   **Description:** Implement backend logic to compare current vs. previous periods.
*   **Technical Requirements:** Calculate period offsets, aggregate Prisma data, compute fractional percentage changes, and format human-readable strings.
*   **Expected Output:** A dedicated service function returning formatted insight text.
*   **Definition of Done:** Function returns mathematically accurate text strings (e.g., "Expenses up 15%") based on database aggregates.

#### Task 5.2: Extremes & Categorization Logic
*   **Status:** `TODO`
*   **Description:** Implement backend logic to identify top-performing/spending categories.
*   **Technical Requirements:** Group transactions by category, sort by total sum, and format insight strings.
*   **Expected Output:** A dedicated service function returning insights.
*   **Definition of Done:** Function accurately identifies and formats the top category from a user's dataset (e.g., "Top earning category is Design").

---

### Epic 6: Dashboard

#### Task 6.1: Dashboard API Aggregation
*   **Status:** `TODO`
*   **Description:** Build the summary API endpoint for dashboard metrics.
*   **Technical Requirements:** Implement `/api/v1/dashboard/metrics` to return total income, total expenses, and net profit for a given timeframe.
*   **Expected Output:** JSON payload containing fast, aggregated financial metrics.
*   **Definition of Done:** Endpoint correctly sums data while respecting the requested date ranges and the User Mode.

#### Task 6.2: Dashboard UI Implementation
*   **Status:** `TODO`
*   **Description:** Build the main visual dashboard view.
*   **Technical Requirements:** Integrate the Insight Card, Metric Stat Cards, and basic charts. Fetch data using React Query.
*   **Expected Output:** A responsive, data-rich financial dashboard.
*   **Definition of Done:** Dashboard loads without error, displays accurate aggregated numbers, and properly renders the Insight Cards.

---

### Epic 7: UI/UX Polish

#### Task 7.1: Micro-interactions & Empty States
*   **Status:** `TODO`
*   **Description:** Refine the user experience with animations and guidance.
*   **Technical Requirements:** Implement smart empty states for new users. Replace raw spinners with skeleton loaders for all data fetching. Add smooth hover/transition states.
*   **Expected Output:** A highly polished, premium application feel.
*   **Definition of Done:** No raw spinners are visible; all async data loads utilize skeletons; empty lists display helpful, guiding illustrations.

---

### Epic 8: Landing Page (Next.js)

#### Task 8.1: Build Marketing Site
*   **Status:** `TODO`
*   **Description:** Develop the Next.js landing page to drive conversions.
*   **Technical Requirements:** Build the Hero section, feature list, and clear CTAs linking to the main app. Apply the design system.
*   **Expected Output:** A fast, SEO-optimized static site.
*   **Definition of Done:** Site is fully responsive, matches the UI specifications, and successfully routes users to the auth flow.

---

### Epic 9: Deployment

#### Task 9.1: Deploy Database & Backend
*   **Status:** `TODO`
*   **Description:** Host the PostgreSQL database and the Express API in a production environment.
*   **Technical Requirements:** Deploy DB (e.g., Neon). Deploy Node API (e.g., Railway/Render). Configure all production environment variables and CORS.
*   **Expected Output:** A secure, publicly accessible API endpoint.
*   **Definition of Done:** The deployed API responds successfully to external requests (verified via Postman/cURL).

#### Task 9.2: Deploy Frontend & Landing Page
*   **Status:** `TODO`
*   **Description:** Host the React SPA and Next.js marketing site.
*   **Technical Requirements:** Deploy both frontends to Vercel. Connect custom domain names. Ensure API URLs point to the production backend.
*   **Expected Output:** Live, publicly accessible web applications.
*   **Definition of Done:** A user can successfully sign up, log in, and use the fully functional app via the production URL.

---

## How to Start

To begin executing this plan, start with **Task 1.1: Initialize Repositories**.

Create the foundational directories (`/client` and `/server`), initialize Git, and set up your essential configuration files (`package.json`, ESLint, Prettier). Once this structure is in place and linting correctly, mark Task 1.1 as `DONE`, execute the git commit workflow, and proceed to Task 1.2.
