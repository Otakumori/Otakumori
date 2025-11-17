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
  titleColor = '#835D75',
  className,
  id,
}: SectionHeaderProps) {
  return (
    <header 
      className={cn('mb-6', className)}
      id={id}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 
            className="text-2xl md:text-3xl font-bold"
            style={{ color: titleColor }}
          >
            {title}
          </h2>
          {description && (
            <p 
              className="mt-2"
              style={{ color: titleColor, opacity: 0.7 }}
            >
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}

