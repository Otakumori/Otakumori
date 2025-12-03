// DEPRECATED: This component is a duplicate. Use app\components\components\admin\QuickActions.tsx instead.
import { logger } from '@/app/lib/logger';
import React, { useEffect, useState } from 'react';
import { PUBLIC_KEYS } from '@/constants.client';

const API_KEY = PUBLIC_KEYS.adminApiKey;

const QuickActions: React.FC = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/maintenance', {
          headers: { 'x-api-key': API_KEY || '' },
        });
        const data = await res.json();
        setMaintenance(!!data.maintenance);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error('Failed to fetch maintenance status:', undefined, undefined, error);
        setError('Failed to fetch maintenance status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const toggleMaintenance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY || '' },
        body: JSON.stringify({ maintenance: !maintenance }),
      });
      const data = await res.json();
      setMaintenance(!!data.maintenance);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to update maintenance status:', undefined, undefined, error);
      setError('Failed to update maintenance status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="rounded bg-white p-4 shadow">
        <h3 className="font-semibold">Quick Actions</h3>
        <div className="mt-2 flex flex-col gap-2">
          <button
            onClick={toggleMaintenance}
            disabled={loading}
            className={`rounded px-4 py-2 font-bold text-white ${maintenance ? 'bg-red-500' : 'bg-green-500'} transition`}
          >
            {maintenance ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
          </button>
          <span className={`text-sm ${maintenance ? 'text-red-500' : 'text-green-500'}`}>
            Maintenance Mode is {maintenance ? 'ENABLED' : 'DISABLED'}
          </span>
          {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
