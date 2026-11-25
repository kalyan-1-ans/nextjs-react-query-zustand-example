import { http, HttpResponse } from 'msw';
import { db, notifyAssignment, saveDb } from '../data/db';
import { issueSchema, type Issue } from '../../src/state/issue/types';

const createSchema = issueSchema.omit({
  id: true,
  issueNumber: true,
  projectId: true,
  orderIndex: true,
});
const updateSchema = createSchema
  .partial()
  .extend({ orderIndex: issueSchema.shape.orderIndex.positive().optional() });
function validReferences(
  issue: Pick<Issue, 'sprintId' | 'projectId' | 'reporterUserId' | 'assigneeUserId'>,
) {
  return (
    db.projects.some(project => project.id === issue.projectId) &&
    (!issue.sprintId ||
      db.sprints.some(
        sprint => sprint.id === issue.sprintId && sprint.projectId === issue.projectId,
      )) &&
    db.users.some(user => user.id === issue.reporterUserId) &&
    (!issue.assigneeUserId || db.users.some(user => user.id === issue.assigneeUserId))
  );
}
export const issuesHandlers = [
  http.get('*/api/:projectId/issues/count', ({ params }) =>
    HttpResponse.json({
      count: db.issues.filter(issue => issue.projectId === params.projectId).length,
    }),
  ),
  http.get('*/api/:projectId/issues', ({ params }) =>
    HttpResponse.json(
      db.issues
        .filter(issue => issue.projectId === params.projectId && !issue.sprintId)
        .sort((a, b) => a.orderIndex - b.orderIndex),
    ),
  ),
  http.post('*/api/:projectId/issues', async ({ params, request }) => {
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success)
      return HttpResponse.json({ errorMessage: 'Invalid issue details' }, { status: 400 });
    const projectId = String(params.projectId);
    const issue = {
      ...parsed.data,
      projectId,
      id: crypto.randomUUID(),
      issueNumber: `ISS-${Math.max(1000, ...db.issues.map(issue => Number(issue.issueNumber.replace(/\D/g, '')) || 0)) + 1}`,
      orderIndex:
        Math.max(
          0,
          ...db.issues
            .filter(
              issue => issue.projectId === projectId && issue.sprintId === parsed.data.sprintId,
            )
            .map(issue => issue.orderIndex),
        ) + 1,
    };
    if (!validReferences(issue))
      return HttpResponse.json(
        { errorMessage: 'Invalid project, sprint or user' },
        { status: 400 },
      );
    if (db.sprints.some(sprint => sprint.id === issue.sprintId && sprint.status === 'COMPLETED'))
      return HttpResponse.json(
        { errorMessage: 'Cannot add work to a completed sprint' },
        { status: 409 },
      );
    db.issues.push(issue);
    notifyAssignment(issue);
    saveDb();
    return HttpResponse.json(issue, { status: 201 });
  }),
  http.patch('*/api/:projectId/issues/:id', async ({ params, request }) => {
    const index = db.issues.findIndex(
      issue => issue.id === params.id && issue.projectId === params.projectId,
    );
    if (index < 0) return HttpResponse.json({ errorMessage: 'Issue not found' }, { status: 404 });
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success)
      return HttpResponse.json({ errorMessage: 'Invalid issue details' }, { status: 400 });
    const previous = db.issues[index];
    const issue = { ...previous, ...parsed.data };
    if (!validReferences(issue))
      return HttpResponse.json({ errorMessage: 'Invalid sprint or user' }, { status: 400 });
    if (
      db.sprints.some(sprint => sprint.id === issue.sprintId && sprint.status === 'COMPLETED') &&
      (previous.sprintId !== issue.sprintId || issue.status !== 'DONE')
    )
      return HttpResponse.json(
        { errorMessage: 'Completed sprint issues must remain done; move the issue to reopen it' },
        { status: 409 },
      );
    if (previous.sprintId !== issue.sprintId && parsed.data.orderIndex === undefined)
      issue.orderIndex =
        Math.max(
          0,
          ...db.issues
            .filter(
              other => other.projectId === issue.projectId && other.sprintId === issue.sprintId,
            )
            .map(other => other.orderIndex),
        ) + 1;
    db.issues[index] = issue;
    notifyAssignment(issue, previous.assigneeUserId);
    saveDb();
    return HttpResponse.json(issue);
  }),
  http.delete('*/api/:projectId/issues/:id', ({ params }) => {
    const index = db.issues.findIndex(
      issue => issue.id === params.id && issue.projectId === params.projectId,
    );
    if (index < 0) return HttpResponse.json({ errorMessage: 'Issue not found' }, { status: 404 });
    db.issues.splice(index, 1);
    saveDb();
    return new HttpResponse(null, { status: 204 });
  }),
];
