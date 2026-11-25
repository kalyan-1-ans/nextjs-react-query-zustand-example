import type { StoreApi, UseBoundStore } from 'zustand';

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]-?: () => T[K] } }
  : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  store: S,
): WithSelectors<S> => {
  const selectors: Record<string, () => unknown> = {};
  for (const key of Object.keys(store.getState())) {
    selectors[key] = () => store(state => state[key as keyof typeof state]);
  }
  return Object.assign(store, { use: selectors }) as WithSelectors<S>;
};
