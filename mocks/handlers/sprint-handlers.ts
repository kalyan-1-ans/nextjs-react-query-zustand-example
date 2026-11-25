import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { db, enrichSprint, saveDb } from '../data/db';
import { SprintStatusEnum } from '../../src/state/sprint/type';

const fields = z.object({
  name: z.string().trim().min(1),
  goal: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});
const updateSchema = fields.partial().extend({ status: SprintStatusEnum.optional() });
export const sprintHandlers = [
  http.get('*/api/projects/:projectId/sprints', ({ params }) =>
    HttpResponse.json(
      db.sprints.filter(sprint => sprint.projectId === params.projectId).map(enrichSprint),
    ),
  ),
  http.post('*/api/projects/:projectId/sprints', async ({ params, request }) => {
    const parsed = fields.safeParse(await request.json());
    if (!parsed.success || parsed.data.endDate < parsed.data.startDate)
      return HttpResponse.json(
        { errorMessage: 'Provide valid sprint details and dates' },
        { status: 400 },
      );
    if (!db.projects.some(project => project.id === params.projectId))
      return HttpResponse.json({ errorMessage: 'Project not found' }, { status: 404 });
    const sprint = {
      ...parsed.data,
      id: crypto.randomUUID(),
      projectId: String(params.projectId),
      status: 'PLANNED' as const,
    };
    db.sprints.push(sprint);
    saveDb();
    return HttpResponse.json(enrichSprint(sprint), { status: 201 });
  }),
  http.patch('*/api/projects/:projectId/sprints/:id', async ({ params, request }) => {
    const sprint = db.sprints.find(
      sprint => sprint.id === params.id && sprint.projectId === params.projectId,
    );
    if (!sprint) return HttpResponse.json({ errorMessage: 'Sprint not found' }, { status: 404 });
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success)
      return HttpResponse.json({ errorMessage: 'Invalid sprint details' }, { status: 400 });
    const next = { ...sprint, ...parsed.data };
    if (
      sprint.status === 'COMPLETED' ||
      (next.status === 'COMPLETED' && sprint.status !== 'ACTIVE')
    )
      return HttpResponse.json({ errorMessage: 'Invalid sprint transition' }, { status: 409 });
    if (
      next.status === 'ACTIVE' &&
      db.sprints.some(
        other =>
          other.projectId === sprint.projectId &&
          other.status === 'ACTIVE' &&
          other.id !== sprint.id,
      )
    )
      return HttpResponse.json(
        { errorMessage: 'Another sprint is already active' },
        { status: 409 },
      );
    if (
      next.status === 'COMPLETED' &&
      db.issues.some(issue => issue.sprintId === sprint.id && issue.status !== 'DONE')
    )
      return HttpResponse.json(
        { errorMessage: 'Complete or move pending issues first' },
        { status: 409 },
      );
    if (next.endDate < next.startDate)
      return HttpResponse.json(
        { errorMessage: 'End date must follow start date' },
        { status: 400 },
      );
    Object.assign(sprint, next);
    saveDb();
    return HttpResponse.json(enrichSprint(sprint));
  }),
];
