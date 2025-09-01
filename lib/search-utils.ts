 
 
export function buildSearchPath(query: string): string {
  return `/search?q=${encodeURIComponent(query)}`;
}
