import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/async-handler';
import { HttpError } from '../../utils/http-error';
import { transactionService } from './transaction.service';
import { eventBus } from '../../intelligence';
import {
  CreateTransactionSchema,
  ListTransactionsQuerySchema,
  TransactionParamsSchema,
  UpdateTransactionSchema,
} from './transaction.schemas';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  validate(ListTransactionsQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const result = await transactionService.list(req.user.id, req.query as never);
    res.json(result);
  }),
);

router.post(
  '/',
  validate(CreateTransactionSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const transaction = await transactionService.create(req.user.id, req.body);
    eventBus.emit({ type: 'FINANCIAL_DATA_UPDATED', userId: req.user.id, trigger: 'transaction_create', timestamp: new Date() });
    res.status(201).json({ transaction });
  }),
);

router.patch(
  '/:id',
  validate(TransactionParamsSchema, 'params'),
  validate(UpdateTransactionSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const transaction = await transactionService.update(req.user.id, req.params.id, req.body);
    eventBus.emit({ type: 'FINANCIAL_DATA_UPDATED', userId: req.user.id, trigger: 'transaction_update', timestamp: new Date() });
    res.json({ transaction });
  }),
);

router.delete(
  '/:id',
  validate(TransactionParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const result = await transactionService.remove(req.user.id, req.params.id);
    eventBus.emit({ type: 'FINANCIAL_DATA_UPDATED', userId: req.user.id, trigger: 'transaction_delete', timestamp: new Date() });
    res.json(result);
  }),
);

export default router;
