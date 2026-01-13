/**
 * GLB File Cleanup Job
 * Removes old and orphaned GLB files from Vercel Blob storage
 */

import { inngest } from './client';
import { db } from '@/app/lib/db';
import { deleteBlobFile } from '@/app/lib/blob/client';
import { logger } from '@/app/lib/logger';

interface GLBCleanupStats {
  totalProcessed: number;
  deleted: number;
  skipped: number;
  errors: number;
  totalSizeFreed: number;
}

/**
 * Cleanup old GLB files that are no longer referenced
 * Runs weekly on Sundays at 5 AM (after cleanupOldData at 4 AM)
 */
export const cleanupOldGLBFiles = inngest.createFunction(
  {
    name: 'Cleanup Old GLB Files',
    id: 'cleanup-old-glb-files',
  },
  { cron: '0 5 * * 0' }, // Every Sunday at 5 AM
  async ({ step }) => {
    const stats: GLBCleanupStats = {
      totalProcessed: 0,
      deleted: 0,
      skipped: 0,
      errors: 0,
      totalSizeFreed: 0,
    };

    // Step 1: Find all AvatarConfigurations with GLB URLs
    const configsWithGLB = await step.run('find-configs-with-glb', async () => {
      const configs = await db.avatarConfiguration.findMany({
        where: {
          glbUrl: { not: null },
        },
        select: {
          id: true,
          userId: true,
          glbUrl: true,
          glbGeneratedAt: true,
          updatedAt: true,
        },
      });

      logger.info('Found avatar configs with GLB URLs', undefined, {
        count: configs.length,
      });

      return configs;
    });

    // Step 2: Check each GLB URL and delete if orphaned or old
    for (const config of configsWithGLB) {
      await step.run(`check-glb-${config.id}`, async () => {
        stats.totalProcessed++;

        if (!config.glbUrl) {
          stats.skipped++;
          return;
        }

        try {
          // Check if user still exists
          const userExists = await db.user.findUnique({
            where: { id: config.userId },
            select: { id: true },
          });

          // Check if config is still active (updated within last 90 days)
          const isRecent = config.updatedAt && 
            (Date.now() - new Date(config.updatedAt).getTime()) < (90 * 24 * 60 * 60 * 1000);

          // Delete if:
          // 1. User doesn't exist (orphaned)
          // 2. GLB is older than 180 days and config hasn't been updated in 90 days
          const shouldDelete = !userExists || 
            (config.glbGeneratedAt && 
             (Date.now() - new Date(config.glbGeneratedAt).getTime()) > (180 * 24 * 60 * 60 * 1000) &&
             !isRecent);

          if (shouldDelete) {
            try {
              await deleteBlobFile({ url: config.glbUrl });
              stats.deleted++;

              // Clear GLB URL from database
              await db.avatarConfiguration.update({
                where: { id: config.id },
                data: {
                  glbUrl: null,
                  glbGeneratedAt: null,
                },
              });

              logger.info('Deleted old GLB file', undefined, {
                configId: config.id,
                glbUrl: config.glbUrl,
                reason: !userExists ? 'orphaned' : 'old',
              });
            } catch (error) {
              stats.errors++;
              logger.error('Failed to delete GLB file', undefined, undefined, 
                error instanceof Error ? error : new Error(String(error)));
            }
          } else {
            stats.skipped++;
          }
        } catch (error) {
          stats.errors++;
          logger.error('Error checking GLB file', undefined, undefined,
            error instanceof Error ? error : new Error(String(error)));
        }
      });
    }

    // Step 3: Log cleanup statistics
    await step.run('log-cleanup-stats', async () => {
      logger.info('GLB cleanup completed', undefined, {
        totalProcessed: stats.totalProcessed,
        deleted: stats.deleted,
        skipped: stats.skipped,
        errors: stats.errors,
      });

      return stats;
    });

    return {
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    };
  },
);

