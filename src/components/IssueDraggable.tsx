import { useProjectDialogs } from '@/components/project/useProjectDialogs';
import { useUsersQuery } from '@/state/user';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Typography } from '@/components/design-system/ui';
import Avatar from '@/components/design-system/InitialsAvatar';
import { ISSUE_TYPE_COLOR } from '../utils/constants';
import type { Issue } from '@/state/issue/types';
import type { ReactNode } from 'react';

function IssueCardContent({
  issue,
  grip,
  preview = false,
  onEdit,
}: {
  issue: Issue;
  grip?: ReactNode;
  preview?: boolean;
  onEdit?: () => void;
}) {
  const { summary, assigneeUserId, issueNumber, storyPoints, type } = issue;
  const { data: users } = useUsersQuery();
  const assignee = users?.find(user => user.id === assigneeUserId);
  return (
    <>
      <div className="flex items-start gap-2">
        {grip}
        <Typography className="text-md tracking-wide">
          {preview ? (
            summary
          ) : (
            <button
              type="button"
              className="touch-none cursor-grab text-left hover:underline active:cursor-grabbing"
              onClick={onEdit}
            >
              {summary}
            </button>
          )}
        </Typography>
      </div>
      {assignee?.name && (
        <Typography className="text-xs text-blue-gray-800">{assignee.name}</Typography>
      )}
      <div className="flex w-full">
        <div className="flex gap-2 items-center">
          <div className={`w-3 h-3 ${ISSUE_TYPE_COLOR[type]}`} />
          <Typography className="text-xs">{issueNumber}</Typography>
        </div>
        <div className="ml-auto flex gap-3 items-center">
          {storyPoints > 0 && (
            <Typography className="w-4 h-4 bg-gray-500 text-white rounded-full flex items-center justify-center text-[0.6rem]">
              {storyPoints}
            </Typography>
          )}
          <Avatar name={assignee?.name ?? 'Unassigned'} size="20" />
        </div>
      </div>
    </>
  );
}

const cardClassName =
  'mb-2.5 flex flex-col gap-3 rounded-md border border-gray-300 bg-white p-3 shadow-md';

export function IssueDragPreview({ issue }: { issue: Issue }) {
  return (
    <div
      aria-hidden="true"
      className={`${cardClassName} cursor-grabbing shadow-xl ring-2 ring-blue-400`}
    >
      <IssueCardContent issue={issue} preview />
    </div>
  );
}

export function IssueDraggable({ issue, disabled = false }: { issue: Issue; disabled?: boolean }) {
  const { openIssueDialog } = useProjectDialogs();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue.id,
    data: { status: issue.status },
    disabled,
  });
  return (
    <article
      ref={setNodeRef}
      aria-label={`${issue.issueNumber}: ${issue.summary}`}
      onPointerDown={event => listeners?.onPointerDown?.(event)}
      onDoubleClick={() => {
        if (!isDragging) openIssueDialog(issue);
      }}
      className={`${cardClassName} touch-none select-none ${disabled ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing'} ${isDragging ? 'opacity-30' : ''}`}
      style={{ transform: isDragging ? undefined : CSS.Transform.toString(transform), transition }}
    >
      <IssueCardContent
        issue={issue}
        onEdit={() => openIssueDialog(issue)}
        grip={
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Drag issue ${issue.issueNumber}`}
            disabled={disabled}
            className="touch-none cursor-grab rounded px-1 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            ⠿
          </button>
        }
      />
    </article>
  );
}
