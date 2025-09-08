import { env } from "@/app/env";

export function requiredEnv(name: string): string {
  const v = env[name as keyof typeof env];
  if (!v || v.trim() === "") {
    const msg = `Missing required environment variable: ${name}`;
    if (env.NODE_ENV === "production") throw new Error(msg);
    console.warn(msg);
  }
  return v!;
}