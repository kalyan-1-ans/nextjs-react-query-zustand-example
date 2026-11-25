import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from './api';
import type { LoginRequest } from './types';
import { useAuthStore } from './store';
import { usePreferenceStore } from '../preference';
import { useToastState } from '@/components/design-system/toast';

export function useLoginMutation() {
  const router = useRouter();
  const client = useQueryClient();
  const { loginSuccess, clearAuth } = useAuthStore.use.actions();
  const projectId = usePreferenceStore.use.lastVisitedProjectId();
  return useMutation({
    mutationFn: (input: LoginRequest) => authApi.login(input),
    onSuccess: data => {
      client.clear();
      loginSuccess(data);
      router.replace(projectId ? `/project/${projectId}` : '/dashboard');
    },
    onError: () => clearAuth(),
  });
}
export function useLogoutMutation() {
  const router = useRouter();
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await client.cancelQueries();
      client.clear();
      useAuthStore.getState().actions.clearAuth();
      useToastState.getState().clearToasts();
      router.replace('/login');
    },
  });
}
