import { z } from "zod";
import { env } from "@/app/env";

const Flags = z.object({
  NEXT_PUBLIC_FEATURE_MINIGAMES: z.enum(["on","off"]).default("on"),
  NEXT_PUBLIC_FEATURE_RUNE: z.enum(["on","off"]).default("off"),
  NEXT_PUBLIC_FEATURE_SOAPSTONE: z.enum(["on","off"]).default("on"),
  NEXT_PUBLIC_FEATURE_PETALS: z.enum(["on","off"]).default("on"),
  NEXT_PUBLIC_FEATURE_CURSOR_GLOW: z.enum(["on","off"]).default("on"),
  NEXT_PUBLIC_FEATURE_STARFIELD: z.enum(["on","off"]).default("on"),
});

export const flags = Flags.parse(process.env);
export const isOn = (v: "on" | "off") => v === "on";

// Convenience helpers
export const isMinigamesEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_MINIGAMES);
export const isRuneEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_RUNE);
export const isSoapstoneEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_SOAPSTONE);
export const isPetalsEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_PETALS);
export const isCursorGlowEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_CURSOR_GLOW);
export const isStarfieldEnabled = () => isOn(flags.NEXT_PUBLIC_FEATURE_STARFIELD);
