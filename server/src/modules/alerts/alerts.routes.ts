import { Router } from 'express';
import { z } from 'zod';
import type { Alert } from '@prisma/client';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/async-handler';
import { HttpError } from '../../utils/http-error';
import { alertEngine } from '../../services/alert-engine/alert-engine';

const router = Router();
router.use(requireAuth);

interface SerializedAlert {
  id: string;
  type: Alert['type'];
  severity: Alert['severity'];
  title: string;
  message: string;
  action: { label: string; type: 'navigate' | 'filter'; payload: Record<string, string> } | null;
  isRead: boolean;
  createdAt: Date;
  expiresAt: Date | null;
}

/** Convert the persisted row's `actionJson` blob into a typed object. */
const serialize = (a: Alert): SerializedAlert => {
  let action: SerializedAlert['action'] = null;
  if (a.actionJson) {
    try {
      action = JSON.parse(a.actionJson);
    } catch {
      action = null;
    }
  }
  return {
    id: a.id,
    type: a.type,
    severity: a.severity,
    title: a.title,
    message: a.message,
    action,
    isRead: a.isRead,
    createdAt: a.createdAt,
    expiresAt: a.expiresAt,
  };
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    // Re-evaluate first so the list always reflects current data state.
    await alertEngine.evaluate(req.user.id);
    const alerts = await alertEngine.list(req.user.id);
    const unread = await alertEngine.unreadCount(req.user.id);
    res.json({ alerts: alerts.map(serialize), unread });
  }),
);

router.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const unread = await alertEngine.unreadCount(req.user.id);
    res.json({ unread });
  }),
);

const IdParam = z.object({ id: z.string().uuid() });

router.post(
  '/:id/read',
  validate(IdParam, 'params'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    await alertEngine.markRead(req.user.id, req.params.id);
    res.status(204).send();
  }),
);

router.post(
  '/read-all',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    await alertEngine.markAllRead(req.user.id);
    res.status(204).send();
  }),
);

router.delete(
  '/:id',
  validate(IdParam, 'params'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    await alertEngine.dismiss(req.user.id, req.params.id);
    res.status(204).send();
  }),
);

export default router;
