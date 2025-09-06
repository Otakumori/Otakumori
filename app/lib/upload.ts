import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { type NextRequest } from 'next/server';
import sharp from 'sharp';

export interface UploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const UPLOAD_CONFIGS = {
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth: 512,
    maxHeight: 512,
    quality: 85,
  },
  achievement: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/png', 'image/svg+xml'],
    maxWidth: 128,
    maxHeight: 128,
    quality: 90,
  },
  product: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80,
  },
  content: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 85,
  },
} as const;

export class UploadError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

export async function validateFile(file: File, config: UploadConfig): Promise<void> {
  // Check file size
  if (file.size > config.maxSize) {
    throw new UploadError(
      `File size exceeds maximum allowed size of ${config.maxSize / (1024 * 1024)}MB`,
      'FILE_TOO_LARGE',
    );
  }

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    throw new UploadError(
      `File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`,
      'INVALID_FILE_TYPE',
    );
  }
}

export async function processImage(buffer: Buffer, config: UploadConfig): Promise<Buffer> {
  let image = sharp(buffer);

  // Resize if dimensions are specified
  if (config.maxWidth || config.maxHeight) {
    image = image.resize(config.maxWidth, config.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to WebP for better compression
  if (config.quality) {
    image = image.webp({ quality: config.quality });
  }

  return image.toBuffer();
}

export async function saveFile(
  buffer: Buffer,
  filename: string,
  directory: string,
): Promise<string> {
  const uploadDir = join(process.cwd(), 'public', 'uploads', directory);

  // Create directory if it doesn't exist
  await mkdir(uploadDir, { recursive: true });

  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);

  return `/uploads/${directory}/${filename}`;
}

export function generateFilename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const base = prefix ? `${prefix}_` : '';

  return `${base}${timestamp}_${random}.${extension}`;
}

export async function handleFileUpload(
  request: NextRequest,
  config: UploadConfig,
  directory: string,
  prefix?: string,
): Promise<{ url: string; filename: string }> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new UploadError('No file provided', 'NO_FILE');
    }

    // Validate file
    await validateFile(file, config);

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer as ArrayBuffer);

    // Process image if it's an image file
    let processedBuffer: Buffer = buffer;
    if (file.type.startsWith('image/')) {
      processedBuffer = await processImage(buffer as Buffer, config);
    }

    // Generate filename
    const filename = generateFilename(file.name, prefix);

    // Save file
    const url = await saveFile(processedBuffer, filename, directory);

    return { url, filename };
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError('Failed to upload file', 'UPLOAD_FAILED');
  }
}

// Cloud storage integration (example with AWS S3)
export async function uploadToCloud(
  buffer: Buffer,
  filename: string,
  directory: string,
): Promise<string> {
  // This is a placeholder for cloud storage integration
  // In production, you would use AWS S3, Cloudinary, or similar

  // For now, we'll save locally and return the path
  return await saveFile(buffer, filename, directory);
}

// Cleanup function for removing old files
export async function cleanupOldFiles(
  directory: string,
  maxAge: number = 24 * 60 * 60 * 1000, // 24 hours
): Promise<void> {
  // This would clean up old temporary files
  // Implementation depends on your storage solution
  console.log(`Cleaning up old files in ${directory}`);
}

// Get file info
export async function getFileInfo(filepath: string): Promise<{
  size: number;
  type: string;
  dimensions?: { width: number; height: number };
}> {
  const fs = await import('fs/promises');
  const stats = await fs.stat(filepath);

  const info: any = {
    size: stats.size,
    type: 'unknown',
  };

  // Get image dimensions if it's an image
  if (filepath.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
    try {
      const metadata = await sharp(filepath).metadata();
      info.dimensions = {
        width: metadata.width,
        height: metadata.height,
      };
      info.type = metadata.format;
    } catch (error) {
      console.error('Failed to get image metadata:', error);
    }
  }

  return info;
}
