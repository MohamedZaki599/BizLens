import bcrypt from 'bcryptjs';
import { prisma } from '@bizlens/database';
import { HttpError } from '../../utils/http-error';
import { DEFAULT_CATEGORIES } from '../categories/category.defaults';
import type { LoginInput, RegisterInput } from './auth.schemas';

const SAFE_USER_FIELDS = {
  id: true,
  email: true,
  name: true,
  userMode: true,
  language: true,
  theme: true,
  currency: true,
  createdAt: true,
} as const;

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw HttpError.conflict('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const seedCategories = DEFAULT_CATEGORIES[input.userMode].map((c) => ({
      name: c.name,
      type: c.type,
      color: c.color,
      isDefault: true,
    }));

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        userMode: input.userMode,
        categories: { create: seedCategories },
      },
      select: SAFE_USER_FIELDS,
    });

    return user;
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw HttpError.unauthorized('Invalid email or password.');

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw HttpError.unauthorized('Invalid email or password.');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      userMode: user.userMode,
      language: user.language,
      theme: user.theme,
      currency: user.currency,
      createdAt: user.createdAt,
    };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: SAFE_USER_FIELDS,
    });
    if (!user) throw HttpError.unauthorized('Session no longer valid.');
    return user;
  },
};
