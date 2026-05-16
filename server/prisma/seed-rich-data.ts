/**
 * Rich demo data generator.
 *
 * Produces 6 months of realistic financial data for three demo users (one per
 * UserMode). The result is dense enough that:
 *   - the dashboard never feels empty
 *   - every alert rule will fire for at least one demo user
 *   - the insight engine surfaces meaningful WHYs (not just "no data")
 *
 * Run with:
 *   npm run -w server db:seed:rich
 *
 * Demo accounts created:
 *   demo+freelancer@bizlens.app    / Demo123!
 *   demo+ecommerce@bizlens.app     / Demo123!
 *   demo+business@bizlens.app      / Demo123!
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { addDays, startOfDay, subDays, subMonths } from 'date-fns';
import { Prisma, type UserMode, prisma } from '@bizlens/database';


// ─── Deterministic randomness ─────────────────────────────────────────────

const seedRandom = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};

const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];

const jitter = (rng: () => number, base: number, pct: number): number => {
  // base ± pct%
  const factor = 1 + (rng() * 2 - 1) * pct;
  return Math.max(1, Math.round(base * factor * 100) / 100);
};

// ─── Persona definitions ──────────────────────────────────────────────────

interface CategorySpec {
  name: string;
  color: string;
}

interface RecurringSpec {
  category: string;
  amount: number;
  dayOfMonth: number;
  description: string;
}

interface SpikeSpec {
  /** Months ago (0 = current). */
  monthsAgo: number;
  category: string;
  /** Multiplier applied to that month's base for this category. */
  multiplier: number;
}

interface Persona {
  email: string;
  name: string;
  mode: UserMode;
  /** Daily expense rate in $ across all expense categories. */
  dailyExpenseBase: number;
  /** Monthly income range. */
  monthlyIncome: [number, number];
  /** Trend direction over the last 6 months (1.0 = flat, 1.05 = +5%/mo). */
  trend: number;
  expenseCategories: CategorySpec[];
  incomeCategories: CategorySpec[];
  /** Per-category daily-spend weight (must sum to ~1). */
  expenseWeights: Record<string, number>;
  /** Recurring/subscription expenses. */
  recurring: RecurringSpec[];
  /** Anomalies/spikes inserted into the timeline for demo richness. */
  spikes: SpikeSpec[];
}

