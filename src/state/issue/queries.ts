import { useQuery } from '@tanstack/react-query';
import { issuesApi } from './api';

export const issuesKeys = {
  all: ['issues'] as const,
  byProjectId: (projectId: string) => [...issuesKeys.all, { projectId }],
  count: (projectId: string) => [...issuesKeys.all, 'count', { projectId }],
};

export const useBacklogIssuesQuery = (projectId: string) => {
  return useQuery({
    queryKey: issuesKeys.byProjectId(projectId),
    queryFn: () => issuesApi.getIssues(projectId),
    enabled: !!projectId,
    select: issues => [...issues].sort((a, b) => a.orderIndex - b.orderIndex),
  });
};

export const useIssuesCountByProjectId = (projectId: string) => {
  return useQuery({
    queryKey: issuesKeys.count(projectId),
    queryFn: () => issuesApi.getIssuesCount(projectId),
    enabled: !!projectId,
  });
};
