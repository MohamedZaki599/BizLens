import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
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
      },
    });
    res.json({ user: updated });
  }),
);

export default router;
