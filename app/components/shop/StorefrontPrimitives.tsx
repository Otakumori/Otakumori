import type { HTMLAttributes, ReactNode } from 'react';

import { MoriSectionHeader, MoriSurface } from '@/app/components/mori/MoriFoundation';

export function DecorativeSectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
}) {
  return (
    <MoriSectionHeader
      className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}
      description={description}
      eyebrow={eyebrow}
      headingLevel={1}
      title={title}
    />
  );
}

export function StorefrontPanel({
  children,
  className = '',
  ...props
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLElement>) {
  return (
    <MoriSurface
      {...props}
      className={`relative overflow-hidden p-0 ${className}`}
      material="lacquer"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(169,133,95,0.07),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.025),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      <div className="relative z-10">{children}</div>
    </MoriSurface>
  );
}

export function StorefrontButton({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.12] bg-[#7c4c5d]/48 px-5 py-2 text-sm font-semibold text-[#fff1e4] transition hover:border-[#efc7d2]/28 hover:bg-[#8a5668]/58 ${className}`}
    >
      {children}
    </span>
  );
}
