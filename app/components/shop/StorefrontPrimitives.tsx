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
      <p className="font-ui text-xs font-semibold uppercase tracking-[0.32em] text-pink-100/70">
        {eyebrow}
      </p>
      <h1 className="font-display mt-4 text-balance text-4xl font-semibold tracking-tight text-[#f7eadf] md:text-6xl">
        {title}
      </h1>
      {description ? (
        <p className="font-body mt-5 text-base leading-8 text-[#f5d6dc]/72 md:text-lg">
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
      className={`relative overflow-hidden rounded-[2rem] border border-pink-200/14 bg-[#120d17]/82 shadow-[0_24px_80px_rgba(0,0,0,0.36)] ring-1 ring-white/5 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,168,205,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.07),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-x-6 top-5 h-px bg-gradient-to-r from-transparent via-pink-100/28 to-transparent" />
      <div className="pointer-events-none absolute inset-x-6 bottom-5 h-px bg-gradient-to-r from-transparent via-pink-100/18 to-transparent" />
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
      className={`inline-flex min-h-[44px] items-center justify-center rounded-full border border-pink-100/25 bg-pink-300/14 px-5 py-2 text-sm font-semibold text-pink-50 shadow-[0_0_24px_rgba(244,114,182,0.12)] transition hover:border-pink-100/50 hover:bg-pink-300/22 ${className}`}
    >
      {children}
    </span>
  );
}
