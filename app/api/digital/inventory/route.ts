import { NextResponse} from "next/server";
import { env} from "@/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const _data = { 
    items: [] as {id: string; name: string; qty: number; icon?: string}[] 
  };
  const res = NextResponse.json(_data);
  res.headers.set("Access-Control-Allow-Origin", env.NEXT_PUBLIC_SITE_URL || "*");
  return res;
}
