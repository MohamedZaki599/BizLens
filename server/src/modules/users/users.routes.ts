import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@bizlens/database';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/async-handler';
import { HttpError } from '../../utils/http-error';
import { UserModeEnum } from '../auth/auth.schemas';

const router = Router();

const PreferencesSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  language: z.enum(['en', 'ar']).optional(),
  userMode: UserModeEnum.optional(),
  name: z.string().min(1).max(80).optional(),
  // ISO 4217 currency codes are 3 uppercase letters. We don't lock the
  // value to a closed set so we don't have to ship a code change every
  // time we add a region.
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/, 'Use a 3-letter ISO currency code')
    .optional(),
});

router.patch(
  '/preferences',
  requireAuth,
  validate(PreferencesSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
      select: {
        id: true,
        email: true,
        name: true,
        userMode: true,
        language: true,
        theme: true,
        currency: true,
      },
    });
    res.json({ user: updated });
  }),
);

export default router;
