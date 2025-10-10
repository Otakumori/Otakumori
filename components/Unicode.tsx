import React from 'react';
import { UNICODE, type UnicodeKey } from '@/lib/accessible-unicode';

interface UnicodeProps {
  /** The Unicode key */
  unicode: UnicodeKey;
  /** Optional CSS class name */
  className?: string;
  /** Optional title for tooltip */
  title?: string;
  /** Optional aria-label override */
  ariaLabel?: string;
  /** Optional onClick handler */
  onClick?: () => void;
  /** Whether this element is interactive */
  interactive?: boolean;
}

/**
 * Simple Unicode Component
 *
 * Renders black and white Unicode characters with proper accessibility.
 */
export const Unicode: React.FC<UnicodeProps> = ({
  unicode,
  className = '',
  title,
  ariaLabel,
  onClick,
  interactive = false,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (interactive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.();
    }
  };

  // Use button element for interactive unicode, span for static
  if (interactive) {
    return (
      <button
        type="button"
        aria-label={ariaLabel || title || unicode.replace(/_/g, ' ').toLowerCase()}
        className={`unicode inline-flex items-center justify-center bg-transparent border-0 p-0 ${className}`.trim()}
        title={title}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        style={{ cursor: 'pointer' }}
      >
        {UNICODE[unicode]}
      </button>
    );
  }

  return (
    <span
      aria-label={ariaLabel || title || unicode.replace(/_/g, ' ').toLowerCase()}
      role="img"
      className={`unicode ${className}`.trim()}
      title={title}
    >
      {UNICODE[unicode]}
    </span>
  );
};

export default Unicode;
