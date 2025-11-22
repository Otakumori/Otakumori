import { type ReactNode } from 'react';
import { HeaderButton } from '@/components/ui/header-button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

/**
 * Reusable empty state component for sections
 *
 * Features:
 * - Consistent styling across all empty states
 * - Optional action buttons
 * - Icon support
 * - Accessibility friendly
 */
export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="p-8 max-w-md mx-auto">
        {icon && <div className="mb-4 flex justify-center">{icon}</div>}
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <p className="text-gray-300 mb-6">{description}</p>
        {actionLabel && actionHref && <HeaderButton href={actionHref}>{actionLabel}</HeaderButton>}
        {onAction && (
          <button
            onClick={onAction}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
