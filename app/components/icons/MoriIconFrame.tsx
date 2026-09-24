import type { ReactNode } from 'react';

type MoriIconFrameProps = {
  children: ReactNode;
  className?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

export default function MoriIconFrame({
  children,
  className = '',
  label,
  size = 'md',
}: MoriIconFrameProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center text-current ${sizeClasses[size]} ${className}`}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      data-mori-icon-frame
    >
      {children}
    </span>
  );
}
