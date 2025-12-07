'use client';

import { logger } from '@/app/lib/logger';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';

interface SyncResult {
  success: boolean;
  count?: number;
  error?: string;
}

interface SyncResults {
  clerk: SyncResult;
  stripeCustomers: SyncResult;
  stripeProducts: SyncResult;
  printifyProducts: SyncResult;
}

export default function ExternalSyncPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SyncResults | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/v1/sync-external', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.ok) {
        setResults(data.data.results);
      } else {
        logger.error('Sync failed', undefined, undefined, new Error(String(data.error)));
      }
    } catch (error) {
      logger.error('Sync error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">External Data Sync</h1>

      <div className="mb-6">
        <Button
          onClick={handleSync}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          {isLoading ? 'Syncing...' : 'Sync All External Data'}
        </Button>
      </div>

      {results && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Sync Results</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h3 className="font-medium">Clerk Users</h3>
              <p className={results.clerk.success ? 'text-green-600' : 'text-red-600'}>
                {results.clerk.success
                  ? ` Synced ${results.clerk.count} users`
                  : ` Error: ${results.clerk.error}`}
              </p>
            </div>

            <div className="p-4 border rounded">
              <h3 className="font-medium">Stripe Customers</h3>
              <p className={results.stripeCustomers.success ? 'text-green-600' : 'text-red-600'}>
                {results.stripeCustomers.success
                  ? ` Synced ${results.stripeCustomers.count} customers`
                  : ` Error: ${results.stripeCustomers.error}`}
              </p>
            </div>

            <div className="p-4 border rounded">
              <h3 className="font-medium">Stripe Products</h3>
              <p className={results.stripeProducts.success ? 'text-green-600' : 'text-red-600'}>
                {results.stripeProducts.success
                  ? ` Synced ${results.stripeProducts.count} products`
                  : ` Error: ${results.stripeProducts.error}`}
              </p>
            </div>

            <div className="p-4 border rounded">
              <h3 className="font-medium">Printify Products</h3>
              <p className={results.printifyProducts.success ? 'text-green-600' : 'text-red-600'}>
                {results.printifyProducts.success
                  ? ` Synced ${results.printifyProducts.count} products`
                  : ` Error: ${results.printifyProducts.error}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
