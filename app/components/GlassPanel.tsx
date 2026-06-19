import type { ComponentPropsWithoutRef } from 'react';

export default function GlassPanel({
  children,
  className = '',
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={`glass-panel rounded-2xl ${className}`} {...props}>
      {children}
    </div>
  );
}
