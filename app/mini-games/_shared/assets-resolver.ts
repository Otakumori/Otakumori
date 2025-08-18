import manifest from "@/public/assets/manifest.json";
import roles from "@/assets-roles.json";

export function getAsset(gameKey: string, assetKey: string): string | null {
  const gameRoles = roles[gameKey as keyof typeof roles];
  if (!gameRoles) return null;
  
  const assetPath = gameRoles[assetKey as keyof typeof gameRoles];
  if (!assetPath) return null;
  
  // Parse the dot notation path (e.g., "bg.oakWoods" -> manifest.bg.oakWoods)
  const pathParts = assetPath.split(".");
  let current: any = manifest;
  
  for (const part of pathParts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }
  
  return typeof current === "string" ? current : null;
}
