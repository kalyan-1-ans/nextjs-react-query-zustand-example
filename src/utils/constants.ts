import { IssueTypeEnum } from '@/state/issue/types';

export const ISSUE_TYPE_COLOR = {
  [IssueTypeEnum.enum.STORY]: 'bg-gray-500',
  [IssueTypeEnum.enum.BUG]: 'bg-red-500',
};
