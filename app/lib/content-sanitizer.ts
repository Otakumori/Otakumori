/**
 * Content Sanitization Utility for Otaku-mori v0
 * Fixes apostrophes, quotes, and content normalization issues
 */
import React from 'react';

// Common problematic quote patterns to fix
const QUOTE_FIXES = [
  // Repeated quotes
  { pattern: /["""'''`']+/g, replacement: '"' },
  // Curly quotes to straight
  { pattern: /[""]/g, replacement: '"' },
  { pattern: /['']/g, replacement: "'" },
  // Multiple apostrophes
  { pattern: /''+/g, replacement: "'" },
  // Fix common apostrophe issues
  { pattern: /(\w)'s/g, replacement: "$1's" }, // possessives
  { pattern: /(\w)n't/g, replacement: "$1n't" }, // contractions
  { pattern: /What're ya buyin'/g, replacement: "What're ya buyin'?" }, // specific search placeholder
];

/**
 * Sanitize text content to fix quote and apostrophe issues
 */
export function sanitizeContent(content: string): string {
  if (!content || typeof content !== 'string') return content;

  let sanitized = content;

  // Apply all quote fixes
  for (const fix of QUOTE_FIXES) {
    sanitized = sanitized.replace(fix.pattern, fix.replacement);
  }

  // Remove extra whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * Sanitize React children recursively
 */
export function sanitizeReactContent(content: any): any {
  if (typeof content === 'string') {
    return sanitizeContent(content);
  }

  if (Array.isArray(content)) {
    return content.map(sanitizeReactContent);
  }

  if (content && typeof content === 'object' && content.props) {
    const sanitizedProps = { ...content.props };

    // Sanitize text props
    if (sanitizedProps.children) {
      sanitizedProps.children = sanitizeReactContent(sanitizedProps.children);
    }

    // Sanitize common text props
    ['title', 'alt', 'placeholder', 'aria-label'].forEach((prop) => {
      if (sanitizedProps[prop] && typeof sanitizedProps[prop] === 'string') {
        sanitizedProps[prop] = sanitizeContent(sanitizedProps[prop]);
      }
    });

    return { ...content, props: sanitizedProps };
  }

  return content;
}

/**
 * HOC to wrap components with content sanitization
 */
export function withContentSanitization<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
): React.ComponentType<T> {
  const SanitizedComponent = (props: T) => {
    const sanitizedProps = { ...props } as any;

    // Sanitize children if they exist
    if ('children' in sanitizedProps && sanitizedProps.children) {
      sanitizedProps.children = sanitizeReactContent(sanitizedProps.children);
    }

    // Use React.createElement to avoid JSX issues
    return React.createElement(Component, sanitizedProps);
  };

  return SanitizedComponent;
}

/**
 * Specific fixes for BlossomWare headers and other known issues
 */
export const SPECIFIC_CONTENT_FIXES = {
  blossomware: {
    title: 'BlossomWare Playlist',
    subtitle: 'Chaotic micro-sessions—keep your petal streak alive.',
  },
  search: {
    placeholder: "What're ya buyin'?",
  },
  footer: {
    copyright: (year: number) =>
      `© ${year} Otaku-mori. All petals accounted for. Don't go hollow.`,
    trademark: 'Otakumori ™ made with ',
  },
  soapstone: {
    cta: 'Leave a sign for fellow travelers',
    placeholder: 'Compose a sign…',
    button: 'Place Sign',
  },
};
