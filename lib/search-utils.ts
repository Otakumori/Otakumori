/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
export function buildSearchPath(query: string): string {
  return `/search?q=${encodeURIComponent(query)}`;
}
