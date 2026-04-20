import { Router } from 'express';
import { authController } from './auth.controller';
import { LoginSchema, RegisterSchema } from './auth.schemas';
import { validate } from '../../middlewares/validate';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.post('/register', validate(RegisterSchema), authController.register);
router.post('/login', validate(LoginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
