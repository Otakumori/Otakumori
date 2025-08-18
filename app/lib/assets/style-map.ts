// app/lib/style-map.ts
export type Vibe = "spicy-male" | "spicy-female" | "neutral";

export const avatarVibes: Record<string, Vibe> = {
  akira: "spicy-male",
  yumi: "spicy-female",
  test: "neutral"
};

export function getVibeForAvatar(avatar: string, override?: Vibe): Vibe {
  if (override) return override;
  const key = (avatar || "").toLowerCase().trim();
  return avatarVibes[key] ?? "neutral";
}
