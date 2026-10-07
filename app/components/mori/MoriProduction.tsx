import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type MoriConstruction =
  | 'raised'
  | 'inset'
  | 'channel'
  | 'lip'
  | 'recess'
  | 'overlay'
  | 'retained-glass'
  | 'seam'
  | 'hinge'
  | 'transition'
  | 'press';

export type MoriPageArchetype =
  | 'merchant'
  | 'commander'
  | 'discovery'
  | 'ritual'
  | 'game-threshold';

export type MoriArtifactFamily = 'commerce' | 'commander' | 'navigation' | 'game' | 'system';

export type MoriSystemStateKind =
  | 'loading'
  | 'locked'
  | 'unavailable'
  | 'success'
  | 'warning'
  | 'error'
  | 'empty';

type MoriElement = 'div' | 'section' | 'article' | 'main' | 'aside';

type MoriElementProps = HTMLAttributes<HTMLElement> & {
  as?: MoriElement;
  children?: ReactNode;
};

export function MoriConstructedSurface({
  as: Element = 'div',
  children,
  className,
  construction,
  ...props
}: MoriElementProps & { construction: MoriConstruction }) {
  return (
    <Element
      {...props}
      className={cn('mori-construction', className)}
      data-mori-construction={construction}
    >
      {children}
    </Element>
  );
}

export function MoriArchetype({
  as: Element = 'div',
  archetype,
  children,
  className,
  ...props
}: MoriElementProps & { archetype: MoriPageArchetype }) {
  return (
    <Element {...props} className={cn('mori-archetype', className)} data-mori-archetype={archetype}>
      {children}
    </Element>
  );
}

export function MoriArtifact({
  as: Element = 'div',
  children,
  className,
  family,
  ...props
}: MoriElementProps & { family: MoriArtifactFamily }) {
  return (
    <Element
      {...props}
      className={cn('mori-artifact', className)}
      data-mori-artifact-family={family}
    >
      {children}
    </Element>
  );
}

export function MoriSystemState({
  action,
  children,
  className,
  description,
  state,
  title,
}: {
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  description?: string;
  state: MoriSystemStateKind;
  title: string;
}) {
  const isAssertive = state === 'error' || state === 'warning';

  return (
    <section
      aria-busy={state === 'loading' || undefined}
      aria-live={isAssertive ? 'assertive' : 'polite'}
      className={cn('mori-system-state', className)}
      data-mori-system-state={state}
      role={isAssertive ? 'alert' : 'status'}
    >
      <span aria-hidden="true" className="mori-system-state__mark" />
      <div className="mori-system-state__copy">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
        {children}
      </div>
      {action ? <div className="mori-system-state__action">{action}</div> : null}
    </section>
  );
}
