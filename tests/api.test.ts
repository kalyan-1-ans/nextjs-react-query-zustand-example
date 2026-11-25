import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { server } from '../mocks/node';
import { db, resetDb } from '../mocks/data/db';

const request = (path: string, method = 'GET', body?: unknown) =>
  fetch(`http://localhost/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
const issueInput = {
  summary: 'A new issue',
  description: '',
  reporterUserId: '1',
  assigneeUserId: '2',
  sprintId: null,
  status: 'TO_DO',
  type: 'STORY',
  storyPoints: 3,
};
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(resetDb);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('REST demo workflows', () => {
  it('accepts valid login, rejects invalid credentials, and logs out', async () => {
    expect(
      (await request('/login', 'POST', { email: 'johndoe@example.com', password: 'wrong' })).status,
    ).toBe(401);
    const response = await request('/login', 'POST', {
      email: 'johndoe@example.com',
      password: 'Summertime2025',
    });
    expect(await response.json()).toMatchObject({ currentUserId: '1' });
    expect((await request('/logout', 'POST')).status).toBe(204);
  });
  it('returns only backlog issues and includes sprint work separately', async () => {
    const backlog = await (await request('/1/issues')).json();
    expect(backlog.every((issue: { sprintId: string | null }) => issue.sprintId === null)).toBe(
      true,
    );
    const sprints = await (await request('/projects/1/sprints')).json();
    expect(
      sprints.find((sprint: { status: string }) => sprint.status === 'ACTIVE').issues.length,
    ).toBeGreaterThan(0);
  });
  it('creates, edits, reorders, moves and deletes an issue while updating counts', async () => {
    const before = await (await request('/1/issues/count')).json();
    const response = await request('/1/issues', 'POST', issueInput);
    expect(response.status).toBe(201);
    const issue = await response.json();
    expect(await (await request('/1/issues/count')).json()).toEqual({ count: before.count + 1 });
    const updated = await (
      await request(`/1/issues/${issue.id}`, 'PATCH', {
        summary: 'Updated',
        sprintId: '2',
        status: 'REVIEW',
        orderIndex: 0.5,
      })
    ).json();
    expect(updated).toMatchObject({
      summary: 'Updated',
      sprintId: '2',
      status: 'REVIEW',
      orderIndex: 0.5,
    });
    expect(
      (await (await request('/1/issues')).json()).some(
        (item: { id: string }) => item.id === issue.id,
      ),
    ).toBe(false);
    expect((await request(`/1/issues/${issue.id}`, 'DELETE')).status).toBe(204);
    expect(await (await request('/1/issues/count')).json()).toEqual(before);
  });
  it('rejects invalid issues and cross-project sprint assignments', async () => {
    expect((await request('/1/issues', 'POST', { ...issueInput, storyPoints: -1 })).status).toBe(
      400,
    );
    expect((await request('/1/issues', 'POST', { ...issueInput, summary: ' ' })).status).toBe(400);
    expect((await request('/1/issues', 'POST', { ...issueInput, sprintId: '6' })).status).toBe(400);
    expect((await request('/1/issues', 'POST', { ...issueInput, sprintId: '1' })).status).toBe(409);
    expect((await request('/1/issues/missing', 'DELETE')).status).toBe(404);
  });
  it('guards sprint transitions and completes/starts sprints when allowed', async () => {
    expect((await request('/projects/1/sprints/3', 'PATCH', { status: 'ACTIVE' })).status).toBe(
      409,
    );
    expect((await request('/projects/1/sprints/2', 'PATCH', { status: 'COMPLETED' })).status).toBe(
      409,
    );
    for (const issue of db.issues.filter(issue => issue.sprintId === '2')) {
      expect((await request(`/1/issues/${issue.id}`, 'PATCH', { status: 'DONE' })).status).toBe(
        200,
      );
    }
    expect((await request('/projects/1/sprints/2', 'PATCH', { status: 'COMPLETED' })).status).toBe(
      200,
    );
    expect((await request('/projects/1/sprints/3', 'PATCH', { status: 'ACTIVE' })).status).toBe(
      200,
    );
  });
  it('creates a planned sprint and validates dates', async () => {
    const input = {
      name: 'Sprint test',
      goal: 'Ship',
      startDate: '2026-11-01T00:00:00.000Z',
      endDate: '2026-11-15T00:00:00.000Z',
    };
    expect(
      (
        await request('/projects/1/sprints', 'POST', {
          ...input,
          endDate: '2026-10-01T00:00:00.000Z',
        })
      ).status,
    ).toBe(400);
    const response = await request('/projects/1/sprints', 'POST', input);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      name: 'Sprint test',
      status: 'PLANNED',
      issues: [],
    });
  });
  it('updates profiles without returning passwords', async () => {
    const users = await (await request('/users')).json();
    expect(users.every((user: object) => !('password' in user))).toBe(true);
    expect(
      await (await request('/users/1', 'PATCH', { name: 'Updated Person' })).json(),
    ).toMatchObject({ name: 'Updated Person', email: 'johndoe@example.com' });
    expect((await request('/users/1', 'PATCH', { name: ' ' })).status).toBe(400);
  });
  it('creates assignment notifications and consistently marks them READ', async () => {
    await request('/1/issues', 'POST', issueInput);
    const notifications = await (await request('/2/notifications')).json();
    const notification = notifications[0];
    expect(notification.status).toBe('UNREAD');
    expect(
      await (await request(`/notifications/${notification.id}/read`, 'PATCH')).json(),
    ).toMatchObject({ status: 'READ' });
  });
});
