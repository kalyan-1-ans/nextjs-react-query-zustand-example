let initialization: Promise<unknown> | undefined;

export function initMocks() {
  if (typeof window === 'undefined') return Promise.resolve();
  initialization ??= import('./browser').then(({ worker }) =>
    worker.start({
      onUnhandledFrame: 'bypass',
      quiet: true,
    }),
  );
  return initialization;
}
