'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Spinner } from '@/components/design-system/ui';
import { useEffect, useState } from 'react';
import { createQueryClient } from '@/utils/client.helper';
import { useAuthStore } from '@/state/auth/store';
import { usePreferenceStore } from '@/state/preference';
import { ToastContainer } from '@/components/design-system/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function initialize() {
      await Promise.all([useAuthStore.persist.rehydrate(), usePreferenceStore.persist.rehydrate()]);
      if (process.env.NEXT_PUBLIC_ENABLE_API_MOCKING !== 'false') {
        const { initMocks } = await import('../../mocks');
        await initMocks();
      }
      if (mounted) setReady(true);
    }
    initialize().catch(cause => {
      console.error('Application initialization failed', cause);
      if (mounted) setError(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {error ? (
        <div role="alert" className="p-8 text-center">
          <p>Unable to start the demo API. Please reload to try again.</p>
          <button onClick={() => window.location.reload()} className="mt-4 underline">
            Reload
          </button>
        </div>
      ) : ready ? (
        children
      ) : (
        <div
          className="flex min-h-screen items-center justify-center"
          role="status"
          aria-label="Loading application"
        >
          <Spinner className="h-12 w-12" />
        </div>
      )}
      <ToastContainer />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
