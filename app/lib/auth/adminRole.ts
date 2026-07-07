type ClerkClaimsLike =
  | {
      role?: unknown;
      metadata?: { role?: unknown } | null;
      public_metadata?: { role?: unknown } | null;
      publicMetadata?: { role?: unknown } | null;
      private_metadata?: { role?: unknown } | null;
    }
  | null
  | undefined;

export function getClerkMetadataRole(claims: unknown): string | null {
  const record = claims as ClerkClaimsLike;
  const role =
    record?.metadata?.role ??
    record?.public_metadata?.role ??
    record?.publicMetadata?.role ??
    record?.private_metadata?.role;

  return typeof role === 'string' ? role : null;
}

export function hasAdminRole(claims: unknown): boolean {
  return getClerkMetadataRole(claims) === 'admin';
}
