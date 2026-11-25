'use client';

import { createContext, useContext } from 'react';
import type { Issue } from '@/state/issue/types';

export type ProjectDialog =
  | { type: 'issue'; issue?: Issue }
  | { type: 'sprint-create' }
  | { type: 'sprint-complete-warning' }
  | { type: 'sprint-start-warning' };

export interface ProjectDialogs {
  dialog: ProjectDialog | null;
  openIssueDialog: (issue?: Issue) => void;
  openSprintDialog: () => void;
  showCompleteSprintWarning: () => void;
  showStartSprintWarning: () => void;
  closeDialog: () => void;
}

export const ProjectDialogsContext = createContext<ProjectDialogs | null>(null);

export function useProjectDialogs() {
  const context = useContext(ProjectDialogsContext);
  if (!context) throw new Error('useProjectDialogs must be used within ProjectDialogsProvider');
  return context;
}
