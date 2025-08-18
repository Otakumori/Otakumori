export type LogCtx = { requestId?: string; route?: string; extra?: Record<string, unknown> };

function base(level: "info" | "warn" | "error" | "debug", msg: string, ctx?: LogCtx, data?: unknown) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    requestId: ctx?.requestId,
    route: ctx?.route,
    extra: ctx?.extra,
    data,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (level === "debug") console.debug(line);
  else console.log(line);
}

export const logger = {
  info: (msg: string, ctx?: LogCtx, data?: unknown) => base("info", msg, ctx, data),
  warn: (msg: string, ctx?: LogCtx, data?: unknown) => base("warn", msg, ctx, data),
  error: (msg: string, ctx?: LogCtx, data?: unknown) => base("error", msg, ctx, data),
  debug: (msg: string, ctx?: LogCtx, data?: unknown) => base("debug", msg, ctx, data),
};
