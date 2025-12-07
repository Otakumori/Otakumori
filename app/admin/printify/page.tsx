'use client';

import { logger } from '@/app/lib/logger';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, Clock, Database } from 'lucide-react';

interface SyncStatus {
  type: string;
  success: boolean;
  productCount?: number;
  shopId?: string;
  error?: string;
  timestamp: string;
  eventId?: string;

export default function PrintifyAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<SyncStatus | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ healthy: boolean; shopId?: string } | null>(
    null,
  );

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/printify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test' }),
      });

      const result = await response.json();
      setHealthStatus({
        healthy: result.ok,
        shopId: result.data?.shopId,
      });
    } catch (error) {
      logger.error('Connection test failed', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const syncProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/printify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'products' }),
      });

      const result = await response.json();
      setLastSync({
        type: 'products',
        success: result.ok,
        productCount: result.data?.productCount,
        timestamp: result.data?.timestamp,
      });
    } catch (error) {
      logger.error('Sync failed', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      setLastSync({
        type: 'products',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/printify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'manual' }),
      });

      const result = await response.json();
      setLastSync({
        type: 'manual',
        success: result.ok,
        eventId: result.data?.eventId,
        timestamp: result.data?.timestamp,
      });
    } catch (error) {
      logger.error('Manual sync failed', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      setLastSync({
        type: 'manual',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Printify Management</h1>
          <p className="text-muted-foreground">
            Manage Printify product synchronization and API health
          </p>
        </div>
        <Badge variant={healthStatus?.healthy ? 'default' : 'destructive'}>
          {healthStatus?.healthy ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Connection Status
            </CardTitle>
            <CardDescription>Test your Printify API connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthStatus && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {healthStatus.healthy ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {healthStatus.healthy ? 'Connected' : 'Connection Failed'}
                  </span>
                </div>
                {healthStatus.shopId && (
                  <p className="text-xs text-muted-foreground">Shop ID: {healthStatus.shopId}</p>
                )}
              </div>
            )}
            <Button
              onClick={testConnection}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Connection
            </Button>
          </CardContent>
        </Card>

        {/* Sync Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Sync Controls
            </CardTitle>
            <CardDescription>Manually trigger product synchronization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button onClick={syncProducts} disabled={isLoading} className="w-full">
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Sync Products Now
              </Button>
              <Button
                onClick={triggerManualSync}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Trigger Background Sync
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Sync Status */}
      {lastSync && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Last Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {lastSync.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {lastSync.type === 'products' ? 'Product Sync' : 'Manual Sync'}
                </span>
                <Badge variant={lastSync.success ? 'default' : 'destructive'}>
                  {lastSync.success ? 'Success' : 'Failed'}
                </Badge>
              </div>

              {lastSync.productCount && (
                <p className="text-sm text-muted-foreground">
                  Products synced: {lastSync.productCount}
                </p>
              )}

              {lastSync.eventId && (
                <p className="text-xs text-muted-foreground">Event ID: {lastSync.eventId}</p>
              )}

              {lastSync.error && <p className="text-sm text-red-500">Error: {lastSync.error}</p>}

              <p className="text-xs text-muted-foreground">
                {new Date(lastSync.timestamp).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Schedule Info */}
      <Card>
        <CardHeader>
          <CardTitle>Automatic Sync Schedule</CardTitle>
          <CardDescription>
            Your Printify products are automatically synced on the following schedule:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Hourly sync:</span>
              <Badge variant="outline">Every hour</Badge>
            </div>
            <div className="flex justify-between">
              <span>Weekly full sync:</span>
              <Badge variant="outline">Mondays at 3 AM</Badge>
            </div>
            <div className="flex justify-between">
              <span>Daily inventory:</span>
              <Badge variant="outline">Daily at 2 AM</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
