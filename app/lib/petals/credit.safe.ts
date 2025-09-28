interface PetalCollectionRequest {
  source: string;
  amount: number;
}

interface PetalCollectionResponse {
  ok: boolean;
  data?: {
    newBalance: number;
    collected: number;
  };
  error?: string;
}

interface PetalCreditOptions {
  source: string;
  amount: number;
  idempotencyKey?: string;
}

export class PetalCreditError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRateLimited?: boolean,
  ) {
    super(message);
    this.name = 'PetalCreditError';
  }
}

export class PetalCredit {
  private dailyCapReached = false;
  private pendingRequests = new Set<string>();

  async collect(options: PetalCreditOptions): Promise<number> {
    const { source, amount, idempotencyKey } = options;

    // Check if daily cap is reached
    if (this.dailyCapReached) {
      throw new PetalCreditError('Daily cap reached', 429, true);
    }

    // Generate idempotency key if not provided
    const key = idempotencyKey || this.generateIdempotencyKey();

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      throw new PetalCreditError('Request already pending');
    }

    this.pendingRequests.add(key);

    try {
      const response = await fetch('/api/v1/petals/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': key,
        },
        body: JSON.stringify({
          source,
          amount,
        } as PetalCollectionRequest),
      });

      const data: PetalCollectionResponse = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          this.dailyCapReached = true;
          throw new PetalCreditError('Daily cap reached', 429, true);
        }

        throw new PetalCreditError(data.error || 'Failed to collect petals', response.status);
      }

      if (!data.ok || !data.data) {
        throw new PetalCreditError(data.error || 'Invalid response');
      }

      return data.data.newBalance;
    } catch (error) {
      if (error instanceof PetalCreditError) {
        throw error;
      }
      throw new PetalCreditError(`Network error: ${error}`);
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  private generateIdempotencyKey(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `otm_${timestamp}_${random}`;
  }

  resetDailyCap(): void {
    this.dailyCapReached = false;
  }

  get isDailyCapReached(): boolean {
    return this.dailyCapReached;
  }
}

// Singleton instance
export const petalCredit = new PetalCredit();
