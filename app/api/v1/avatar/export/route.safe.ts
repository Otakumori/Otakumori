import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateRequestId } from '../../../../lib/request-id';
import { generateComprehensiveGLB, type ComprehensiveGLBOptions } from '@/app/lib/3d/comprehensive-glb-generator';
import { avatarConfigToCreatorConfig } from '@/app/lib/3d/character-config-bridge';
import { putBlobFile } from '@/app/lib/blob/client';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { inngest } from '@/inngest/client';
import { withRateLimit, rateLimitConfigs } from '@/app/lib/rateLimit';
import { trackError, trackEvent, EVENT_CATEGORIES } from '@/app/lib/monitoring';
import { AvatarExportRequestSchema, createApiError } from '@/app/lib/api-contracts';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimitConfigs.glbExport, async () => {
    const requestId = generateRequestId();
    let startTime: number | undefined;
    let exportQuality: string | undefined;
    let format: string | undefined;
    let asyncMode: boolean | undefined;
    let userId: string | undefined;

    try {
      const authResult = await auth();
      userId = authResult.userId || undefined;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required', requestId },
        { status: 401 },
      );
    }

    const body = await request.json();
    
    // Validate request body with Zod schema
    const validation = AvatarExportRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        createApiError(
          'VALIDATION_ERROR',
          'Invalid export request',
          requestId,
          validation.error.issues,
        ),
        { status: 400 },
      );
    }

    const { format: validatedFormat, quality: validatedQuality, async: validatedAsync, gameId: validatedGameId, includeAssets: validatedIncludeAssets } = validation.data;
    
    format = validatedFormat;
    exportQuality = validatedQuality || 'high';
    asyncMode = validatedAsync || false;
    const gameId = validatedGameId;
    const includeAssets = validatedIncludeAssets || false;

    startTime = Date.now();

    // Track export request for analytics
    trackEvent('avatar_export_requested', EVENT_CATEGORIES.USER, {
      format: format!,
      quality: exportQuality!,
      async: asyncMode!,
      gameId: gameId || undefined,
      userId: userId!,
    });

    // Log export request for analytics
    logger.info('Avatar export requested', undefined, {
      format,
      quality: exportQuality,
      includeAssets,
      gameId: gameId || undefined,
      userId,
      requestId,
    });

    // Get user's avatar configuration from AvatarConfiguration table
    const avatarConfigRecord = await db.avatarConfiguration.findFirst({
      where: { userId },
      include: {
        AvatarConfigurationPart: true,
        AvatarMorphTarget: true,
        AvatarMaterialOverride: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!avatarConfigRecord) {
      return NextResponse.json(
        { ok: false, error: 'No avatar configuration found', requestId },
        { status: 404 },
      );
    }

    // Get user info for filename
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found', requestId },
        { status: 404 },
      );
    }

    // Transform database result to AvatarConfiguration format (same as character/config route)
    const cfg = avatarConfigRecord.configurationData as any;
    const avatarConfig: AvatarConfiguration = {
      id: avatarConfigRecord.id,
      userId: avatarConfigRecord.userId,
      baseModel: cfg?.baseModel || 'female',
      parts: avatarConfigRecord.AvatarConfigurationPart.reduce(
        (acc, p) => {
          acc[p.partType] = p.partId;
          return acc;
        },
        {} as Record<string, string>,
      ),
      morphTargets: avatarConfigRecord.AvatarMorphTarget.reduce(
        (acc, mt) => {
          acc[mt.targetName] = mt.value;
          return acc;
        },
        {} as Record<string, number>,
      ),
      materialOverrides: avatarConfigRecord.AvatarMaterialOverride.reduce(
        (acc, mo) => {
          acc[mo.slot] = {
            type: mo.type,
            value: mo.value,
            opacity: mo.opacity,
          };
          return acc;
        },
        {} as Record<string, any>,
      ),
      contentRating: cfg?.contentRating || 'sfw',
      showNsfwContent: cfg?.showNsfwContent || false,
      ageVerified: cfg?.ageVerified || false,
      defaultAnimation: cfg?.defaultAnimation || 'idle',
      idleAnimations: cfg?.idleAnimations || ['idle'],
      allowExport: cfg?.allowExport !== false,
      exportFormat: (avatarConfigRecord.exportFormat as 'glb' | 'fbx' | 'gltf') || 'glb',
      createdAt: avatarConfigRecord.createdAt,
      updatedAt: avatarConfigRecord.updatedAt,
    };

    // If async is true, trigger background job and return immediately
    if (body.async && format === 'glb') {
      try {
        await inngest.send({
          name: 'avatar/glb.generate',
          data: {
            userId,
            avatarConfigId: avatarConfig.id,
            format: 'glb',
            quality: exportQuality || 'high',
            gameId: gameId || undefined,
            includeOutfit: true,
            includeExtras: false,
            includeMakeup: false,
            includeVFX: false,
            celShaded: false,
          },
        });

        // Generate a job ID from requestId for tracking
        const jobId = requestId;

        logger.info('GLB generation job triggered', undefined, {
          userId,
          avatarConfigId: avatarConfig.id,
          format,
          quality: exportQuality || 'high',
          jobId,
        });

        // Return job ID for internal tracking only (not exposed in UI)
        // Status is checked automatically by the client component
        return NextResponse.json({
          ok: true,
          data: {
            jobId, // Internal tracking only - not shown to user
            jobStatus: 'queued',
            message: 'GLB generation started in background. Your file will be ready shortly.',
            format,
            quality: exportQuality || 'high',
          },
          requestId, // Only in response envelope for logging/debugging
        });
      } catch (error) {
        logger.error('Failed to trigger GLB generation job:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        // Fall through to synchronous generation
      }
    }

    // Generate export based on format
    let exportData;

    const finalQuality = exportQuality || 'high';
    
    switch (format) {
      case 'glb': {
        exportData = await generateGLBExport(avatarConfig, finalQuality, gameId);
        break;
      }
      case 'fbx':
        exportData = await generateFBXExport(avatarConfig, finalQuality);
        break;
      case 'obj':
        exportData = await generateOBJExport(avatarConfig, finalQuality);
        break;
      case 'png':
        exportData = await generatePNGExport(avatarConfig, finalQuality);
        break;
      case 'jpg':
        exportData = await generateJPGExport(avatarConfig, finalQuality);
        break;
      case 'svg':
        exportData = await generateSVGExport(avatarConfig);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Upload to blob storage and create download URL
    const downloadUrl = await createDownloadUrl(exportData, format, user.username, userId);

    const duration = startTime ? Date.now() - startTime : 0;
    const fileSizeMB = exportData.size / (1024 * 1024);

    // Track successful export with performance metrics
    trackEvent('avatar_export_completed', EVENT_CATEGORIES.USER, {
      format: format!,
      quality: finalQuality,
      duration,
      fileSizeMB: Math.round(fileSizeMB * 100) / 100,
      async: false,
      gameId: gameId || undefined,
      userId: userId!,
    });

    logger.info('Avatar export completed', undefined, {
      format,
      quality: finalQuality,
      duration,
      fileSizeMB,
      userId,
      requestId,
    });

    return NextResponse.json({
      ok: true,
      data: {
        downloadUrl,
        format,
        quality: finalQuality,
        size: exportData.size,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      requestId,
    });
    } catch (error) {
      const duration = startTime ? Date.now() - startTime : 0;
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      // Track export failure with context
      trackError(errorObj, {
        component: 'avatar-export',
        operation: 'export-generation',
        format: format || 'unknown',
        quality: exportQuality || 'unknown',
        async: asyncMode || false,
        duration,
        userId: userId || 'unknown',
        requestId,
      }, {
        export_format: format || 'unknown',
        export_quality: exportQuality || 'unknown',
        export_async: String(asyncMode || false),
      });

      logger.error('Avatar export error:', undefined, {
        format: format || 'unknown',
        quality: exportQuality || 'unknown',
        duration,
        userId: userId || 'unknown',
        requestId,
      }, errorObj);

      return NextResponse.json({ 
        ok: false, 
        error: error instanceof Error ? error.message : 'Export failed', 
        requestId 
      }, { status: 500 });
    }
  });
}

