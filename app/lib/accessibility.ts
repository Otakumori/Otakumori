// Accessibility utilities for Otaku-mori v0

// Screen reader only text utility
export function srOnly(text: string): string {
  return text;
}

// Generate unique IDs for form elements
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// ARIA live region announcements
export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Focus management utilities
/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => {
      // Filter out hidden elements
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    },
  );
}

/**
 * Trap focus within an element (for modals)
 * Returns cleanup function
 */
export function trapFocus(element: HTMLElement, returnFocusTo?: HTMLElement): () => void {
  const focusableElements = getFocusableElements(element);
  
  if (focusableElements.length === 0) {
    // No focusable elements, focus the container itself
    element.setAttribute('tabindex', '-1');
    element.focus();
    return () => {
      element.removeAttribute('tabindex');
      returnFocusTo?.focus();
    };
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Focus first element
  firstElement.focus();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
    returnFocusTo?.focus();
  };
}

// Skip link utility
export function createSkipLink(targetId: string, text: string = 'Skip to main content'): string {
  return `
    <a 
      href="#${targetId}" 
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-pink-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      onclick="document.getElementById('${targetId}').focus()"
    >
      ${text}
    </a>
  `;
}

// Color contrast utilities
/**
 * Calculate relative luminance of a color (0-1)
 * Based on WCAG 2.1 formula
 */
function getLuminance(color: string): number {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const [rs, gs, bs] = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param color1 - First color (hex format)
 * @param color2 - Second color (hex format)
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns true if meets WCAG AA (4.5:1 for normal, 3:1 for large)
 */
export function meetsWCAGAA(color1: string, color2: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// Motion preference utilities
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Keyboard navigation utilities
export function isKeyboardNavigation(): boolean {
  return document.body.classList.contains('keyboard-navigation');
}

export function enableKeyboardNavigation(): void {
  document.body.classList.add('keyboard-navigation');
}

export function disableKeyboardNavigation(): void {
  document.body.classList.remove('keyboard-navigation');
}

// Form validation utilities
export function validateFormField(
  value: string,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  },
): { isValid: boolean; message?: string } {
  if (rules.required && !value.trim()) {
    return { isValid: false, message: 'This field is required' };
  }

  if (rules.minLength && value.length < rules.minLength) {
    return { isValid: false, message: `Must be at least ${rules.minLength} characters` };
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return { isValid: false, message: `Must be no more than ${rules.maxLength} characters` };
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return { isValid: false, message: 'Invalid format' };
  }

  return { isValid: true };
}

// ARIA attributes utilities
export function getAriaAttributes(props: {
  label?: string;
  describedBy?: string;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {};

  if (props.label) attrs['aria-label'] = props.label;
  if (props.describedBy) attrs['aria-describedby'] = props.describedBy;
  if (props.expanded !== undefined) attrs['aria-expanded'] = props.expanded;
  if (props.selected !== undefined) attrs['aria-selected'] = props.selected;
  if (props.disabled !== undefined) attrs['aria-disabled'] = props.disabled;
  if (props.hidden !== undefined) attrs['aria-hidden'] = props.hidden;

  return attrs;
}

// Focus ring utilities
export function addFocusRing(element: HTMLElement): void {
  element.classList.add(
    'focus:ring-2',
    'focus:ring-pink-500',
    'focus:ring-offset-2',
    'focus:ring-offset-gray-900',
  );
}

// Error message utilities
export function createErrorMessage(id: string, message: string): string {
  return `
    <div 
      id="${id}" 
      class="text-red-400 text-sm mt-1" 
      role="alert" 
      aria-live="polite"
    >
      ${message}
    </div>
  `;
}

// Loading state utilities
export function createLoadingState(text: string = 'Loading...'): string {
  return `
    <div 
      class="flex items-center justify-center p-4" 
      aria-live="polite" 
      aria-label="${text}"
    >
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
      <span class="sr-only">${text}</span>
    </div>
  `;
}
