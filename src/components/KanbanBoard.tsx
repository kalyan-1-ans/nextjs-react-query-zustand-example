import { useProjectDialogs } from '@/components/project/useProjectDialogs';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  useDndContext,
  type CollisionDetection,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { getBoardDropUpdate } from '@/utils/board.helper';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs, Button, Typography } from './design-system/ui';
import { useProjectIdParam } from '@/hooks/useProjectIdParam';
import { useActiveSprintQuery } from '@/state/sprint';
import { useCompleteSprintMutation } from '@/state/sprint/mutations';
import { useUpdateIssueMutation } from '@/state/issue';
import type { Issue, IssueStatus } from '@/state/issue/types';
import { useProjectQuery } from '@/state/project';
import { IssueDraggable, IssueDragPreview } from './IssueDraggable';
import { KanbanBoardSkeleton } from './KanbanBoardSkeleton';

const columns: { id: IssueStatus; title: string }[] = [
  { id: 'TO_DO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'REVIEW', title: 'Review' },
  { id: 'DONE', title: 'Done' },
];
// Pointer drops must land inside a column; keyboard moves use geometric collisions.
const boardCollisionDetection: CollisionDetection = args => {
  if (!args.pointerCoordinates) return closestCorners(args);
  const hits = pointerWithin(args);
  const cards = hits.filter(hit => !columns.some(column => column.id === hit.id));
  return cards.length ? cards : hits;
};

function Column({
  id,
  title,
  issues,
  disabled,
}: {
  id: IssueStatus;
  title: string;
  issues: Issue[];
  disabled: boolean;
}) {
  const { setNodeRef } = useDroppable({ id, data: { status: id }, disabled });
  const { over } = useDndContext();
  const isOver = over?.data.current?.status === id;
  return (
    <SortableContext
      id={id}
      items={issues.map(issue => issue.id)}
      strategy={verticalListSortingStrategy}
    >
      <section
        ref={setNodeRef}
        aria-label={title}
        className={`min-h-80 min-w-60 flex-1 rounded-lg p-4 ${isOver ? 'bg-blue-100' : 'bg-gray-100'}`}
      >
        <h2 className="mb-4 font-bold">
          {title} <span className="text-gray-500">{issues.length}</span>
        </h2>
        {issues.map(issue => (
          <IssueDraggable key={issue.id} issue={issue} disabled={disabled} />
        ))}
      </section>
    </SortableContext>
  );
}
export function KanbanBoard() {
  const projectId = useProjectIdParam();
  const { data: sprint, isLoading, error, refetch } = useActiveSprintQuery({ projectId });
  const { data: project } = useProjectQuery(projectId);
  const update = useUpdateIssueMutation({ showNotification: false });
  const complete = useCompleteSprintMutation();
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIssue = sprint?.issues.find(issue => issue.id === activeId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const { openIssueDialog: openDialog, showCompleteSprintWarning } = useProjectDialogs();
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || update.isPending || !sprint) return;
    const input = getBoardDropUpdate(sprint.issues, String(active.id), String(over.id));
    if (input) update.mutate(input);
  };
  const handleComplete = () => {
    if (!sprint) return;
    if (sprint.issues.some(issue => issue.status !== 'DONE')) {
      showCompleteSprintWarning();
    } else {
      complete.mutate(sprint.id, { onSuccess: () => router.push(`/project/${projectId}`) });
    }
  };
  if (isLoading) return <KanbanBoardSkeleton />;
  if (error)
    return (
      <div role="alert">
        Unable to load sprint.{' '}
        <button onClick={() => refetch()} className="underline">
          Retry
        </button>
      </div>
    );
  if (!sprint)
    return (
      <div>
        <Typography variant="h3">No active sprint</Typography>
        <Link className="mt-4 inline-block underline" href={`/project/${projectId}`}>
          View issues and start a sprint
        </Link>
      </div>
    );
  return (
    <div className="w-full">
      <Breadcrumbs className="mb-4">
        <Link href="/dashboard">Projects</Link>
        <Link href={`/project/${projectId}`}>{project?.name}</Link>
        <span>Active Sprint</span>
      </Breadcrumbs>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <Typography variant="h3">{sprint.name}</Typography>
          <Typography className="text-gray-600">{sprint.goal}</Typography>
        </div>
        <div className="ml-auto flex gap-3">
          <Button onClick={() => openDialog()}>Create Issue</Button>
          <Button variant="outlined" loading={complete.isPending} onClick={handleComplete}>
            Complete Sprint
          </Button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={boardCollisionDetection}
        onDragStart={({ active }) => setActiveId(String(active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <div className="mt-6 flex gap-4 overflow-x-auto">
          {columns.map(column => (
            <Column
              key={column.id}
              {...column}
              disabled={update.isPending}
              issues={sprint.issues
                .filter(issue => issue.status === column.id)
                .sort((a, b) => a.orderIndex - b.orderIndex)}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeIssue ? <IssueDragPreview issue={activeIssue} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
