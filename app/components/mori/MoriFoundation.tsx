import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type MoriMaterial = 'paper' | 'lacquer' | 'parchment' | 'ash';
export type MoriButtonVariant = 'primary' | 'secondary' | 'danger';
export type MoriStatusTone = 'neutral' | 'success' | 'error' | 'selected';

export function MoriSurface({
  children,
  className,
  material = 'paper',
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode; material?: MoriMaterial }) {
  return (
    <section
      {...props}
      className={cn('mori-foundation-surface', className)}
      data-mori-material={material}
    >
      {children}
    </section>
  );
}

export function MoriFrame({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn('mori-foundation-frame', className)}>
      {children}
    </div>
  );
}

export function MoriSectionHeader({
  eyebrow,
  title,
  description,
  headingLevel = 2,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  headingLevel?: 1 | 2 | 3;
  className?: string;
}) {
  const Heading = `h${headingLevel}` as const;

  return (
    <header className={className}>
      {eyebrow ? <p className="mori-foundation-eyebrow">{eyebrow}</p> : null}
      <Heading className="mori-foundation-heading">{title}</Heading>
      {description ? <p className="mori-foundation-description">{description}</p> : null}
    </header>
  );
}

export function MoriDivider({ label }: { label?: string }) {
  return (
    <div className="mori-foundation-divider" aria-hidden={label ? undefined : true}>
      <span className="mori-foundation-divider__seal" />
      {label ? <span>{label}</span> : null}
    </div>
  );
}

export function MoriButton({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: MoriButtonVariant }) {
  return (
    <button
      {...props}
      type={type}
      className={cn('mori-foundation-button', className)}
      data-mori-variant={variant}
    />
  );
}

export function MoriStatus({
  children,
  className,
  tone = 'neutral',
}: {
  children: ReactNode;
  className?: string;
  tone?: MoriStatusTone;
}) {
  return (
    <span className={cn('mori-foundation-status', className)} data-mori-tone={tone}>
      {children}
    </span>
  );
}
