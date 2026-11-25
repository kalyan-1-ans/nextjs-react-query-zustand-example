'use client';

import { useAuthStore } from '@/state/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MainNav } from '../__layout/MainNav';

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen flex flex-col">
      <header>
        <MainNav />
      </header>
      <div className="flex flex-1">
        <div className="px-4 md:px-8 py-8 w-full min-w-0">{children}</div>
      </div>
    </main>
  );
}
