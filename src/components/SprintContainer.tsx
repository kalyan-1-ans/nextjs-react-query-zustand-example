import { useProjectDialogs } from '@/components/project/useProjectDialogs';
import { Button, Chip, Typography } from '@/components/design-system/ui';

import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import cx from 'classnames';
import { format } from 'date-fns';
import { useActiveSprintQuery } from '../state/sprint';
import { useCompleteSprintMutation, useStartSprintMutation } from '../state/sprint/mutations';
import { SprintIssueSortableItem } from './SprintIssueSortableItem';
import { Issue, IssueStatusEnum } from '@/state/issue/types';
import { SprintStatus } from '@/state/sprint/type';
import { useUpdateIssueOrderMutation } from '@/state/issue';
import { useProjectIdParam } from '@/hooks/useProjectIdParam';

interface SprintContainerProps {
  sprintId?: string;
  name: string;
  startDate?: string;
  endDate?: string;
  goal?: string;
  issues?: Issue[] | null;
  status?: SprintStatus;
}

export const SprintContainer = ({
  name,
  startDate,
  endDate,
  goal,
  issues: unsortedIssues,
  status,
  sprintId,
}: SprintContainerProps) => {
  const issues = unsortedIssues
    ? [...unsortedIssues].sort((a, b) => a.orderIndex - b.orderIndex)
    : unsortedIssues;
  const {
    showCompleteSprintWarning: openCompleteWarningDialog,
    showStartSprintWarning: openStartWarningDialog,
  } = useProjectDialogs();
  const { mutate: completeSprint, isPending: loadingComplete } = useCompleteSprintMutation();
  const { mutate: startSprint, isPending: loadingStart } = useStartSprintMutation();
  const projectId = useProjectIdParam();
  const { data } = useActiveSprintQuery({ projectId });
  const { reorder, isPending: reordering } = useUpdateIssueOrderMutation();

  const handleCompleteSprint = () => {
    const hasPendingIssues =
      issues?.some(issue => issue.status !== IssueStatusEnum.enum.DONE) ?? false;
    if (hasPendingIssues) {
      openCompleteWarningDialog();
    } else {
      completeSprint(sprintId ?? '');
    }
  };

  const handleStartSprint = () => {
    if (data) {
      openStartWarningDialog();
    } else {
      startSprint(sprintId ?? '');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (reordering || status === 'COMPLETED' || !over || active.id === over.id) {
      return;
    }
    reorder({
      activeIssueId: String(active.id),
      overIssueId: String(over.id),
      issues: issues ?? [],
    });
  };

  return (
    <div
      className={cx('p-4 bg-gray-200 flex flex-col gap-1 overflow-x-auto', {
        'text-gray-500': status === 'COMPLETED',
      })}
    >
      <div className="text-sm flex flex-wrap gap-3">
        <Typography as="h3" className={cx('text-sm font-semibold tracking-wider m-0')}>
          {name}
        </Typography>
        {startDate && endDate && (
          <div className="flex gap-1 text-sm">
            <Typography className="text-sm">{format(startDate, 'dd MMM')}</Typography>
            <Typography className="text-sm"> - </Typography>
            <Typography className="text-sm">{format(endDate, 'dd MMM')}</Typography>
          </div>
        )}
        {status === 'ACTIVE' && (
          <Chip variant="ghost" value="Active" size="sm" color="brown" className="ml-8" />
        )}
        {status === 'COMPLETED' && (
          <Chip
            variant="ghost"
            value="Completed"
            size="sm"
            color="blue-gray"
            className="ml-8 text-gray-500"
          />
        )}
        {status === 'ACTIVE' && (
          <Button
            size="sm"
            variant="outlined"
            className="ml-auto"
            onClick={handleCompleteSprint}
            loading={loadingComplete}
          >
            Complete Sprint
          </Button>
        )}
        {status === 'PLANNED' && (
          <Button
            size="sm"
            variant="outlined"
            className="ml-auto"
            onClick={handleStartSprint}
            loading={loadingStart}
          >
            Start Sprint
          </Button>
        )}
      </div>
      {goal && <Typography className="text-[0.75rem] italic">{goal}</Typography>}
      {issues?.length === 0 && (
        <Typography className="mt-4 text-[0.75rem]">No issues found.</Typography>
      )}
      {issues && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={issues.map(issue => issue.id)}
            strategy={verticalListSortingStrategy}
            disabled={status === 'COMPLETED'}
          >
            <table
              className={cx('w-full min-w-max table-auto text-left mt-4', {
                'text-gray-500': status === 'COMPLETED',
              })}
            >
              <tbody>
                {issues?.map((issue, index) => {
                  const isLast = index === issues.length - 1;
                  const classes = isLast ? 'py-4' : 'py-4 border-b border-gray-500';
                  return <SprintIssueSortableItem key={issue.id} issue={issue} classes={classes} />;
                })}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
