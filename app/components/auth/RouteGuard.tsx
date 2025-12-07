'use client';

import { Skeleton } from '@/app/components/ui/Skeleton';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;

export function RouteGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
  fallback = null,
  redirectTo,
}: RouteGuardProps) {
  const { isLoaded, isSignedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (requireAuth && !isSignedIn) {
      const url = new URL('/sign-in', window.location.origin);
      if (redirectTo) {
        url.searchParams.set('redirect_url', redirectTo);
      }
      router.push(url.toString());
      return;
    }

    if (requireAdmin && (!isSignedIn || !isAdmin)) {
      if (!isSignedIn) {
        const url = new URL('/sign-in', window.location.origin);
        if (redirectTo) {
          url.searchParams.set('redirect_url', redirectTo);
        }
        router.push(url.toString());
      } else {
        router.push('/unauthorized');
      }
      return;
    }
  }, [isLoaded, isSignedIn, isAdmin, requireAuth, requireAdmin, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4fa3] mx-auto mb-4"></div>
          <Skeleton />
        </div>
      </div>
    );
  }

  if (requireAuth && !isSignedIn) {
    return fallback;
  }

  if (requireAdmin && (!isSignedIn || !isAdmin)) {
    return fallback;
  }

  return <>{children}</>;
}

export function AuthGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RouteGuard requireAuth fallback={fallback}>
      {children}
    </RouteGuard>
  );
}

export function AdminGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RouteGuard requireAuth requireAdmin fallback={fallback}>
      {children}
    </RouteGuard>
  );
}
