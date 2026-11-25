import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createSelectors } from '@/utils/zustand.helper';

type PreferenceState = {
  lastVisitedProjectId: string | undefined;
};

type PreferenceAction = {
  setLastVisitedProjectId: (projectId?: string) => void;
};

const initState: PreferenceState = {
  lastVisitedProjectId: undefined,
};

type PreferenceStateAndAction = PreferenceState & {
  actions: PreferenceAction;
};

const usePreferenceStoreBase = create<PreferenceStateAndAction>()(
  persist(
    devtools(
      immer(set => ({
        ...initState,
        actions: {
          setLastVisitedProjectId: (projectId?: string) => {
            set(state => {
              state.lastVisitedProjectId = projectId;
            });
          },
        },
      })),
      {
        enabled: true,
        name: 'preference-store',
        store: 'preference-store',
      },
    ),
    {
      // Keep the existing storage key so saved preferences survive this rename.
      name: 'ui-preference-store',
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: state => {
        return {
          lastVisitedProjectId: state.lastVisitedProjectId,
        };
      },
    },
  ),
);

export const usePreferenceStore = createSelectors(usePreferenceStoreBase);
