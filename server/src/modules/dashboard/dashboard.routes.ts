import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/async-handler';
import { HttpError } from '../../utils/http-error';
import { insightEngine } from '../../services/insight-engine/insight-engine';
import { RangeSchema, resolveRange } from './dashboard.range';
import {
  buildExpenseComposition,
  buildExpenseTrend,
  buildForecast,
  buildMetrics,
  buildMoneyLeak,
  buildWeeklySummary,
} from './dashboard.service';
import { detectSubscriptions } from './subscriptions.service';
import {
  BudgetCreateSchema,
  deleteBudget,
  listBudgets,
  suggestBudgets,
  upsertBudget,
} from './budgets.service';
import { ImportSchema, importTransactions } from './import.service';
import { buildAssistantDigest } from './assistant.service';

const router = Router();
router.use(requireAuth);

router.get(
  '/metrics',
  validate(RangeSchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { range } = req.query as { range: string };
    const r = resolveRange(range);
    const metrics = await buildMetrics(req.user.id, range, r);
    res.json(metrics);
  }),
);

router.get(
  '/insights',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    // Insights use fixed comparison windows internally, so the dashboard
    // range is intentionally not forwarded here.
    const insights = await insightEngine.generate(req.user.id);
    res.json({ insights });
  }),
);

const SuggestSchema = z.object({ type: z.enum(['INCOME', 'EXPENSE']) });
router.get(
  '/suggested-category',
  validate(SuggestSchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { type } = req.query as { type: 'INCOME' | 'EXPENSE' };
    const last = await prisma.transaction.findFirst({
      where: { userId: req.user.id, type },
      orderBy: { date: 'desc' },
      select: { category: { select: { id: true, name: true, color: true } } },
    });
    res.json({ category: last?.category ?? null });
  }),
);

router.get(
  '/forecast',
  validate(RangeSchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { range } = req.query as { range: string };
    res.json(await buildForecast(req.user.id, resolveRange(range)));
  }),
);

router.get(
  '/money-leak',
  validate(RangeSchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { range } = req.query as { range: string };
    const leak = await buildMoneyLeak(req.user.id, resolveRange(range));
    res.json({ leak });
  }),
);

router.get(
  '/weekly-summary',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    res.json(await buildWeeklySummary(req.user.id));
  }),
);

router.get(
  '/activity',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const last = await prisma.transaction.findFirst({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      select: { date: true },
    });
    const total = await prisma.transaction.count({ where: { userId: req.user.id } });
    const daysSince = last
      ? Math.max(0, Math.floor((Date.now() - last.date.getTime()) / 86_400_000))
      : null;
    res.json({
      lastTransactionAt: last?.date ?? null,
      daysSinceLastTransaction: daysSince,
      transactionsTotal: total,
      isStale: daysSince !== null && daysSince >= 3 && total >= 5,
    });
  }),
);

router.get(
  '/expense-trend',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    res.json(await buildExpenseTrend(req.user.id));
  }),
);

router.get(
  '/expense-composition',
  validate(RangeSchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { range } = req.query as { range: string };
    res.json(await buildExpenseComposition(req.user.id, resolveRange(range)));
  }),
);

router.get(
  '/subscriptions',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    res.json(await detectSubscriptions(req.user.id));
  }),
);

router.post(
  '/import',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const parsed = ImportSchema.parse(req.body);
    res.json(await importTransactions(req.user.id, parsed));
  }),
);

router.get(
  '/budgets',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    res.json({ budgets: await listBudgets(req.user.id) });
  }),
);

router.get(
  '/budgets/suggestions',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    res.json({ suggestions: await suggestBudgets(req.user.id) });
  }),
);

router.get(
  '/assistant',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    res.json(await buildAssistantDigest(req.user.id));
  }),
);

router.post(
  '/budgets',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const body = BudgetCreateSchema.parse(req.body);
    res.json({ budget: await upsertBudget(req.user.id, body) });
  }),
);

router.delete(
  '/budgets/:id',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    await deleteBudget(req.user.id, req.params.id);
    res.status(204).send();
  }),
);

export default router;