// Asset generation functions
async function generateGLBExport(
  config: AvatarConfiguration, 
  quality: string = 'high',
  gameId?: string
): Promise<{ buffer: Buffer; size: number; mimeType: string }> {
  try {
    logger.info('Generating GLB export with comprehensive generator', undefined, {
      quality,
      gameId: gameId || undefined,
      configId: config.id,
    });

    // Convert AvatarConfiguration to FullCharacterConfig
    const fullConfig = avatarConfigToCreatorConfig(config);

    // Prepare GLB generation options
    const glbOptions: ComprehensiveGLBOptions = {
      quality: quality as 'low' | 'medium' | 'high' | 'ultra',
      celShaded: true,
      allowPartialGeneration: true, // Continue even if optional parts fail
      maxFileSizeMB: 50, // Warn if file exceeds 50MB
      gameId: gameId, // Apply game-specific translation if provided
    };

    // Generate GLB using comprehensive generator
    const result = await generateComprehensiveGLB(fullConfig, glbOptions);

    if (!result.success || !result.glbBuffer) {
      const errorMessage = result.error || 'GLB generation failed';
      logger.error('GLB generation failed', undefined, {
        error: errorMessage,
        warnings: result.warnings?.length || 0,
      });
      throw new Error(errorMessage);
    }

    // Log warnings if any
    if (result.warnings && result.warnings.length > 0) {
      logger.warn('GLB generation completed with warnings', undefined, {
        warningCount: result.warnings.length,
        warnings: result.warnings.slice(0, 5), // Log first 5 warnings
      });
    }

    // Log performance metrics
    if (result.metadata?.performance) {
      logger.info('GLB generation performance', undefined, {
        totalTime: `${result.metadata.performance.totalTime.toFixed(2)}ms`,
        buildTime: `${result.metadata.performance.buildTime.toFixed(2)}ms`,
        exportTime: `${result.metadata.performance.exportTime.toFixed(2)}ms`,
        fileSize: `${(result.glbBuffer.byteLength / (1024 * 1024)).toFixed(2)}MB`,
        triangleCount: result.metadata.triangleCount,
      });
    }

    // Convert ArrayBuffer to Buffer for Node.js
    const buffer = Buffer.from(result.glbBuffer);

    return {
      buffer,
      size: buffer.byteLength,
      mimeType: 'model/gltf-binary',
    };
  } catch (error) {
    // Check if it's a Node.js/Three.js compatibility issue
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('WebGL') || errorMessage.includes('canvas') || errorMessage.includes('getContext')) {
      logger.warn('GLB generation failed due to server-side limitations', undefined, {
        error: errorMessage,
        suggestion: 'Server-side GLB generation may require additional setup. Consider client-side generation.',
      });
      throw new Error(
        'Server-side GLB generation is not fully supported in this environment. ' +
        'Please use client-side generation for now.'
      );
    }
    throw error;
  }
}

