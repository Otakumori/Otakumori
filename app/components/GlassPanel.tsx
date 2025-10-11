import type { ReactNode } from 'react';

export default function GlassPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass-panel rounded-2xl ${className}`}>{children}</div>;
}
