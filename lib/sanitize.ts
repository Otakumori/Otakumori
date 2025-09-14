export function stripTags(input: string): string {
  // Remove any HTML tags
  return input.replace(/<[^>]*>/g, '');
}

export function normalizeText(input: string): string {
  // Collapse whitespace and trim
  return input.replace(/[ \t\n\r]+/g, ' ').trim();
}

export function sanitizeSoapstone(input: string): string {
  let t = stripTags(input);
  t = normalizeText(t);
  // Remove emojis (Extended Pictographic)
  t = t.replace(/[\p{Extended_Pictographic}]/gu, '');
  return t;
}

