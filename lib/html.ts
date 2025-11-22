/**
 * Utilities for working with HTML content coming from external sources (Printify, CMS, etc.)
 */

const htmlEntityMap: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
};

function decodeEntities(input: string): string {
  return Object.entries(htmlEntityMap).reduce(
    (acc, [entity, value]) => acc.replace(new RegExp(entity, 'g'), value),
    input,
  );
}

/**
 * Strips all HTML tags and decodes a handful of common HTML entities.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  const withoutTags = html.replace(/<[^>]*>/g, ' ');
  const decoded = decodeEntities(withoutTags);
  return decoded.replace(/\s+/g, ' ').trim();
}

/**
 * Removes table markup (and its contents) from a block of HTML.
 */
export function removeHtmlTables(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<table[\s\S]*?<\/table>/gi, '');
}
