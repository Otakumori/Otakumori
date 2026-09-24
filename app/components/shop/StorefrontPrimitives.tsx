import type { HTMLAttributes, ReactNode } from 'react';

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
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a9855f]">
        {eyebrow}
      </p>
      <h1 className="font-display mt-3 text-balance text-4xl font-semibold tracking-tight text-[#fff1e4] md:text-6xl">
        {title}
      </h1>
      {description ? (
        <p className="font-body mt-5 text-base leading-8 text-[#cdbbb7] md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
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
    <section
      {...props}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b080c]/82 shadow-[0_24px_70px_rgba(0,0,0,0.38)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(169,133,95,0.07),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.025),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      <div className="relative z-10">{children}</div>
    </section>
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
