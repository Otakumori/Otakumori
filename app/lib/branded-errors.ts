/**
 * Branded Error Messages
 * 
 * Provides Dark Souls/anime-themed error messages that match the site's aesthetic
 */

export interface BrandedErrorMessage {
  title: string;
  message: string;
  cta?: {
    label: string;
    href: string;
  };
}

export type ErrorType = 
  | '404' 
  | 'network' 
  | 'rate_limit' 
  | 'auth_required' 
  | 'forbidden' 
  | 'server_error' 
  | 'generic';

/**
 * Get branded error message based on error type
 */
export function getBrandedErrorMessage(
  errorType: ErrorType,
  context?: {
    section?: string;
    customMessage?: string;
  }
): BrandedErrorMessage {
  const { section, customMessage } = context || {};

  switch (errorType) {
    case '404':
      return {
        title: "You've gone hollow, traveler.",
        message: customMessage || "This path doesn't exist. The bonfire has faded.",
        cta: {
          label: 'Return to Home',
          href: '/',
        },
      };

    case 'network':
      return {
        title: 'The connection fades...',
        message: customMessage || 'Your link to the server has been severed. Try again, brave soul.',
        cta: {
          label: 'Try Again',
          href: section ? `/${section}` : '/',
        },
      };

    case 'rate_limit':
      return {
        title: 'You move too fast, traveler.',
        message: customMessage || 'Rest a moment before continuing your journey.',
        cta: {
          label: 'Return Home',
          href: '/',
        },
      };

    case 'auth_required':
      return {
        title: 'Sign in to leave your mark, wanderer.',
        message: customMessage || 'This realm requires authentication. Join us, traveler.',
        cta: {
          label: 'Sign In',
          href: '/sign-in',
        },
      };

    case 'forbidden':
      return {
        title: 'Access denied, traveler.',
        message: customMessage || 'This realm is forbidden to you. Perhaps another path?',
        cta: {
          label: 'Return Home',
          href: '/',
        },
      };

    case 'server_error':
      return {
        title: 'Something went wrong in the abyss...',
        message: customMessage || 'The server has lost its way. We shall restore it soon.',
        cta: {
          label: 'Return Home',
          href: '/',
        },
      };

    default:
      return {
        title: 'An unexpected error occurred.',
        message: customMessage || 'The path forward is unclear. Try again, traveler.',
        cta: {
          label: 'Return Home',
          href: '/',
        },
      };
  }
}

/**
 * Extract error type from error object or status code
 */
export function getErrorType(error: unknown, statusCode?: number): ErrorType {
  if (statusCode === 404) return '404';
  if (statusCode === 401) return 'auth_required';
  if (statusCode === 403) return 'forbidden';
  if (statusCode === 429) return 'rate_limit';
  if (statusCode && statusCode >= 500) return 'server_error';

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('rate limit') || message.includes('too many')) return 'rate_limit';
  }

  return 'generic';
}

