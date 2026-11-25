import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './api';
import { userKeys } from './queries';
import type { User } from './types';
import { useToastState } from '@/components/design-system/toast';

export function useUpdateUserMutation({
  onSettled,
  onSuccess,
}: { onSettled?: () => void; onSuccess?: () => void } = {}) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (user: Pick<User, 'id' | 'name'>) => userApi.updateUser(user),
    onMutate: async user => {
      await client.cancelQueries({ queryKey: userKeys.all });
      const previous = client.getQueryData<User>(userKeys.user(user.id));
      client.setQueryData<User>(userKeys.user(user.id), old => (old ? { ...old, ...user } : old));
      return { previous };
    },
    onError: (_error, user, context) => {
      if (context?.previous) client.setQueryData(userKeys.user(user.id), context.previous);
    },
    onSuccess: user => {
      client.setQueryData(userKeys.user(user.id), user);
      useToastState.getState().addToast('Profile saved.');
      onSuccess?.();
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: userKeys.all });
      onSettled?.();
    },
  });
}
