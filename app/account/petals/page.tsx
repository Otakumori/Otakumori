import LedgerClient from "./ui/LedgerClient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

export default async function Page() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { petalBalance: true },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Petals</h1>
      <p className="text-neutral-600 mt-1">Current balance: <b>{user?.petalBalance ?? 0}</b></p>
      <div className="mt-6">
        <LedgerClient />
      </div>
    </main>
  );
}
