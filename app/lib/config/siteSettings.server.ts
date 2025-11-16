/**
 * Site Settings Server Helper
 * 
 * Manages DB-backed site settings (feature flags, configuration).
 * Server-side only - use from server components, API routes, server actions.
 */

import { db } from '@/app/lib/db';
import type { SiteSetting, Prisma } from '@prisma/client';

export interface SiteSettingValue {
  boolValue?: boolean;
  stringValue?: string;
  jsonValue?: Prisma.InputJsonValue;
}

/**
 * Get all site settings as a map
 */
export async function getSiteSettingsMap(): Promise<Record<string, SiteSetting>> {
  const settings = await db.siteSetting.findMany();
  return Object.fromEntries(settings.map((s) => [s.key, s]));
}

/**
 * Get a single site setting by key
 */
export async function getSiteSetting(key: string): Promise<SiteSetting | null> {
  return db.siteSetting.findUnique({
    where: { key },
  });
}

/**
 * Upsert a site setting
 */
export async function upsertSiteSetting(
  key: string,
  value: SiteSettingValue,
  updatedBy: string,
): Promise<SiteSetting> {
  return db.siteSetting.upsert({
    where: { key },
    create: {
      key,
      ...value,
      updatedBy,
    },
    update: {
      ...value,
      updatedBy,
    },
  });
}

/**
 * Delete a site setting (reverts to default)
 */
export async function deleteSiteSetting(key: string): Promise<void> {
  await db.siteSetting.delete({
    where: { key },
  });
}

