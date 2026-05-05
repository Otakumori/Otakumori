'use client';

import { useState, useRef } from 'react';
import { Camera, Video } from 'lucide-react';
import { logger } from '@/app/lib/logger';
import type * as THREE from 'three';

interface ExportToolsProps {
  sceneRef: React.MutableRefObject<THREE.Group | null>;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export function ExportTools({ sceneRef, canvasRef }: ExportToolsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const captureScreenshot = async () => {
    try {
      setIsCapturing(true);
      
      // Find the canvas element
      const canvas = canvasRef?.current || document.querySelector('canvas');
      if (!canvas) {
        alert('Canvas not found. Please wait for the 3D renderer to load.');
        return;
      }

      // Capture screenshot
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      // Open in new tab or download
      const link = document.createElement('a');
      link.download = `avatar-screenshot-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    } catch (error) {
      logger.error('Failed to capture screenshot:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      alert('Failed to capture screenshot. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      chunksRef.current = [];

      // Find the canvas element
      const canvas = canvasRef?.current || document.querySelector('canvas');
      if (!canvas) {
        alert('Canvas not found. Please wait for the 3D renderer to load.');
        setIsRecording(false);
        return;
      }

      // Get canvas stream
      const stream = canvas.captureStream(30); // 30 FPS

      // Create MediaRecorder
      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000, // 2.5 Mbps for reasonable quality/size
      };

      // Fallback to VP8 if VP9 not supported
      if (options.mimeType && !MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8';
      }

      // Fallback to default if VP8 not supported
      if (options.mimeType && !MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `avatar-recording-${Date.now()}.webm`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        chunksRef.current = [];
        setIsRecording(false);
      };

      // Record for 3-5 seconds
      mediaRecorder.start();
      
      // Stop after 4 seconds (reasonable size)
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      }, 4000);
    } catch (error) {
      logger.error('Failed to start recording:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      alert('Failed to start recording. Your browser may not support this feature.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={captureScreenshot}
        disabled={isCapturing}
        className="flex items-center gap-2 rounded-lg border border-pink-500/50 bg-pink-500/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Camera className="h-4 w-4" />
        {isCapturing ? 'Capturing...' : 'Screenshot'}
      </button>
      
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 rounded-lg border border-purple-500/50 bg-purple-500/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500/30"
        >
          <Video className="h-4 w-4" />
          Record (4s)
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500/30"
        >
          <Video className="h-4 w-4" />
          Stop
        </button>
      )}
    </div>
  );
}

