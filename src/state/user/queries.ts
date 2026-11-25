import { useAuthStore } from '../auth';
import { useQuery } from '@tanstack/react-query';
import { userApi } from './api';

export const userKeys = {
  all: ['users'] as const,
  user: (id: string) => [...userKeys.all, { id }],
};

export const useUsersQuery = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => userApi.getUsers(),
  });
};

export const useCurrentUserQuery = () => {
  const currentUserId = useAuthStore.use.currentUserId() ?? '';
  return useQuery({
    queryKey: userKeys.user(currentUserId),
    queryFn: () => userApi.getUser(currentUserId),
    enabled: !!currentUserId,
    select: user => ({ ...user, firstName: user.name.split(' ')[0] }),
  });
};
