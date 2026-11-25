import { IssueStatusEnum, type Issue, type UpdateIssueRequest } from '@/state/issue/types';

/** Resolve a drop on a card or column into a persisted status and position. */
export function getBoardDropUpdate(
  issues: Issue[],
  activeId: string,
  overId: string,
): UpdateIssueRequest | undefined {
  const active = issues.find(issue => issue.id === activeId);
  if (!active || activeId === overId) return;
  const over = issues.find(issue => issue.id === overId);
  const column = IssueStatusEnum.safeParse(overId);
  const status = over?.status ?? (column.success ? column.data : undefined);
  if (!status) return;

  const sorted = issues
    .filter(issue => issue.status === status)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  const from = sorted.findIndex(issue => issue.id === activeId);
  const target = over ? sorted.findIndex(issue => issue.id === over.id) : sorted.length - 1;
  const remaining = sorted.filter(issue => issue.id !== activeId);
  const insertion = over ? target : remaining.length;
  if (active.status === status && from === insertion) return;
  remaining.splice(insertion, 0, active);
  const previous = remaining[insertion - 1];
  const next = remaining[insertion + 1];
  const orderIndex =
    previous && next
      ? (previous.orderIndex + next.orderIndex) / 2
      : previous
        ? previous.orderIndex + 1
        : next
          ? next.orderIndex / 2
          : 1;
  return { id: active.id, status, orderIndex };
}
