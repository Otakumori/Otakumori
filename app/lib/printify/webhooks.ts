import { env } from '@/env.mjs';

export interface PrintifyWebhook {
  id: string;
  url: string;
  topic: string;
  secret: string;
  created_at: string;
  }

export class PrintifyWebhookManager {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly shopId: string;
  private readonly userAgent: string;

  constructor() {
    const apiKey = env.PRINTIFY_API_KEY;
    const shopId = env.PRINTIFY_SHOP_ID;

    if (!apiKey) {
      throw new Error('PRINTIFY_API_KEY environment variable is required');
    }

    if (!shopId) {
      throw new Error('PRINTIFY_SHOP_ID environment variable is required');
    }

    this.apiKey = apiKey;
    this.shopId = shopId;
    this.baseUrl = 'https://api.printify.com/v1';
    this.userAgent = 'Otaku-mori/1.0.0 (Node.js)';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json;charset=utf-8',
      'User-Agent': this.userAgent,
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

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
          logger.warn('printify_webhook_rate_limit_429', undefined, {
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
   * List all webhooks for the shop
   * @returns Array of webhooks
   */
  async listWebhooks(): Promise<PrintifyWebhook[]> {
    try {
      const result = await this.makeRequest<{ data: PrintifyWebhook[] }>(
        `/shops/${this.shopId}/webhooks.json`,
      );
      return result.data || [];
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_webhooks_list_failed', undefined, {
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new webhook
   * @param url - Webhook URL to receive events
   * @param topic - Webhook topic (e.g., 'order:created', 'product:updated')
   * @returns Created webhook
   */
  async createWebhook(url: string, topic: string): Promise<PrintifyWebhook> {
    try {
      const { logger } = await import('@/app/lib/logger');
      logger.info('printify_webhook_creation_started', undefined, { url, topic });

      const result = await this.makeRequest<PrintifyWebhook>(
        `/shops/${this.shopId}/webhooks.json`,
        {
          method: 'POST',
          body: JSON.stringify({ url, topic }),
        },
      );

      logger.info('printify_webhook_created_success', undefined, {
        webhookId: result.id,
        url,
        topic,
      });

      return result;
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_webhook_creation_failed', undefined, {
        url,
        topic,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Update an existing webhook
   * @param webhookId - Webhook ID to update
   * @param updates - Partial webhook data to update
   * @returns Updated webhook
   */
  async updateWebhook(
    webhookId: string,
    updates: Partial<Pick<PrintifyWebhook, 'url' | 'topic'>>,
  ): Promise<PrintifyWebhook> {
    try {
      const { logger } = await import('@/app/lib/logger');
      logger.info('printify_webhook_update_started', undefined, { webhookId });

      const result = await this.makeRequest<PrintifyWebhook>(
        `/shops/${this.shopId}/webhooks/${webhookId}.json`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        },
      );

      logger.info('printify_webhook_updated_success', undefined, {
        webhookId: result.id,
      });

      return result;
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_webhook_update_failed', undefined, {
        webhookId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Delete a webhook
   * @param webhookId - Webhook ID to delete
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      const { logger } = await import('@/app/lib/logger');
      logger.info('printify_webhook_deletion_started', undefined, { webhookId });

      await this.makeRequest(`/shops/${this.shopId}/webhooks/${webhookId}.json`, {
        method: 'DELETE',
      });

      logger.info('printify_webhook_deleted_success', undefined, { webhookId });
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_webhook_deletion_failed', undefined, {
        webhookId,
        error: String(error),
      });
      throw error;
    }
  }
}

let _singleton: PrintifyWebhookManager | null = null;
export function getPrintifyWebhookManager(): PrintifyWebhookManager {
  if (!_singleton) _singleton = new PrintifyWebhookManager();
  return _singleton;
}

