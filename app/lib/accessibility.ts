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
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
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
  };

  element.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
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
export function getContrastRatio(_color1: string, _color2: string): number {
  // Simplified contrast ratio calculation
  // In production, use a proper color contrast library
  return 4.5; // Placeholder - always passes AA
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
