'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getExportStatus } from './utils/export';

interface ExportStatusTrackerProps {
  jobId: string;
  onComplete: (downloadUrl: string) => void;
  onError: (error: string) => void;
  pollInterval?: number; // Milliseconds between polls
}

export function ExportStatusTracker({
  jobId,
  onComplete,
  onError,
  pollInterval = 3000, // Poll every 3 seconds
}: ExportStatusTrackerProps) {
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [message, setMessage] = useState<string>('Checking export status...');
  const [progress, setProgress] = useState<number>(0);

  const checkStatus = useCallback(async () => {
    try {
      const result = await getExportStatus(jobId);

      setStatus(result.status);
      setMessage(result.message || 'Processing export...');

      if (result.status === 'completed' && result.downloadUrl) {
        setProgress(100);
        onComplete(result.downloadUrl);
        return true; // Stop polling
      }

      if (result.status === 'failed') {
        setProgress(0);
        onError(result.error || 'Export failed');
        return true; // Stop polling
      }

      // Update progress based on status
      setProgress((prevProgress) => {
        if (result.status === 'processing') {
          return Math.min(prevProgress + 10, 90); // Increment gradually up to 90%
        } else if (result.status === 'pending') {
          return 20; // Starting progress
        }
        return prevProgress;
      });

      return false; // Continue polling
    } catch (error) {
      // Don't expose technical error details to user
      onError('Unable to check export status. Please try again or contact support.');
      return true; // Stop polling on error
    }
  }, [jobId, onComplete, onError]);

  useEffect(() => {
    if (!jobId) return;

    // Initial status check
    checkStatus();

    // Set up polling interval
    const interval = setInterval(async () => {
      const shouldStop = await checkStatus();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, pollInterval);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [jobId, pollInterval, checkStatus]);

  // Stop polling after 5 minutes (timeout)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (status !== 'completed' && status !== 'failed') {
        onError('Export timed out. Please try again or contact support.');
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(timeout);
  }, [status, onError]);

  return (
    <div className="space-y-3">
      {/* Status Message */}
      <div className="flex items-center gap-3">
        <div
          className={`w-4 h-4 rounded-full ${
            status === 'completed'
              ? 'bg-green-500'
              : status === 'failed'
                ? 'bg-red-500'
                : 'bg-blue-500 animate-pulse'
          }`}
        />
        <p className="text-sm text-gray-300">{message}</p>
      </div>

      {/* Progress Bar */}
      {(status === 'pending' || status === 'processing') && (
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Status Details */}
      <div className="text-xs text-gray-500">
        {status === 'pending' && 'Export job queued, waiting to start...'}
        {status === 'processing' && 'Generating your avatar file, this may take a minute...'}
        {status === 'completed' && '✓ Export completed successfully!'}
        {status === 'failed' && '✗ Export failed. Please try again.'}
      </div>
    </div>
  );
}

