import Image from 'next/image';
import Link from 'next/link';
import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/cn';

type Tone = 'default' | 'accent' | 'danger' | 'success' | 'warning';

const toneClasses: Record<Tone, string> = {
  default: 'border-[var(--mori-border)] text-[var(--mori-ivory)]',
  accent: 'border-[var(--mori-sakura)] text-[var(--mori-sakura-light)]',
  danger: 'border-red-300/45 text-red-200',
  success: 'border-emerald-300/45 text-emerald-200',
  warning: 'border-amber-300/45 text-amber-100',
};

export function MoriPage({ className, children, ...props }: ComponentPropsWithoutRef<'main'>) {
  return (
    <main className={cn('mori-page relative min-h-screen overflow-hidden', className)} {...props}>
      <div className="pointer-events-none absolute inset-0 mori-paper-texture" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </main>
  );
}

export function MoriContainer({ className, children, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)} {...props}>
      {children}
    </div>
  );
}

export function MoriPanel({
  as: Component = 'section',
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'section'> & { as?: 'section' | 'article' | 'aside' | 'div' }) {
  return (
    <Component className={cn('mori-panel', className)} {...props}>
      <div className="mori-panel__glow" aria-hidden="true" />
      <div className="mori-panel__inner">{children}</div>
    </Component>
  );
}

export function MoriFrame({ className, children, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('mori-frame', className)} {...props}>
      {children}
    </div>
  );
}

export function MoriCard({ className, children, ...props }: ComponentPropsWithoutRef<'article'>) {
  return (
    <article className={cn('mori-card', className)} {...props}>
      {children}
    </article>
  );
}

export function MoriEyebrow({ className, children, ...props }: ComponentPropsWithoutRef<'p'>) {
  return (
    <p className={cn('font-ui text-xs font-semibold uppercase tracking-[0.32em] text-[var(--mori-sakura-light)]/75', className)} {...props}>
      {children}
    </p>
  );
}

export function MoriDisplayHeading({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'h1'>) {
  return (
    <h1
      className={cn(
        'font-display text-balance text-4xl font-semibold tracking-tight text-[var(--mori-ivory)] md:text-6xl',
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function MoriSectionHeading({
  as: Component = 'h2',
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'h2'> & { as?: 'h1' | 'h2' | 'h3' }) {
  return (
    <Component
      className={cn(
        'font-display text-balance text-3xl font-semibold tracking-tight text-[var(--mori-ivory)] md:text-5xl',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function MoriBody({ className, children, ...props }: ComponentPropsWithoutRef<'p'>) {
  return (
    <p className={cn('font-body text-base leading-8 text-[var(--mori-parchment-muted)]', className)} {...props}>
      {children}
    </p>
  );
}

export function MoriMeta({ className, children, ...props }: ComponentPropsWithoutRef<'p'>) {
  return (
    <p className={cn('font-ui text-xs uppercase tracking-[0.24em] text-[var(--mori-taupe)]', className)} {...props}>
      {children}
    </p>
  );
}

export function MoriPrice({ className, children, ...props }: ComponentPropsWithoutRef<'p'>) {
  return (
    <p className={cn('font-display text-2xl font-semibold text-[var(--mori-sakura-light)]', className)} {...props}>
      {children}
    </p>
  );
}

export function MoriBadge({
  tone = 'default',
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'span'> & { tone?: Tone }) {
  return (
    <span className={cn('mori-badge', toneClasses[tone], className)} {...props}>
      {children}
    </span>
  );
}

export function MoriButton({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) {
  return (
    <button className={cn('mori-button', `mori-button--${variant}`, className)} {...props}>
      {children}
    </button>
  );
}

export function MoriLink({
  href,
  variant = 'primary',
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: 'primary' | 'secondary' }) {
  return (
    <Link href={href} className={cn('mori-button', `mori-button--${variant}`, className)} {...props}>
      {children}
    </Link>
  );
}

export function MoriLabel({ className, children, ...props }: ComponentPropsWithoutRef<'label'>) {
  return (
    <label className={cn('mori-label', className)} {...props}>
      {children}
    </label>
  );
}

export function MoriInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('mori-input', className)} {...props} />;
}

export function MoriSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('mori-input', className)} {...props} />;
}

export function MoriTextarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('mori-input min-h-28 resize-y', className)} {...props} />;
}

export function MoriField({
  label,
  htmlFor,
  description,
  error,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor: string;
  description?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <MoriLabel htmlFor={htmlFor}>{label}</MoriLabel>
      {children}
      {description ? <p className="text-xs text-[var(--mori-taupe)]">{description}</p> : null}
      {error ? <p className="text-sm text-red-200">{error}</p> : null}
    </div>
  );
}

export function MoriVariantOption({
  selected,
  unavailable,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  unavailable?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={unavailable || props.disabled}
      className={cn(
        'mori-variant-option',
        selected && 'mori-variant-option--selected',
        unavailable && 'mori-variant-option--unavailable',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function MoriImageFrame({
  src,
  alt,
  priority,
  sizes,
  mode = 'object-cover',
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  mode?: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={cn('mori-image-frame', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized
        className={cn(mode, 'transition-transform duration-500 group-hover:scale-[1.025]', imageClassName)}
      />
      <div className="pointer-events-none absolute inset-3 border border-[var(--mori-border-muted)]" />
    </div>
  );
}

export function MoriLoadingState({ label = 'Loading...', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('mori-state', className)} role="status" aria-live="polite">
      <span className="mori-loader" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function MoriEmptyState({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mori-state', className)}>
      <h2 className="font-display text-2xl font-semibold text-[var(--mori-ivory)]">{title}</h2>
      {description ? <p className="max-w-xl text-sm leading-7 text-[var(--mori-parchment-muted)]">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function MoriErrorState({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <MoriPanel className="p-8 text-center" role="alert">
      <MoriEmptyState title={title} description={description} action={action} />
    </MoriPanel>
  );
}

export function MoriUnavailableState({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mori-unavailable', className)} role="status">
      <MoriBadge tone="warning">Unavailable</MoriBadge>
      <h3 className="font-display text-xl font-semibold text-[var(--mori-ivory)]">{title}</h3>
      {description ? <p className="text-sm leading-7 text-[var(--mori-parchment-muted)]">{description}</p> : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function MoriAmbientPetals({
  count = 10,
  reduced = false,
  className,
}: {
  count?: number;
  reduced?: boolean;
  className?: string;
}) {
  const safeCount = Math.max(0, Math.min(count, 18));
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {Array.from({ length: safeCount }, (_, index) => {
        const style = {
          '--mori-petal-left': `${18 + ((index * 11) % 68)}%`,
          '--mori-petal-top': `${8 + ((index * 7) % 42)}%`,
          '--mori-petal-delay': `${(index % 8) * 0.7}s`,
          '--mori-petal-duration': `${reduced ? 0 : 12 + (index % 6) * 1.4}s`,
          '--mori-petal-drift': `${24 + (index % 6) * 5}vw`,
          '--mori-petal-fall': `${42 + (index % 7) * 6}vh`,
          '--mori-petal-rotate': `${index % 2 === 0 ? 90 + index * 7 : -90 - index * 7}deg`,
        } as CSSProperties;

        return <span key={index} className="mori-ambient-petal" style={style} />;
      })}
    </div>
  );
}
