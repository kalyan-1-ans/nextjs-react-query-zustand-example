'use client';

import { useAuthStore } from '@/state/auth';
import { Spinner } from '@/components/design-system/ui';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function IndexPage() {
  const isAuthenticated = useAuthStore.use.isAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Spinner className="h-16 w-16 text-gray-900/50" />
    </div>
  );
}
