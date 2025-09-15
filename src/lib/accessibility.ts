// Accessibility utilities and helpers

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getMotionVariants() {
  const reducedMotion = prefersReducedMotion();

  return {
    // Fade in animation
    fadeIn: {
      initial: reducedMotion ? {} : { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: reducedMotion ? {} : { duration: 0.6, ease: 'easeOut' },
    },

    // Scale animation
    scale: {
      initial: reducedMotion ? {} : { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: reducedMotion ? {} : { duration: 0.4, ease: 'easeOut' },
    },

    // Slide in from left
    slideLeft: {
      initial: reducedMotion ? {} : { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      transition: reducedMotion ? {} : { duration: 0.5, ease: 'easeOut' },
    },

    // Slide in from right
    slideRight: {
      initial: reducedMotion ? {} : { x: 20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      transition: reducedMotion ? {} : { duration: 0.5, ease: 'easeOut' },
    },

    // Hover effects
    hover: {
      scale: reducedMotion ? 1 : 1.05,
      transition: reducedMotion ? {} : { duration: 0.2 },
    },

    // Tap effects
    tap: {
      scale: reducedMotion ? 1 : 0.95,
      transition: reducedMotion ? {} : { duration: 0.1 },
    },
  };
}

// Focus management utilities
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown);

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

// ARIA utilities
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function announceToScreenReader(message: string) {
  if (typeof window === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Color contrast utilities
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Keyboard navigation utilities
export function handleKeyboardNavigation(
  event: KeyboardEvent,
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void,
) {
  switch (event.key) {
    case 'Enter':
    case ' ':
      onEnter?.();
      break;
    case 'Escape':
      onEscape?.();
      break;
    case 'ArrowUp':
      onArrowUp?.();
      break;
    case 'ArrowDown':
      onArrowDown?.();
      break;
    case 'ArrowLeft':
      onArrowLeft?.();
      break;
    case 'ArrowRight':
      onArrowRight?.();
      break;
  }
}