async function generateFBXExport(config: AvatarConfiguration, quality: string) {
  // TODO: Implement FBX export using comprehensive GLB generator + FBX converter
  logger.warn('FBX export not yet implemented', undefined, { 
    configId: config.id,
    quality,
  });
  const qualityMultiplier = quality === 'high' ? 2 : quality === 'low' ? 0.5 : 1;
  return {
    buffer: Buffer.from(`mock-fbx-data-${config.baseModel || 'female'}`),
    size: Math.floor(2 * 1024 * 1024 * qualityMultiplier),
    mimeType: 'application/octet-stream',
  };
}

async function generateOBJExport(config: AvatarConfiguration, quality: string) {
  // TODO: Implement OBJ export using comprehensive GLB generator + OBJ converter
  logger.warn('OBJ export not yet implemented', undefined, { 
    configId: config.id,
    quality,
  });
  const qualityMultiplier = quality === 'high' ? 2 : quality === 'low' ? 0.5 : 1;
  return {
    buffer: Buffer.from(`mock-obj-data-${config.baseModel || 'female'}`),
    size: Math.floor(512 * 1024 * qualityMultiplier),
    mimeType: 'text/plain',
  };
}

async function generatePNGExport(config: AvatarConfiguration, quality: string) {
  // TODO: Implement PNG export (render 3D model to 2D image)
  logger.warn('PNG export not yet implemented', undefined, { 
    configId: config.id,
    quality,
  });
  const qualityMultiplier = quality === 'high' ? 2 : quality === 'low' ? 0.5 : 1;
  return {
    buffer: Buffer.from(`mock-png-data-${config.baseModel || 'female'}`),
    size: Math.floor(256 * 1024 * qualityMultiplier),
    mimeType: 'image/png',
  };
}

async function generateJPGExport(config: AvatarConfiguration, quality: string) {
  // TODO: Implement JPG export (render 3D model to 2D image)
  logger.warn('JPG export not yet implemented', undefined, { 
    configId: config.id,
    quality,
  });
  const qualityMultiplier = quality === 'high' ? 2 : quality === 'low' ? 0.5 : 1;
  return {
    buffer: Buffer.from(`mock-jpg-data-${config.baseModel || 'female'}`),
    size: Math.floor(128 * 1024 * qualityMultiplier),
    mimeType: 'image/jpeg',
  };
}

async function generateSVGExport(config: AvatarConfiguration) {
  // TODO: Implement SVG export (2D representation of 3D model)
  logger.warn('SVG export not yet implemented', undefined, { 
    configId: config.id,
  });
  return {
    buffer: Buffer.from(`<svg><!-- Avatar SVG for ${config.baseModel || 'female'} --></svg>`),
    size: 64 * 1024,
    mimeType: 'image/svg+xml',
  };
}

async function createDownloadUrl(
  exportData: { buffer: Buffer; size: number; mimeType: string },
  format: string,
  username: string,
  userId: string
): Promise<string> {
  try {
    // Upload to Vercel Blob storage
    const timestamp = Date.now();
    const filename = `${username}-${timestamp}.${format}`;
    const blobKey = `exports/${userId}/${filename}`;

    logger.info('Uploading export to blob storage', undefined, {
      key: blobKey,
      size: exportData.size,
      format,
    });

    const { url } = await putBlobFile({
      key: blobKey,
      data: exportData.buffer,
      contentType: exportData.mimeType,
      access: 'public', // Public access for downloads
    });

    logger.info('Export uploaded successfully', undefined, {
      url,
      key: blobKey,
    });

    return url;
  } catch (error) {
    logger.error('Failed to upload export to blob storage', undefined, undefined, 
      error instanceof Error ? error : new Error(String(error)));
    
    // Fallback to data URL if blob upload fails (for small files)
    if (exportData.size < 5 * 1024 * 1024) { // 5MB limit for data URLs
      logger.warn('Using data URL fallback for export', undefined, {
        size: exportData.size,
      });
      const base64 = exportData.buffer.toString('base64');
      return `data:${exportData.mimeType};base64,${base64}`;
    }

    throw new Error('Failed to create download URL. File too large for fallback.');
  }
}
