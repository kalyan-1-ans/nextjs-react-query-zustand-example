import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { arrayMove } from '@dnd-kit/sortable';
import { useProjectIdParam } from '@/hooks/useProjectIdParam';
import { issuesApi } from './api';
import { issuesKeys } from './queries';
import { sprintKeys } from '../sprint/queries';
import type { Sprint } from '../sprint/type';
import type { CreateIssueRequest, Issue, UpdateIssueRequest } from './types';
import { useToastState } from '@/components/design-system/toast';

export async function invalidateProjectWork(client: QueryClient, projectId: string) {
  await Promise.all([
    client.invalidateQueries({ queryKey: issuesKeys.byProjectId(projectId) }),
    client.invalidateQueries({ queryKey: issuesKeys.count(projectId) }),
    client.invalidateQueries({ queryKey: sprintKeys.byProjectId(projectId) }),
  ]);
}
export function useCreateIssueMutation() {
  const client = useQueryClient();
  const projectId = useProjectIdParam();
  return useMutation({
    mutationFn: (input: CreateIssueRequest) => issuesApi.createIssue(projectId, input),
    onSuccess: async issue => {
      useToastState.getState().addToast(`${issue.issueNumber} has been added.`);
      await invalidateProjectWork(client, projectId);
      await client.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
export function useUpdateIssueMutation({
  showNotification = true,
}: { showNotification?: boolean } = {}) {
  const client = useQueryClient();
  const projectId = useProjectIdParam();
  return useMutation({
    mutationFn: (input: UpdateIssueRequest) => issuesApi.updateIssue(projectId, input),
    onMutate: async input => {
      await Promise.all([
        client.cancelQueries({ queryKey: issuesKeys.byProjectId(projectId) }),
        client.cancelQueries({ queryKey: sprintKeys.byProjectId(projectId) }),
      ]);
      const backlog = client.getQueryData<Issue[]>(issuesKeys.byProjectId(projectId));
      const sprints = client.getQueryData<Sprint[]>(sprintKeys.byProjectId(projectId));
      client.setQueryData<Issue[]>(issuesKeys.byProjectId(projectId), old =>
        old?.map(issue => (issue.id === input.id ? { ...issue, ...input } : issue)),
      );
      client.setQueryData<Sprint[]>(sprintKeys.byProjectId(projectId), old =>
        old?.map(sprint => ({
          ...sprint,
          issues: sprint.issues.map(issue =>
            issue.id === input.id ? { ...issue, ...input } : issue,
          ),
        })),
      );
      return { backlog, sprints };
    },
    onError: (_error, _input, context) => {
      if (context?.backlog) client.setQueryData(issuesKeys.byProjectId(projectId), context.backlog);
      if (context?.sprints) client.setQueryData(sprintKeys.byProjectId(projectId), context.sprints);
    },
    onSuccess: issue => {
      if (showNotification)
        useToastState.getState().addToast(`${issue.issueNumber} has been updated.`);
    },
    onSettled: async () => {
      await invalidateProjectWork(client, projectId);
      await client.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
export function useDeleteIssueMutation() {
  const client = useQueryClient();
  const projectId = useProjectIdParam();
  return useMutation({
    mutationFn: (issue: Issue) => issuesApi.deleteIssue(projectId, issue.id),
    onSuccess: async (_data, issue) => {
      useToastState.getState().addToast(`${issue.issueNumber} has been deleted.`);
      await invalidateProjectWork(client, projectId);
    },
  });
}
export function useUpdateIssueOrderMutation() {
  const mutation = useUpdateIssueMutation({ showNotification: false });
  return {
    ...mutation,
    reorder: ({
      activeIssueId,
      overIssueId,
      issues,
    }: {
      activeIssueId: string;
      overIssueId: string;
      issues: Issue[];
    }) => {
      const from = issues.findIndex(issue => issue.id === activeIssueId);
      const to = issues.findIndex(issue => issue.id === overIssueId);
      if (from < 0 || to < 0) return;
      const reordered = arrayMove(issues, from, to);
      const index = reordered.findIndex(issue => issue.id === activeIssueId);
      const previous = reordered[index - 1];
      const next = reordered[index + 1];
      const orderIndex =
        previous && next
          ? (previous.orderIndex + next.orderIndex) / 2
          : previous
            ? previous.orderIndex + 1
            : next
              ? next.orderIndex / 2
              : 1;
      mutation.mutate({ id: activeIssueId, orderIndex });
    },
  };
}
