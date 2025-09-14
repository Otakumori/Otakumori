import { env } from "@/env";
import type { Result } from "./types";
import { safeAsync } from "./types";

export interface ClerkUser {
  id: string;
  email_addresses: Array<{
    id: string;
    email_address: string;
    verification: {
      status: string;
    };
  }>;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  created_at: number;
  updated_at: number;
}

export async function checkClerkHealth(): Promise<Result<boolean>> {
  return safeAsync(
    async () => {
      const response = await fetch(
        "https://api.clerk.com/.well-known/jwks.json",
        {
          cache: "no-store",
        }
      );
      
      return response.ok;
    },
    "CLERK_HEALTH_CHECK_ERROR",
    "Failed to check Clerk service health"
  );
}

export async function getClerkUser(userId: string): Promise<Result<ClerkUser>> {
  return safeAsync(
    async () => {
      const response = await fetch(
        `https://api.clerk.com/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Clerk API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    },
    "CLERK_FETCH_ERROR",
    `Failed to fetch user ${userId} from Clerk`
  );
}
