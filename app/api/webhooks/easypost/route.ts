import crypto from "crypto";
import { env } from "@/env.mjs";

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-ep-signature") || "";
  if (env.EASYPOST_WEBHOOK_SECRET) {
    const expected = crypto.createHmac("sha256", env.EASYPOST_WEBHOOK_SECRET).update(raw).digest("hex");
    if (sig && !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return new Response("bad sig", { status: 401 });
    }
  }
  // TODO: handle tracker.updated, delivered → update order status
  // "EasyPost webhook received:", raw
  return new Response("ok");
}
