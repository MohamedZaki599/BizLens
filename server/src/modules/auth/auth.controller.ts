import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { authService } from './auth.service';
import { AUTH_COOKIE_NAME, cookieOptions, signAccessToken } from './auth.tokens';
import type { LoginInput, RegisterInput } from './auth.schemas';
import { HttpError } from '../../utils/http-error';

export const authController = {
  register: asyncHandler(async (req: Request<unknown, unknown, RegisterInput>, res: Response) => {
    const user = await authService.register(req.body);
    const token = signAccessToken({ sub: user.id, email: user.email });
    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions());
    // Token deliberately omitted from the response body: the httpOnly cookie
    // is the source of truth and exposing the JWT to JS would defeat that.
    res.status(201).json({ user });
  }),

  login: asyncHandler(async (req: Request<unknown, unknown, LoginInput>, res: Response) => {
    const user = await authService.login(req.body);
    const token = signAccessToken({ sub: user.id, email: user.email });
    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions());
    res.json({ user });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw HttpError.unauthorized();
    const user = await authService.getMe(req.user.id);
    res.json({ user });
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie(AUTH_COOKIE_NAME, { ...cookieOptions(), maxAge: 0 });
    res.json({ ok: true });
  }),
};
