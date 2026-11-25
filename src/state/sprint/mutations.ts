import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProjectIdParam } from '@/hooks/useProjectIdParam';
import { useToastState } from '@/components/design-system/toast';
import { sprintApi } from './api';
import { sprintKeys } from './queries';
import type { CreateSprintRequest, Sprint } from './type';

export function useCreateSprintMutation() {
  const client = useQueryClient();
  const projectId = useProjectIdParam();
  return useMutation({
    mutationFn: (request: CreateSprintRequest) => sprintApi.createSprint(projectId, request),
    onSuccess: async () => {
      useToastState.getState().addToast('Sprint created.');
      await client.invalidateQueries({ queryKey: sprintKeys.byProjectId(projectId) });
    },
  });
}
function useChangeSprintStatus(status: 'ACTIVE' | 'COMPLETED') {
  const client = useQueryClient();
  const projectId = useProjectIdParam();
  const key = sprintKeys.byProjectId(projectId);
  return useMutation({
    mutationFn: (id: string) => sprintApi.updateSprint(projectId, { id, status }),
    onMutate: async id => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Sprint[]>(key);
      client.setQueryData<Sprint[]>(key, old =>
        old?.map(sprint => (sprint.id === id ? { ...sprint, status } : sprint)),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) client.setQueryData(key, context.previous);
    },
    onSuccess: () =>
      useToastState
        .getState()
        .addToast(status === 'ACTIVE' ? 'Sprint started.' : 'Sprint completed.'),
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
}
export function useStartSprintMutation() {
  return useChangeSprintStatus('ACTIVE');
}
export function useCompleteSprintMutation() {
  return useChangeSprintStatus('COMPLETED');
}
