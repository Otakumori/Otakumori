/**
 * Site Settings Server Helper
 *
 * Manages DB-backed site settings (feature flags, configuration).
 * Server-side only - use from server components, API routes, server actions.
 */

import { db } from '@/app/lib/db';
import { Prisma, type SiteSetting } from '@prisma/client';

export interface SiteSettingValue {
  boolValue?: boolean;
  stringValue?: string;
  jsonValue?: Prisma.InputJsonValue;
}

export function isMissingSiteSettingsSchemaError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P2021' || error.code === 'P2022')
  );
}

/**
 * Get all site settings as a map
 */
export async function getSiteSettingsMap(): Promise<Record<string, SiteSetting>> {
  try {
    const settings = await db.siteSetting.findMany();
    return Object.fromEntries(settings.map((s) => [s.key, s]));
  } catch (error) {
    if (isMissingSiteSettingsSchemaError(error)) return {};
    throw error;
  }
}

/**
 * Get a single site setting by key
 */
export async function getSiteSetting(key: string): Promise<SiteSetting | null> {
  try {
    return await db.siteSetting.findUnique({
      where: { key },
    });
  } catch (error) {
    if (isMissingSiteSettingsSchemaError(error)) return null;
    throw error;
  }
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
