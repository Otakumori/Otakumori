export async function callGET(mod: any, init?: RequestInit) {
  const url = 'http://localhost/test';
  const req = new Request(url, { method: 'GET', ...init });
  const res = await mod.GET(req as any);
  const json = await (res).json();
  return { res, json };
}

export async function callPOST(mod: any, body?: any, init?: RequestInit) {
  const url = 'http://localhost/test';
  const req = new Request(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const res = await mod.POST(req as any);
  const json = await (res).json();
  return { res, json };
}
