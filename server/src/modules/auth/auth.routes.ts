import { Router, type Request } from 'express';
import { authController } from './auth.controller';
import { LoginSchema, RegisterSchema } from './auth.schemas';
import { validate } from '../../middlewares/validate';
import { requireAuth } from '../../middlewares/auth';
import { createRateLimiter } from '../../middlewares/rate-limit';

const router = Router();

const emailOrIpKey = (req: Request): string => {
  const email = (req.body as { email?: unknown } | undefined)?.email;
  if (typeof email === 'string' && email.length > 0) return email.toLowerCase();
  return req.ip ?? 'anonymous';
};

// 10 attempts / 15 min per email — generous enough to avoid frustrating users
// while making credential-stuffing painful.
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60_000,
  max: 10,
  keyOf: emailOrIpKey,
  message: 'Too many sign-in attempts. Please try again in a few minutes.',
});

// 5 registrations / hour per IP — registration is rarer and easily abusable.
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60_000,
  max: 5,
  message: 'Too many registration attempts. Please try again later.',
});

router.post('/register', registerLimiter, validate(RegisterSchema), authController.register);
router.post('/login', loginLimiter, validate(LoginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
