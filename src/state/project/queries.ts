import { useAuthStore } from '../auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { projectApi } from './api';
import { Project } from './types';

export const projectKeys = {
  all: ['projects'] as const,
  project: (id: string) => [...projectKeys.all, { id }],
};

export const useProjectsQuery = () => {
  const { currentUserId } = useAuthStore();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: projectKeys.all,
    queryFn: () => projectApi.getProjects(),
  });

  return {
    data,
    error,
    isLoading,
    refetch,
    ownedProjects: data?.filter(project => project.ownerId === currentUserId) ?? [],
    otherProjects: data?.filter(project => project.ownerId !== currentUserId) ?? [],
  };
};

export const useProjectQuery = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: projectKeys.project(id),
    queryFn: () => projectApi.getProject(id),
    enabled: !!id,
    initialData: () => {
      const projects = queryClient.getQueryData(projectKeys.all) as Project[];
      return projects?.find((p: { id: string }) => p.id === id);
    },
  });
};