const PERSONAS: Persona[] = [
  {
    email: 'demo+freelancer@bizlens.app',
    name: 'Sara · Freelancer',
    mode: 'FREELANCER',
    dailyExpenseBase: 35,
    monthlyIncome: [3500, 6500],
    trend: 1.04,
    incomeCategories: [
      { name: 'Client Projects', color: '#22c55e' },
      { name: 'Retainers', color: '#10b981' },
      { name: 'Consulting', color: '#06b6d4' },
    ],
    expenseCategories: [
      { name: 'Software & Tools', color: '#7c5cff' },
      { name: 'Coworking', color: '#f59e0b' },
      { name: 'Marketing', color: '#ef4444' },
      { name: 'Equipment', color: '#3b82f6' },
      { name: 'Meals & Coffee', color: '#84cc16' },
      { name: 'Taxes & Fees', color: '#a855f7' },
    ],
    expenseWeights: {
      'Software & Tools': 0.25,
      Coworking: 0.2,
      Marketing: 0.15,
      Equipment: 0.1,
      'Meals & Coffee': 0.2,
      'Taxes & Fees': 0.1,
    },
    recurring: [
      { category: 'Software & Tools', amount: 49, dayOfMonth: 3, description: 'Adobe CC' },
      { category: 'Software & Tools', amount: 12, dayOfMonth: 5, description: 'Notion Pro' },
      { category: 'Software & Tools', amount: 20, dayOfMonth: 12, description: 'GitHub Pro' },
      { category: 'Coworking', amount: 220, dayOfMonth: 1, description: 'WeWork hot desk' },
    ],
    spikes: [
      { monthsAgo: 0, category: 'Marketing', multiplier: 2.4 }, // current-month spike → triggers spike rule
      { monthsAgo: 2, category: 'Equipment', multiplier: 3.0 }, // bought a laptop
    ],
  },
  {
    email: 'demo+ecommerce@bizlens.app',
    name: 'Karim · E-commerce',
    mode: 'ECOMMERCE',
    dailyExpenseBase: 280,
    monthlyIncome: [12000, 22000],
    trend: 1.08,
    incomeCategories: [
      { name: 'Shopify Sales', color: '#22c55e' },
      { name: 'Wholesale', color: '#16a34a' },
      { name: 'Affiliate', color: '#06b6d4' },
    ],
    expenseCategories: [
      { name: 'Ads', color: '#ef4444' },
      { name: 'Shipping', color: '#f97316' },
      { name: 'Inventory', color: '#7c5cff' },
      { name: 'Packaging', color: '#f59e0b' },
      { name: 'SaaS Tools', color: '#3b82f6' },
      { name: 'Returns & Refunds', color: '#a855f7' },
    ],
    expenseWeights: {
      Ads: 0.32,
      Shipping: 0.18,
      Inventory: 0.25,
      Packaging: 0.08,
      'SaaS Tools': 0.1,
      'Returns & Refunds': 0.07,
    },
    recurring: [
      { category: 'SaaS Tools', amount: 79, dayOfMonth: 1, description: 'Shopify Plan' },
      { category: 'SaaS Tools', amount: 49, dayOfMonth: 4, description: 'Klaviyo' },
      { category: 'SaaS Tools', amount: 29, dayOfMonth: 9, description: 'Loox Reviews' },
    ],
    spikes: [
      { monthsAgo: 0, category: 'Ads', multiplier: 1.7 },
      { monthsAgo: 1, category: 'Returns & Refunds', multiplier: 2.2 },
      { monthsAgo: 3, category: 'Inventory', multiplier: 1.9 },
    ],
  },
  {
    email: 'demo+business@bizlens.app',
    name: 'Lina · Service Business',
    mode: 'SERVICE_BUSINESS',
    dailyExpenseBase: 520,
    monthlyIncome: [25000, 42000],
    trend: 1.06,
    incomeCategories: [
      { name: 'Service Revenue', color: '#22c55e' },
      { name: 'Setup Fees', color: '#10b981' },
      { name: 'Maintenance Contracts', color: '#06b6d4' },
    ],
    expenseCategories: [
      { name: 'Payroll', color: '#7c5cff' },
      { name: 'Rent & Utilities', color: '#f59e0b' },
      { name: 'Software & Tools', color: '#3b82f6' },
      { name: 'Marketing', color: '#ef4444' },
      { name: 'Travel', color: '#84cc16' },
      { name: 'Professional Services', color: '#a855f7' },
    ],
    expenseWeights: {
      Payroll: 0.45,
      'Rent & Utilities': 0.18,
      'Software & Tools': 0.1,
      Marketing: 0.12,
      Travel: 0.08,
      'Professional Services': 0.07,
    },
    recurring: [
      { category: 'Rent & Utilities', amount: 3200, dayOfMonth: 1, description: 'Office rent' },
      { category: 'Software & Tools', amount: 199, dayOfMonth: 2, description: 'Slack + Linear' },
      { category: 'Professional Services', amount: 450, dayOfMonth: 8, description: 'Accountant' },
    ],
    spikes: [
      { monthsAgo: 0, category: 'Marketing', multiplier: 2.1 },
      { monthsAgo: 1, category: 'Travel', multiplier: 2.6 },
    ],
  },
];

// ─── Generation ───────────────────────────────────────────────────────────

interface CategoryRefs {
  expense: Map<string, string>;
  income: Map<string, string>;
}

const upsertUser = async (persona: Persona) => {
  const passwordHash = await bcrypt.hash('Demo123!', 10);
  const user = await prisma.user.upsert({
    where: { email: persona.email },
    update: { name: persona.name, userMode: persona.mode },
    create: {
      email: persona.email,
      passwordHash,
      name: persona.name,
      userMode: persona.mode,
    },
  });

  // Wipe prior demo data so re-runs are deterministic.
  await prisma.alert.deleteMany({ where: { userId: user.id } });
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.category.deleteMany({ where: { userId: user.id } });

  const refs: CategoryRefs = { expense: new Map(), income: new Map() };

  for (const c of persona.expenseCategories) {
    const cat = await prisma.category.create({
      data: { userId: user.id, name: c.name, color: c.color, type: 'EXPENSE', isDefault: false },
    });
    refs.expense.set(c.name, cat.id);
  }
  for (const c of persona.incomeCategories) {
    const cat = await prisma.category.create({
      data: { userId: user.id, name: c.name, color: c.color, type: 'INCOME', isDefault: false },
    });
    refs.income.set(c.name, cat.id);
  }

  return { user, refs };
};

