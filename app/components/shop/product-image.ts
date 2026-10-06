/** Optimize known compatible sources without rejecting other catalogue-approved image hosts. */
export function canOptimizeProductImage(src: string): boolean {
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && !url.port && url.hostname.endsWith('.printify.com');
  } catch {
    return false;
  }
}
