import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from './api';
import { notificationsKeys } from './queries';
import { NotificationStatus, type Notification } from './types';
import { useAuthStore } from '../auth/store';

export function useMarkAsReadMutation() {
  const client = useQueryClient();
  const userId = useAuthStore.use.currentUserId() ?? '';
  const key = notificationsKeys.byUser(userId);
  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onMutate: async id => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Notification[]>(key);
      client.setQueryData<Notification[]>(key, old =>
        old?.map(item => (item.id === id ? { ...item, status: NotificationStatus.READ } : item)),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) client.setQueryData(key, context.previous);
    },
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
}
