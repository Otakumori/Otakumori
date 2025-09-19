export async function callGET(mod: Record<string, unknown>, init?: RequestInit) {
  const url = "http://localhost/test";
  const req = new Request(url, { method: "GET", ...init });
  const handler = mod.GET as ((request: Request) => Promise<Response>) | undefined;
  if (!handler) {
    throw new Error("Module does not export GET handler");
  }
  const res = await handler(req);
  const json = await res.json();
  return { res, json };
}

export async function callPOST(mod: Record<string, unknown>, body?: unknown, init?: RequestInit) {
  const url = "http://localhost/test";
  const req = new Request(url, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: init?.cache ?? "default",
    credentials: init?.credentials ?? "same-origin",
    integrity: init?.integrity ?? "",
    keepalive: init?.keepalive ?? false,
    mode: init?.mode ?? "cors",
    redirect: init?.redirect ?? "follow",
    referrerPolicy: init?.referrerPolicy ?? "strict-origin-when-cross-origin",
    window: init?.window,
    priority: (init as any)?.priority,
    signal: init?.signal,
  });
  const handler = mod.POST as ((request: Request) => Promise<Response>) | undefined;
  if (!handler) {
    throw new Error("Module does not export POST handler");
  }
  const res = await handler(req);
  const json = await res.json();
  return { res, json };
}
