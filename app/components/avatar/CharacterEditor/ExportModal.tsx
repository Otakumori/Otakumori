'use client';

import React, { useState, useCallback } from 'react';
import { useToastContext } from '@/app/contexts/ToastContext';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { ExportStatusTracker } from './ExportStatusTracker';

export type ExportFormat = 'glb' | 'fbx' | 'obj' | 'png' | 'jpg' | 'svg';
export type ExportQuality = 'low' | 'medium' | 'high' | 'ultra';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  configuration: AvatarConfiguration;
  onExport: (format: ExportFormat, quality: ExportQuality, async: boolean) => Promise<{ jobId?: string; downloadUrl?: string }>;
}

const FORMAT_OPTIONS: Array<{ value: ExportFormat; label: string; description: string; icon: string }> = [
  { value: 'glb', label: 'GLB', description: 'Binary glTF (recommended)', icon: '📦' },
  { value: 'fbx', label: 'FBX', description: 'Autodesk FBX format', icon: '📁' },
  { value: 'obj', label: 'OBJ', description: 'Wavefront OBJ format', icon: '📄' },
  { value: 'png', label: 'PNG', description: 'High-quality image', icon: '🖼️' },
  { value: 'jpg', label: 'JPG', description: 'Compressed image', icon: '📸' },
  { value: 'svg', label: 'SVG', description: 'Vector 2D representation', icon: '🎨' },
];

const QUALITY_OPTIONS: Array<{ value: ExportQuality; label: string; description: string }> = [
  { value: 'low', label: 'Low', description: 'Fast, smaller file size' },
  { value: 'medium', label: 'Medium', description: 'Balanced quality and size' },
  { value: 'high', label: 'High', description: 'Best quality (recommended)' },
  { value: 'ultra', label: 'Ultra', description: 'Maximum quality, large file' },
];

export function ExportModal({ isOpen, onClose, configuration, onExport }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('glb');
  const [selectedQuality, setSelectedQuality] = useState<ExportQuality>('high');
  const [useAsync, setUseAsync] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const { error: showError, success } = useToastContext();

  const handleExport = useCallback(async () => {
    if (isExporting) return;

    setIsExporting(true);
    setJobId(null);
    try {
      const result = await onExport(selectedFormat, selectedQuality, useAsync);
      
      // If async and we have a job ID, track status
      if (useAsync && result.jobId) {
        setJobId(result.jobId);
        // Don't close modal yet, wait for status tracker
      } else {
        // Sync export completed
        onClose();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      showError(`Export failed: ${errorMessage}`);
      setIsExporting(false);
    }
  }, [selectedFormat, selectedQuality, useAsync, onExport, onClose, showError, isExporting]);

  const handleStatusComplete = useCallback((downloadUrl: string) => {
    // Trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `avatar-${Date.now()}.${selectedFormat}`;
    link.click();
    
    success(`${selectedFormat.toUpperCase()} file generated and downloaded successfully!`);
    setIsExporting(false);
    setJobId(null);
    onClose();
  }, [selectedFormat, success, onClose]);

  const handleStatusError = useCallback((error: string) => {
    showError(error);
    setIsExporting(false);
    setJobId(null);
  }, [showError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Export Avatar</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close export modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FORMAT_OPTIONS.map((format) => (
              <button
                key={format.value}
                type="button"
                onClick={() => setSelectedFormat(format.value)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedFormat === format.value
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{format.icon}</span>
                  <span className="font-semibold text-white">{format.label}</span>
                </div>
                <p className="text-xs text-gray-400">{format.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Quality Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Quality Preset
          </label>
          <div className="space-y-2">
            {QUALITY_OPTIONS.map((quality) => (
              <button
                key={quality.value}
                type="button"
                onClick={() => setSelectedQuality(quality.value)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  selectedQuality === quality.value
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">{quality.label}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{quality.description}</p>
                  </div>
                  {selectedQuality === quality.value && (
                    <span className="text-pink-500">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Async Option */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useAsync}
              onChange={(e) => setUseAsync(e.target.checked)}
              disabled={isExporting || !!jobId}
              className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-pink-500 focus:ring-pink-500 focus:ring-2 disabled:opacity-50"
            />
            <div>
              <span className="text-sm font-medium text-gray-300">
                Generate in background
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                For large files, generate in background and download when ready
              </p>
            </div>
          </label>
        </div>

        {/* Status Tracker for Async Exports */}
        {jobId && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <ExportStatusTracker
              jobId={jobId}
              onComplete={handleStatusComplete}
              onError={handleStatusError}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            disabled={isExporting && !jobId}
          >
            {jobId ? 'Close' : 'Cancel'}
          </button>
          {!jobId && (
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isExporting
                  ? 'bg-blue-400 cursor-not-allowed opacity-70'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <span>Export</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

