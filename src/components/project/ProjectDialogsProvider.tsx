'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Issue } from '@/state/issue/types';
import { IssueUpsertDialog } from '@/components/IssueUpsertDialog';
import { SprintCreateDialog } from '@/components/SprintCreateDialog';
import { SprintCompleteWarningDialog } from '@/components/SprintCompleteWarningDialog';
import { SprintStartWarningDialog } from '@/components/SprintStartWarningDialog';
import { ProjectDialogsContext, type ProjectDialog } from './useProjectDialogs';

export function ProjectDialogsProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ProjectDialog | null>(null);
  const openIssueDialog = useCallback((issue?: Issue) => setDialog({ type: 'issue', issue }), []);
  const openSprintDialog = useCallback(() => setDialog({ type: 'sprint-create' }), []);
  const showCompleteSprintWarning = useCallback(
    () => setDialog({ type: 'sprint-complete-warning' }),
    [],
  );
  const showStartSprintWarning = useCallback(() => setDialog({ type: 'sprint-start-warning' }), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const value = useMemo(
    () => ({
      dialog,
      openIssueDialog,
      openSprintDialog,
      showCompleteSprintWarning,
      showStartSprintWarning,
      closeDialog,
    }),
    [
      dialog,
      openIssueDialog,
      openSprintDialog,
      showCompleteSprintWarning,
      showStartSprintWarning,
      closeDialog,
    ],
  );

  return (
    <ProjectDialogsContext.Provider value={value}>
      {children}
      <IssueUpsertDialog />
      <SprintCreateDialog />
      <SprintCompleteWarningDialog />
      <SprintStartWarningDialog />
    </ProjectDialogsContext.Provider>
  );
}
