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
  const headers = new Headers(init?.headers);
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const requestInit: RequestInit = {
    ...init,
    method: "POST",
    headers,
  };

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body);
  }

  const req = new Request(url, requestInit);
  const handler = mod.POST as ((request: Request) => Promise<Response>) | undefined;
  if (!handler) {
    throw new Error("Module does not export POST handler");
  }
  const res = await handler(req);
  const json = await res.json();
  return { res, json };
}
