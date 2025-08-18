import { auth, currentUser } from "@clerk/nextjs/server";

export async function isAdmin(): Promise<boolean> {
  const { userId } = auth();
  if (!userId) return false;
  
  // Check Clerk metadata for admin role
  // You can set this in Clerk Dashboard > Users > [User] > Metadata
  // Add: { "role": "admin" }
  try {
    const user = await currentUser();
    const metadata = user?.publicMetadata;
    return metadata?.role === "admin";
  } catch {
    return false;
  }
}

export async function getUserRole(): Promise<string | null> {
  const { userId } = auth();
  if (!userId) return null;
  
  try {
    const user = await currentUser();
    return (user?.publicMetadata?.role as string) || null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const { userId } = auth();
  if (!userId) return { ok: false as const, status: 401 as const };

  try {
    const user = await currentUser();
    const metadata = user?.publicMetadata;
    const isAdmin = metadata?.role === "admin";
    
    if (!isAdmin) return { ok: false as const, status: 403 as const };
    return { ok: true as const, userId };
  } catch {
    return { ok: false as const, status: 403 as const };
  }
}
