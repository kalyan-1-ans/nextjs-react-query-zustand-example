import userData from './users.json';
import projectData from './projects.json';
import issueData from './issues.json';
import sprintData from './sprints.json';
import { issueSchema, type Issue } from '../../src/state/issue/types';
import { sprintSchema, type Sprint } from '../../src/state/sprint/type';
import { NotificationStatus, type Notification } from '../../src/state/notification/types';
import type { Project } from '../../src/state/project/types';
import type { User } from '../../src/state/user/types';

type DemoUser = User & { password: string };
type Database = {
  users: DemoUser[];
  projects: Project[];
  issues: Issue[];
  sprints: Omit<Sprint, 'issues'>[];
  notifications: Notification[];
};
const storageKey = 'sprint-board-demo-v1';
function seed(): Database {
  const issues = issueData.map((issue, index) =>
    issueSchema.parse({
      ...issue,
      sprintId: issue.sprintId || null,
      assigneeUserId: issue.assigneeUserId || null,
      orderIndex: index + 1,
    }),
  );
  return {
    users: structuredClone(userData),
    projects: structuredClone(projectData),
    issues,
    sprints: sprintData.map(sprint => {
      const parsed = sprintSchema.parse({ ...sprint, issues: [] });
      // Seed completed sprints with completed work.
      if (parsed.status === 'COMPLETED')
        issues
          .filter(issue => issue.sprintId === parsed.id)
          .forEach(issue => {
            issue.status = 'DONE';
          });
      return parsed;
    }),
    notifications: issues
      .filter(issue => issue.assigneeUserId)
      .map(issue => ({
        id: `assignment-${issue.id}`,
        userId: issue.assigneeUserId!,
        message: `${issue.issueNumber} has been assigned to you.`,
        status: NotificationStatus.UNREAD,
      })),
  };
}
function load(): Database {
  if (typeof sessionStorage !== 'undefined') {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved) as Database;
    } catch {
      /* Use fresh demo data when storage is unavailable. */
    }
  }
  return seed();
}
export const db = load();
export function saveDb() {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(db));
    } catch {
      /* Demo can still run in memory. */
    }
  }
}
export function resetDb() {
  Object.assign(db, seed());
  saveDb();
}
export function enrichSprint(sprint: Omit<Sprint, 'issues'>): Sprint {
  return {
    ...sprint,
    issues: db.issues
      .filter(issue => issue.sprintId === sprint.id && issue.projectId === sprint.projectId)
      .sort((a, b) => a.orderIndex - b.orderIndex),
  };
}
export function notifyAssignment(issue: Issue, previousAssignee?: string | null) {
  if (issue.assigneeUserId && issue.assigneeUserId !== previousAssignee) {
    db.notifications.unshift({
      id: crypto.randomUUID(),
      userId: issue.assigneeUserId,
      message: `${issue.issueNumber} has been assigned to you.`,
      status: NotificationStatus.UNREAD,
    });
  }
}
