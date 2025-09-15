import type { ReactNode } from 'react';

export default function GlassPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(200,120,255,0.25)] ${className}`}
    >
      {children}
    </div>
  );
}
