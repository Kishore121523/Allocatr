// components/layout/protected-route.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { GlobalQuickAdd } from '@/components/layout/global-quick-add';
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <div className="space-y-2">
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {children}
      <GlobalQuickAdd />
    </>
  );
}