import {
  type ApiResponse,
  createApiSuccess,
  createApiError,
  generateRequestId,
  SoapstoneCreateSchema,
  PraiseCreateSchema,
  WishlistToggleSchema,
  GameSaveCreateSchema,
  type PaginationParams,
  type PaginatedResponse,
} from './api-contracts';

// Base API client class
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/v1';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const requestId = generateRequestId();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return createApiError(
          data.error?.code || 'INTERNAL_ERROR',
          data.error?.message || 'Request failed',
          requestId,
          data.error?.details,
        );
      }

      return data as ApiResponse<T>;
    } catch (error) {
      console.error('API request failed:', error);
      return createApiError('INTERNAL_ERROR', 'Network error', requestId);
    }
  }

  // Soapstone API
  async getSoapstones(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return this.request(`/soapstone?${searchParams.toString()}`);
  }

  async createSoapstone(data: { body: string; idempotencyKey: string }): Promise<ApiResponse<any>> {
    const validation = SoapstoneCreateSchema.safeParse(data);
    if (!validation.success) {
      return createApiError(
        'VALIDATION_ERROR',
        'Invalid data',
        generateRequestId(),
        validation.error.issues,
      );
    }

    return this.request('/soapstone', {
      method: 'POST',
      body: JSON.stringify(validation.data),
      headers: {
        'Idempotency-Key': data.idempotencyKey,
      },
    });
  }

  // Praise API
  async sendPraise(data: {
    receiverId: string;
    idempotencyKey: string;
  }): Promise<ApiResponse<any>> {
    const validation = PraiseCreateSchema.safeParse(data);
    if (!validation.success) {
      return createApiError(
        'VALIDATION_ERROR',
        'Invalid data',
        generateRequestId(),
        validation.error.issues,
      );
    }

    return this.request('/praise', {
      method: 'POST',
      body: JSON.stringify(validation.data),
      headers: {
        'Idempotency-Key': data.idempotencyKey,
      },
    });
  }

  async getPraises(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return this.request(`/praise?${searchParams.toString()}`);
  }

  // Wishlist API
  async toggleWishlist(data: {
    productId: string;
    idempotencyKey: string;
  }): Promise<ApiResponse<any>> {
    const validation = WishlistToggleSchema.safeParse(data);
    if (!validation.success) {
      return createApiError(
        'VALIDATION_ERROR',
        'Invalid data',
        generateRequestId(),
        validation.error.issues,
      );
    }

    return this.request('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify(validation.data),
      headers: {
        'Idempotency-Key': data.idempotencyKey,
      },
    });
  }

  async getWishlist(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return this.request(`/wishlist?${searchParams.toString()}`);
  }

  // Game Saves API
  async saveGame(data: {
    gameId: string;
    slot: number;
    payload: any;
    idempotencyKey: string;
  }): Promise<ApiResponse<any>> {
    const validation = GameSaveCreateSchema.safeParse(data);
    if (!validation.success) {
      return createApiError(
        'VALIDATION_ERROR',
        'Invalid data',
        generateRequestId(),
        validation.error.issues,
      );
    }

    return this.request('/game-saves', {
      method: 'POST',
      body: JSON.stringify(validation.data),
      headers: {
        'Idempotency-Key': data.idempotencyKey,
      },
    });
  }

  async getGameSaves(gameId?: string): Promise<ApiResponse<{ saves: any[] }>> {
    const searchParams = new URLSearchParams();
    if (gameId) searchParams.set('gameId', gameId);

    return this.request(`/game-saves?${searchParams.toString()}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for convenience
export type { ApiResponse, PaginationParams, PaginatedResponse } from './api-contracts';
