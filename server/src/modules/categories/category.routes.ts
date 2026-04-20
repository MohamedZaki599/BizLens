import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/async-handler';
import { HttpError } from '../../utils/http-error';
import { categoryService } from './category.service';
import {
  CategoryParamsSchema,
  CreateCategorySchema,
  ListCategoriesQuerySchema,
  UpdateCategorySchema,
} from './category.schemas';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  validate(ListCategoriesQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { type } = req.query as { type?: 'INCOME' | 'EXPENSE' };
    const categories = await categoryService.list(req.user.id, type);
    res.json({ categories });
  }),
);

router.post(
  '/',
  validate(CreateCategorySchema),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const category = await categoryService.create(req.user.id, req.body);
    res.status(201).json({ category });
  }),
);

router.patch(
  '/:id',
  validate(CategoryParamsSchema, 'params'),
  validate(UpdateCategorySchema),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const category = await categoryService.update(req.user.id, req.params.id, req.body);
    res.json({ category });
  }),
);

router.delete(
  '/:id',
  validate(CategoryParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const result = await categoryService.remove(req.user.id, req.params.id);
    res.json(result);
  }),
);

export default router;
