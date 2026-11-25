import { useProjectDialogs } from '@/components/project/useProjectDialogs';
import { useUsersQuery } from '@/state/user';
import { Issue } from '@/state/issue/types';
import { ISSUE_TYPE_COLOR } from '../utils/constants';
import { Typography } from '@/components/design-system/ui';
import Avatar from '@/components/design-system/InitialsAvatar';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SprintIssueItemProps {
  issue: Issue;
  classes: string;
}

export const SprintIssueSortableItem = ({ issue, classes }: SprintIssueItemProps) => {
  const { summary, issueNumber, status, assigneeUserId, storyPoints } = issue;
  const { data: users } = useUsersQuery();
  const assignee = users?.find(user => user.id === assigneeUserId);
  const { openIssueDialog: openDialog } = useProjectDialogs();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
    useSortable({
      id: issue.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleIssueDbClick = () => {
    openDialog(issue);
  };

  return (
    <tr
      ref={setNodeRef}
      className="hover:bg-gray-50 cursor-pointer"
      onDoubleClick={handleIssueDbClick}
      style={style}
    >
      <td className={`${classes} whitespace-nowrap`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Drag issue ${issueNumber}`}
            className="touch-none cursor-grab rounded px-1 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            ⠿
          </button>
          <div className={`w-3 h-3 ${ISSUE_TYPE_COLOR[issue?.type]}`} />
          <Typography variant="small" className="font-normal">
            {issueNumber}
          </Typography>
        </div>
      </td>
      <td className={`${classes} w-1/2`}>
        <Typography variant="small" className="font-normal">
          <button
            type="button"
            className="text-left hover:underline"
            onClick={handleIssueDbClick}
            onPointerDown={event => event.stopPropagation()}
          >
            {summary}
          </button>
        </Typography>
      </td>
      <td className={`${classes}  w-1/6`}>
        <Typography variant="small" className="font-normal">
          {status}
        </Typography>
      </td>
      <td className={`${classes}  w-1/8`}>
        <Avatar name={assignee?.name ?? 'Unassigned'} size="20" round={true} />
      </td>
      <td className={`${classes}  w-1/8`}>
        <div>
          <Typography
            variant="small"
            color="blue-gray"
            className="font-normal bg-gray-600 text-white w-6 text-center rounded-full"
          >
            {storyPoints ?? 0}
          </Typography>
        </div>
      </td>
    </tr>
  );
};
