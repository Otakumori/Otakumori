import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  /**
   * Optional action button/link in header
   */
  action?: ReactNode;
  /**
   * Custom title color (defaults to brand color #835D75)
   */
  titleColor?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * HTML id for accessibility
   */
  id?: string;
}

/**
 * Standardized section header component for homepage sections
 *
 * Features:
 * - Consistent styling across all sections
 * - Accessibility support (proper heading hierarchy)
 * - Responsive typography
 * - Optional action buttons
 * - Brand color consistency
 */
export function SectionHeader({
  title,
  description,
  action,
  titleColor,
  className,
  id,
}: SectionHeaderProps) {
  return (
    <header className={cn('mb-8', className)} id={id}>
      {/* Bordered Banner Style - matches new aesthetic */}
      <div className="border border-[var(--om-accent-gold)] bg-transparent py-4 text-center mb-6">
        <h2 className="text-2xl font-serif tracking-wide text-[var(--om-text-ivory)]">
          {title}
        </h2>
      </div>
      {(description || action) && (
        <div className="flex items-start justify-between gap-4">
          {description && (
            <p className="flex-1 text-center text-[var(--om-text-secondary)]">
              {description}
            </p>
          )}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
    </header>
  );
}
