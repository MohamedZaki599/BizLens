import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUiStore } from '@/store/ui-store';
import { QK } from '@/lib/query-keys';
import { authApi, type LoginPayload, type RegisterPayload } from './auth.api';
import type { User } from '@/types/domain';

/** @deprecated import `QK.auth.me` from `@/lib/query-keys` instead. */
export const ME_KEY = QK.auth.me;

export const useCurrentUser = () =>
  useQuery({
    queryKey: QK.auth.me,
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });

const syncUiFromUser = (user: User) => {
  const { setTheme, setLanguage, setCurrency } = useUiStore.getState();
  setTheme(user.theme);
  setLanguage(user.language);
  if (user.currency) setCurrency(user.currency);
};

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (user: User) => {
      qc.setQueryData(QK.auth.me, user);
      syncUiFromUser(user);
    },
  });
};

export const useRegister = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (user: User) => {
      qc.setQueryData(QK.auth.me, user);
      // Match login behavior so the new account immediately picks up
      // the user's theme / language defaults from the API.
      syncUiFromUser(user);
    },
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      qc.setQueryData(QK.auth.me, null);
      qc.clear();
    },
  });
};

export const useUpdatePreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: Partial<Pick<User, 'theme' | 'language' | 'userMode' | 'name' | 'currency'>>,
    ) => authApi.updatePreferences(payload),
    onSuccess: (user: User) => {
      qc.setQueryData(QK.auth.me, user);
      syncUiFromUser(user);
    },
  });
};
