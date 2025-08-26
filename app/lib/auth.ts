/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { auth } from "@clerk/nextjs/server";

export function requireUserId() {
  const { userId } = auth();
  if (!userId) {
    const err = new Error("Unauthorized");
    // you can throw a NextResponse if you prefer; keeping it simple
    (err as any).status = 401;
    throw err;
  }
  return userId;
}
