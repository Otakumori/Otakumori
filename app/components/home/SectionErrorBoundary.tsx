'use client';

import { Suspense, type ReactNode } from 'react';
import ClientErrorBoundary from '@/app/components/util/ClientErrorBoundary';

interface SectionErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName: string;
}

/**
 * Wraps a section with both Suspense and ErrorBoundary for comprehensive error handling
 */
export default function SectionErrorBoundary({
  children,
  fallback,
  sectionName,
}: SectionErrorBoundaryProps) {
  const defaultFallback = (
    <div className="text-pink-200/70 p-4 text-center">Loading {sectionName}…</div>
  );

  return (
    <ClientErrorBoundary>
      <Suspense fallback={fallback ?? defaultFallback}>{children}</Suspense>
    </ClientErrorBoundary>
  );
}
