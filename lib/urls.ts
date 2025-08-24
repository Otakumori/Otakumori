export function appUrl(path = "/") {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");
  return new URL(path, base).toString();
}
