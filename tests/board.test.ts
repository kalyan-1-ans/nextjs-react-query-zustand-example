import { expect, it } from 'vitest';
import { getBoardDropUpdate } from '../src/utils/board.helper';
import type { Issue, IssueStatus } from '../src/state/issue/types';

function issue(id: string, status: IssueStatus, orderIndex: number): Issue {
  return {
    id,
    status,
    orderIndex,
    issueNumber: id,
    summary: id,
    projectId: '1',
    sprintId: '2',
    description: '',
    assigneeUserId: null,
    reporterUserId: '1',
    storyPoints: 0,
    type: 'STORY',
  };
}
const issues = [
  issue('a', 'TO_DO', 1),
  issue('b', 'TO_DO', 2),
  issue('c', 'TO_DO', 3),
  issue('d', 'REVIEW', 4),
];
it('moves into an empty column', () => {
  expect(getBoardDropUpdate(issues, 'a', 'DONE')).toEqual({
    id: 'a',
    status: 'DONE',
    orderIndex: 1,
  });
});
it('reorders cards within a column in either direction', () => {
  expect(getBoardDropUpdate(issues, 'a', 'b')).toEqual({
    id: 'a',
    status: 'TO_DO',
    orderIndex: 2.5,
  });
  expect(getBoardDropUpdate(issues, 'c', 'a')).toEqual({
    id: 'c',
    status: 'TO_DO',
    orderIndex: 0.5,
  });
});
it('inserts before a card in another column or appends on a column drop', () => {
  expect(getBoardDropUpdate(issues, 'a', 'd')).toEqual({
    id: 'a',
    status: 'REVIEW',
    orderIndex: 2,
  });
  expect(getBoardDropUpdate(issues, 'a', 'REVIEW')).toEqual({
    id: 'a',
    status: 'REVIEW',
    orderIndex: 5,
  });
  expect(getBoardDropUpdate(issues, 'a', 'TO_DO')).toEqual({
    id: 'a',
    status: 'TO_DO',
    orderIndex: 4,
  });
});
it('ignores unchanged and invalid drops', () => {
  expect(getBoardDropUpdate(issues, 'a', 'a')).toBeUndefined();
  expect(getBoardDropUpdate(issues, 'c', 'TO_DO')).toBeUndefined();
  expect(getBoardDropUpdate(issues, 'missing', 'DONE')).toBeUndefined();
  expect(getBoardDropUpdate(issues, 'a', 'outside')).toBeUndefined();
});
