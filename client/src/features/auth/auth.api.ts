import { api } from '@/lib/api';
import type { User, UserMode } from '@/types/domain';

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  userMode: UserMode;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<User> {
    const { data } = await api.post<{ user: User }>('/auth/login', payload);
    return data.user;
  },
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<{ user: User }>('/auth/register', payload);
    return data.user;
  },
  async me(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data.user;
  },
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
  async updatePreferences(payload: Partial<Pick<User, 'theme' | 'language' | 'userMode' | 'name'>>): Promise<User> {
    const { data } = await api.patch<{ user: User }>('/users/preferences', payload);
    return data.user;
  },
};
