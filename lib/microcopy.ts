import mc from "@/content/microcopy.json";
type Dict = typeof mc;

export function t<K1 extends keyof Dict, K2 extends keyof Dict[K1] & string>(
  k1: K1, k2: K2
): string {
  return (mc as any)[k1]?.[k2] ?? "";
}