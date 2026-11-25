'use client';

import { ProjectDialogsProvider } from '@/components/project/ProjectDialogsProvider';
import { SideNav } from '@/app/__layout/SideNav';
import { useProjectIdParam } from '@/hooks/useProjectIdParam';
import { usePreferenceStore } from '@/state/preference';
import React, { useEffect } from 'react';

export default function ProjectLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setLastVisitedProjectId } = usePreferenceStore.use.actions();
  const projectId = useProjectIdParam();

  useEffect(() => {
    setLastVisitedProjectId(projectId);
  }, [projectId, setLastVisitedProjectId]);

  return (
    <ProjectDialogsProvider key={projectId}>
      <section className="flex flex-1 flex-col gap-4 md:flex-row">
        <div className="md:w-52 shrink-0">
          <SideNav />
        </div>
        <div className="min-w-0 flex-1 py-4 md:px-6">{children}</div>
      </section>
    </ProjectDialogsProvider>
  );
}
