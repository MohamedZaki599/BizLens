# BizLens - Design System & UI Specification

## 1. Design Philosophy

**Creative North Star: The Precision Curator**
BizLens moves away from the cluttered, "boxed-in" nature of traditional SaaS, adopting an editorial approach to data density. It draws inspiration from the technical rigor of high-end developer tools and the fluid, light-filled aesthetics of modern fintech.

*   **Simplicity over complexity:** We break the "template" look by prioritizing spatial intent over structural lines. By utilizing generous whitespace and a sophisticated "Tonal Layering" strategy, the interface feels like a high-end digital workstation.
*   **Insights over raw data:** The UI is designed to push the "Insight Engine" to the forefront. "Intelligence Chips" and trend indicators highlight what the data *means*, not just what the data *is*.
*   **10-second understanding rule:** The typography and layout hierarchy are engineered so a user can parse their net profit, top category, and weekly trend in under 10 seconds.

---

## 2. Visual System

**Color Palette (Light & Dark Mode Support)**
Our palette is rooted in deep, authoritative Navy (`primary`), balanced by high-chroma functional accents. It supports both Light ("Architectural Lens") and Dark ("Predictive Engine") modes seamlessly.

*   **Primary (Navy / Indigo):** `#1a1f2e` (Light) / `#c1c1ff` (Dark). Used for dominant active states and gradients.
*   **Background / Surface:** `#f7f9fb` (Light) / `#111317` (Dark). The base canvas.
*   **Surface Containers:** Ranging from `lowest` (pure white/black) to `highest` for layering.
*   **Success (Secondary - Emerald/Teal):** `#006c49` (Light) / `#43ecdb` (Dark). Used for positive trends and growth.
*   **Danger (Tertiary - Coral/Warmth):** `#93000a` (Light) / `#ffb691` (Dark). Used for declines, warnings, or destructive actions.

**Typography (The Precision Scale)**
We use a dual-typeface system to balance authority with technical precision, supporting both LTR (English) and RTL (Arabic) natively.
*   **Headlines & Display:** `Inter` (or `Manrope` for Dark mode accents). Tight tracking (`-0.02em` to `-0.04em`) to convey a modern, technical aesthetic.
*   **Body & Labels:** `Inter`. Standard tracking (`0em`) for maximum legibility at high data densities.
*   **The "Data Contrast" Rule:** High contrast between data values (`display-md`, high emphasis) and their metadata labels (`label-md`, `on_surface_variant`).

**Spacing System**
*   **The "Tight-to-Loose" Rhythm:** Tight tracking and dense data groupings paired with expansive, breathable layouts. 
*   **Separation:** Use `24px` to `40px` of vertical white space to separate areas. 
*   **No-Line Rule:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries are defined solely through background color shifts (`surface` to `surface_container_low`).

---

## 3. Layout Structure

*   **Topbar:** Minimalist header containing the Language Switch (EN/AR), Theme Toggle (Light/Dark), and User Profile.
*   **Sidebar:** Recessed navigation (`surface_container_high`). Clean, icon-driven using Lucide-style icons with a `1.5px` stroke weight for a premium feel.
*   **Dashboard Grid:** Intentional asymmetry. Off-center groupings and varied column widths guide the eye toward the Insight Card and primary metrics first.

---

## 4. Core Screens (Pixel-Perfect Specification)

Every page adheres strictly to the spatial and tonal rules defined above.

1.  **Dashboard (Main View):**
    *   *Insight Card* at the absolute top (gradient background, glassmorphic blur).
    *   3-4 main stat cards (Income, Expense, Profit) using `surface_container_lowest` with no borders.
    *   Trend lines using the Success/Danger color tokens with a subtle glow.
2.  **Transactions:**
    *   A high-density data table or list view.
    *   Uses "Ghost Borders" (`outline_variant` at 15-20% opacity) for row separation if necessary, otherwise relying on whitespace.
3.  **Categories:**
    *   Grid of category cards.
    *   Visual indicators for spending limits or budget health.
4.  **Add Transaction Modal (Glassmorphism):**
    *   Floating overlay using `surface` at 80% opacity with `backdrop-blur` (24px).
    *   Ambient shadow (tinted navy shadow, 4-6% opacity, 32-64px blur) instead of harsh drop shadows.
    *   High-fidelity inputs with a 2px "glow strip" on focus.
5.  **Auth (صفحات الدخول):**
    *   Clean, split-screen layout. One half uses the signature linear gradient (`primary` to `primary_container`), the other half houses the clean, rounded (`md` / 12px) input forms.
6.  **Landing Page (Next.js):**
    *   Marketing-focused. Translates the SaaS UI into a broader, scrollable story. Features the Hero section with a floating Glassmorphic dashboard mockup.

---

## 5. UX Decisions

*   **Quick Add as Primary Action:** A persistent, gradient-filled Primary button ("The Kinetic Trigger") available globally to log transactions instantly.
*   **Smart Empty States:** Context-aware illustrations and CTAs when no data is present, utilizing `on_surface_variant` for a soft, un-intimidating look.
*   **Dynamic Dashboard (User Mode):** The layout and default widgets physically shift based on whether the user is a Freelancer, E-commerce, or Service Business. The system feels bespoke to their workflow.

---

## 6. Components

*   **Buttons:**
    *   *Primary:* Gradient fill (`primary` to `primary_container` or `secondary`), `on_primary` text, 8px-16px radius.
    *   *Secondary:* `surface_container_highest` background, no border.
    *   *Tertiary:* Transparent fill.
*   **Cards (Stat Cards):**
    *   No borders. Background: `surface_container_lowest`. 16px radius (`xl`). Generous internal padding (1.5rem+).
*   **Inputs (High-Fidelity):**
    *   `surface_container_lowest` fill. 12px radius. Ghost border on focus or a left-edge glow strip.
*   **Modals:**
    *   Glassmorphic. 1px top-edge-only "highlight" border to simulate light hitting the top of the glass.

---

## 7. Interaction & Animation

*   **Hover Effects:** Instead of darkening buttons, increase the `surface_bright` overlay by 10% to create a "glow" effect.
*   **Loading States:** Skeletons over spinners. Skeletons should pulse smoothly using the `surface_container` to `surface_container_highest` tones.
*   **Micro-interactions:** Use "Quintessential Out" (`cubic-bezier(0.23, 1, 0.32, 1)`) for all state transitions (modals opening, hovers) to create a snappy, high-performance, and premium 2026 feel.

---

## 8. UX Principles (Practical)

- User can add a transaction in < 5 seconds
- User can understand profit/loss instantly
- No screen requires more than 2 steps to complete an action
- Empty states guide the user clearly
