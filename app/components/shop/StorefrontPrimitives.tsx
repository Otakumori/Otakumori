import type { HTMLAttributes, ReactNode } from 'react';
import {
  MoriBody,
  MoriEyebrow,
  MoriPanel,
  MoriSectionHeading,
} from '@/app/components/mori';

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
      <MoriEyebrow>{eyebrow}</MoriEyebrow>
      <MoriSectionHeading as="h1" className="mt-4 md:text-6xl">
        {title}
      </MoriSectionHeading>
      {description ? <MoriBody className="mt-5 md:text-lg">{description}</MoriBody> : null}
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
    <MoriPanel {...props} className={className}>
      {children}
    </MoriPanel>
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
      className={`mori-button mori-button--primary px-5 py-2 text-sm ${className}`}
    >
      {children}
    </span>
  );
}
