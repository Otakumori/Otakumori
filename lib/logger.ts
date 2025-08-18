export function log(event: string, data?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), event, ...data };
  console.log(JSON.stringify(entry));
}
