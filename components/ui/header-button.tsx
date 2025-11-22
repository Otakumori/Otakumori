import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type HeaderButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: ReactNode;
};

export function HeaderButton({
  href,
  className,
  children,
  type = 'button',
  ...buttonProps
}: HeaderButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-lg border border-current px-4 py-2 text-sm font-medium',
    'bg-transparent text-text-link transition-all duration-300',
    'hover:text-text-link-hover hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={baseClasses} {...buttonProps}>
      {children}
    </button>
  );
}
