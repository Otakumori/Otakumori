import { env } from '@/env.mjs';

export interface PrintifyUpload {
  id: string;
  file_name: string;
  height: number;
  width: number;
  size: number;
  mime_type: string;
  preview_url: string;
  upload_time: string;
  }

export class PrintifyUploadService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly userAgent: string;

  constructor() {
    const apiKey = env.PRINTIFY_API_KEY;

    if (!apiKey) {
      throw new Error('PRINTIFY_API_KEY environment variable is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = 'https://api.printify.com/v1';
    this.userAgent = 'Otaku-mori/1.0.0 (Node.js)';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      Authorization: `Bearer ${this.apiKey}`,
      'User-Agent': this.userAgent,
      ...options.headers,
    };

    // Remove Content-Type for FormData (browser will set it with boundary)
    if (options.body instanceof FormData) {
      // FormData sets its own Content-Type with boundary
      delete (headers as Record<string, string>)['Content-Type'];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for uploads

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

          const { logger } = await import('@/app/lib/logger');
          logger.warn('printify_upload_rate_limit_429', undefined, {
            endpoint,
            retryAfter: waitTime,
          });

          await new Promise((resolve) => setTimeout(resolve, waitTime));
          return this.makeRequest<T>(endpoint, options);
        }

        throw new Error(`Printify API error (${response.status}): ${errorText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Upload an image to Printify
   * @param file - File or Buffer to upload
   * @param fileName - Name of the file
   * @returns Upload information including ID and preview URL
   */
  async uploadImage(file: File | Buffer, fileName: string): Promise<PrintifyUpload> {
    try {
      const { logger } = await import('@/app/lib/logger');
      logger.info('printify_upload_started', undefined, { fileName });

      const formData = new FormData();

      // Handle both File and Buffer
      if (file instanceof File) {
        formData.append('file', file, fileName);
      } else {
        // Convert Buffer to Blob - Buffer is compatible with BlobPart
        const blob = new Blob([file as BlobPart], { type: 'image/png' }); // Default to PNG, adjust if needed
        formData.append('file', blob, fileName);
      }

      const result = await this.makeRequest<PrintifyUpload>('/uploads.json', {
        method: 'POST',
        body: formData,
      });

      logger.info('printify_upload_success', undefined, {
        uploadId: result.id,
        fileName,
        size: result.size,
      });

      return result;
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_upload_failed', undefined, {
        fileName,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Get upload information by ID
   * @param uploadId - The upload ID from Printify
   * @returns Upload information
   */
  async getUpload(uploadId: string): Promise<PrintifyUpload> {
    try {
      return await this.makeRequest<PrintifyUpload>(`/uploads/${uploadId}.json`);
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_upload_fetch_failed', undefined, {
        uploadId,
        error: String(error),
      });
      throw error;
    }
  }
}

let _singleton: PrintifyUploadService | null = null;
export function getPrintifyUploadService(): PrintifyUploadService {
  if (!_singleton) _singleton = new PrintifyUploadService();
  return _singleton;
}

