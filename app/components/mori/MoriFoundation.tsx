import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type MoriMaterial = 'paper' | 'lacquer' | 'parchment' | 'ash';
export type MoriContainment = 'none' | 'quiet' | 'raised';
export type MoriSurfaceElement = 'div' | 'section' | 'article';
export type MoriTexture = 'none' | 'grain';
export type MoriButtonVariant = 'primary' | 'secondary' | 'danger';
export type MoriStatusTone = 'neutral' | 'success' | 'error' | 'selected';

export function MoriSurface({
  as: Element = 'div',
  children,
  className,
  containment = 'none',
  material = 'paper',
  texture = 'none',
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: MoriSurfaceElement;
  children: ReactNode;
  containment?: MoriContainment;
  material?: MoriMaterial;
  texture?: MoriTexture;
}) {
  return (
    <Element
      {...props}
      className={cn('mori-foundation-surface', className)}
      data-mori-containment={containment}
      data-mori-material={material}
      data-mori-texture={texture}
    >
      {children}
    </Element>
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
  if (!label) {
    return (
      <div aria-hidden="true" className="mori-foundation-divider">
        <span className="mori-foundation-divider__seal" />
      </div>
    );
  }

  return (
    <div aria-label={label} className="mori-foundation-divider" role="separator">
      <span className="mori-foundation-divider__seal" />
      <span aria-hidden="true">{label}</span>
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
