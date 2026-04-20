import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUiStore } from '@/store/ui-store';
import { authApi, type LoginPayload, type RegisterPayload } from './auth.api';
import type { User } from '@/types/domain';

const ME_KEY = ['auth', 'me'] as const;

export const useCurrentUser = () =>
  useQuery({
    queryKey: ME_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });

export const useLogin = () => {
  const qc = useQueryClient();
  const { setTheme, setLanguage } = useUiStore.getState();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (user: User) => {
      qc.setQueryData(ME_KEY, user);
      setTheme(user.theme);
      setLanguage(user.language);
    },
  });
};

export const useRegister = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (user: User) => qc.setQueryData(ME_KEY, user),
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      qc.setQueryData(ME_KEY, null);
      qc.clear();
    },
  });
};
