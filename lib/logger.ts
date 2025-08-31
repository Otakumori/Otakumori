/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
export function log(event: string, data?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), event, ...data };
  console.log(JSON.stringify(entry));
}
