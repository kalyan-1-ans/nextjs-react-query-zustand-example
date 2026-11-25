import { MutationCache, QueryClient } from '@tanstack/react-query';
import { useToastState } from '@/components/design-system/toast';
import { isAxiosError } from 'axios';

export function getErrorMessage(error: unknown) {
  if (isAxiosError<{ errorMessage?: string }>(error)) {
    return error.response?.data?.errorMessage ?? error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function createQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: error => useToastState.getState().addToast(getErrorMessage(error)),
    }),
    defaultOptions: {
      queries: { staleTime: 60_000, retry: 1 },
      mutations: { retry: false },
    },
  });
}
