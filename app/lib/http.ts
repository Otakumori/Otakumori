import { z } from 'zod';

export interface HttpOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  status: number;
  headers: Headers;
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request<T>(
    endpoint: string,
    options: HttpOptions = {},
    schema?: z.ZodType<T>,
  ): Promise<HttpResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';

    const headers = new Headers({
      ...this.defaultHeaders,
      ...options.headers,
    });

    // Add idempotency key if present in body
    if (options.body?.idempotencyKey) {
      headers.set('x-idempotency-key', options.body.idempotencyKey);
    }

    const config: any = {
      method,
      headers,
    };
    if (options.timeout) config.signal = AbortSignal.timeout(options.timeout);

    if (options.body && method !== 'GET') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const responseData = await this.parseResponse(response);

      if (!response.ok) {
        throw new HttpError(
          responseData.error || `HTTP ${response.status}`,
          response.status,
          response,
        );
      }

      // Validate response against schema if provided
      if (schema) {
        try {
          const validatedData = schema.parse(responseData);
          return {
            ok: true,
            data: validatedData,
            status: response.status,
            headers: response.headers,
          };
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            throw new HttpError(
              `Response validation failed: ${validationError.message}`,
              response.status,
              response,
            );
          }
          throw validationError;
        }
      }

      return {
        ok: true,
        data: responseData,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new HttpError('Network error', 0);
      }

      throw new HttpError(error instanceof Error ? error.message : 'Unknown error', 0);
    }
  }

  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        return { error: 'Invalid JSON response' };
      }
    }

    if (contentType?.includes('text/')) {
      return { data: await response.text() };
    }

    return { data: await response.arrayBuffer() };
  }

  // Convenience methods
  async get<T>(endpoint: string, schema?: z.ZodType<T>): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, schema);
  }

  async post<T>(endpoint: string, body: any, schema?: z.ZodType<T>): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body }, schema);
  }

  async put<T>(endpoint: string, body: any, schema?: z.ZodType<T>): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body }, schema);
  }

  async delete<T>(endpoint: string, schema?: z.ZodType<T>): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, schema);
  }

  async patch<T>(endpoint: string, body: any, schema?: z.ZodType<T>): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body }, schema);
  }

  // Set default headers
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  // Set auth token
  setAuthToken(token: string): void {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // Clear auth token
  clearAuthToken(): void {
    delete this.defaultHeaders.Authorization;
  }
}

// Export singleton instance
export const httpClient = new HttpClient();

// Export convenience functions
export const http = {
  get: <T>(endpoint: string, schema?: z.ZodType<T>) => httpClient.get<T>(endpoint, schema),

  post: <T>(endpoint: string, body: any, schema?: z.ZodType<T>) =>
    httpClient.post<T>(endpoint, body, schema),

  put: <T>(endpoint: string, body: any, schema?: z.ZodType<T>) =>
    httpClient.put<T>(endpoint, body, schema),

  delete: <T>(endpoint: string, schema?: z.ZodType<T>) => httpClient.delete<T>(endpoint, schema),

  patch: <T>(endpoint: string, body: any, schema?: z.ZodType<T>) =>
    httpClient.patch<T>(endpoint, body, schema),

  setAuthToken: (token: string) => httpClient.setAuthToken(token),
  clearAuthToken: () => httpClient.clearAuthToken(),
  setDefaultHeaders: (headers: Record<string, string>) => httpClient.setDefaultHeaders(headers),
};

// Game-specific API helpers
export const gameApi = {
  start: (gameKey: string, idempotencyKey: string) =>
    http.post('/api/v1/games/start', { gameKey, idempotencyKey }),

  finish: (runId: string, score: number, statsHash: string, meta?: any, idempotencyKey?: string) =>
    http.post('/api/v1/games/finish', { runId, score, statsHash, meta, idempotencyKey }),

  progress: (runId: string, checkpoint: string, data: any, idempotencyKey: string) =>
    http.post('/api/v1/games/progress', { runId, checkpoint, data, idempotencyKey }),

  stats: () => http.get('/api/v1/games/stats'),
  inventory: () => http.get('/api/v1/games/inventory'),
  coupons: () => http.get('/api/v1/games/coupons'),
  achievements: () => http.get('/api/v1/games/achievements'),
};

export const adminApi = {
  updateGameFlag: (gameKey: string, enabled: boolean, idempotencyKey: string) =>
    http.post('/api/v1/admin/games/flag', { gameKey, enabled, idempotencyKey }),

  updateDailyLimit: (newLimit: number, idempotencyKey: string) =>
    http.post('/api/v1/admin/games/daily-limit', { newLimit, idempotencyKey }),

  getGameFlags: () => http.get('/api/v1/admin/games/flags'),
  getDailyLimits: () => http.get('/api/v1/admin/games/daily-limits'),
};

// Generate a unique request ID for tracing
export function getRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
