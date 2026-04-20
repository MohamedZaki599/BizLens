import { z } from 'zod';

export const UserModeEnum = z.enum(['FREELANCER', 'ECOMMERCE', 'SERVICE_BUSINESS']);

export const RegisterSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).max(80).optional(),
  userMode: UserModeEnum.default('FREELANCER'),
});

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