const generateForPersona = async (persona: Persona) => {
  const { user, refs } = await upsertUser(persona);
  const rng = seedRandom(persona.email.length * 7919);
  const today = startOfDay(new Date());
  const totalDays = 30 * 6;

  const txns: Prisma.TransactionCreateManyInput[] = [];

  // ── Daily expense distribution across categories ────────────────────────
  for (let d = totalDays; d >= 0; d--) {
    const date = subDays(today, d);
    // Trend: older months scaled down → growth over time.
    const monthsAgo = Math.floor(d / 30);
    const trendFactor = Math.pow(persona.trend, -monthsAgo);
    // Weekend dip + weekly seasonality.
    const dow = date.getDay();
    const weekendDip = dow === 0 || dow === 6 ? 0.4 : 1.0;
    const dailyTotal = persona.dailyExpenseBase * trendFactor * weekendDip * jitter(rng, 1, 0.3);

    for (const cat of persona.expenseCategories) {
      const weight = persona.expenseWeights[cat.name] ?? 0;
      // Spike check.
      const spike = persona.spikes.find(
        (s) => s.monthsAgo === monthsAgo && s.category === cat.name,
      );
      const multiplier = spike ? spike.multiplier : 1;
      // Sparsity: small categories don't appear every day.
      if (rng() > Math.min(1, weight * 5)) continue;
      const amount = jitter(rng, dailyTotal * weight * multiplier, 0.35);
      if (amount < 1) continue;

      txns.push({
        userId: user.id,
        categoryId: refs.expense.get(cat.name)!,
        amount: new Prisma.Decimal(amount.toFixed(2)),
        type: 'EXPENSE',
        date,
        description: spike ? `${cat.name} (campaign)` : null,
      });
    }
  }

  // ── Recurring (subscriptions / fixed costs) ─────────────────────────────
  for (let monthsAgo = 0; monthsAgo <= 6; monthsAgo++) {
    const refMonth = subMonths(today, monthsAgo);
    for (const r of persona.recurring) {
      const date = new Date(refMonth.getFullYear(), refMonth.getMonth(), r.dayOfMonth);
      if (date > today) continue;
      const catId = refs.expense.get(r.category);
      if (!catId) continue;
      txns.push({
        userId: user.id,
        categoryId: catId,
        amount: new Prisma.Decimal(jitter(rng, r.amount, 0.02).toFixed(2)),
        type: 'EXPENSE',
        date,
        description: r.description,
      });
    }
  }

  // ── Income (1-3 invoices per month per category) ────────────────────────
  for (let monthsAgo = 6; monthsAgo >= 0; monthsAgo--) {
    const refMonth = subMonths(today, monthsAgo);
    const trendFactor = Math.pow(persona.trend, -monthsAgo);
    const monthlyTotalTarget =
      jitter(rng, (persona.monthlyIncome[0] + persona.monthlyIncome[1]) / 2, 0.2) * trendFactor;
    let remaining = monthlyTotalTarget;
    const invoices = 3 + Math.floor(rng() * 4);
    for (let i = 0; i < invoices; i++) {
      const day = 1 + Math.floor(rng() * 27);
      const date = new Date(refMonth.getFullYear(), refMonth.getMonth(), day);
      if (date > today) continue;
      const cat = pick(rng, persona.incomeCategories);
      const portion = i === invoices - 1 ? remaining : (remaining / (invoices - i)) * (0.6 + rng() * 0.8);
      const amount = Math.max(50, Math.round(portion * 100) / 100);
      remaining -= amount;
      txns.push({
        userId: user.id,
        categoryId: refs.income.get(cat.name)!,
        amount: new Prisma.Decimal(amount.toFixed(2)),
        type: 'INCOME',
        date,
        description: `${cat.name} invoice`,
      });
    }
  }

  await prisma.transaction.createMany({ data: txns });

  // Update activity timestamp so the stale-data rule doesn't fire.
  await prisma.user.update({
    where: { id: user.id },
    data: { lastActivityAt: addDays(today, 0) },
  });

  return { user, count: txns.length };
};

const main = async () => {
  // eslint-disable-next-line no-console
  console.log('🌱  Generating rich demo data…\n');
  for (const persona of PERSONAS) {
    const { user, count } = await generateForPersona(persona);
    // eslint-disable-next-line no-console
    console.log(`  ✔ ${persona.email.padEnd(36)}  ${count} transactions  (mode: ${user.userMode})`);
  }
  // eslint-disable-next-line no-console
  console.log(`\n🔐  All demo accounts use password:  Demo123!`);
};

// ─── Expected Signal States (validated by src/__tests__/seed-integrity.test.ts) ──
// Freelancer: SPEND_SPIKE(Marketing, ~140%), PROFIT_TREND, EXPENSE_GROWTH
// E-commerce: SPEND_SPIKE(Ads, ~70%), PROFIT_TREND, EXPENSE_GROWTH
// Service Business: SPEND_SPIKE(Marketing, ~110%), PROFIT_TREND, EXPENSE_GROWTH

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
