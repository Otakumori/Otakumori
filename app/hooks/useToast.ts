'use client';

import { useState, useCallback } from 'react';
import type { ToastType } from '@/app/components/ui/Toast';

interface ToastData {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => addToast(message, 'success', duration),
    [addToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => addToast(message, 'error', duration),
    [addToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => addToast(message, 'info', duration),
    [addToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) => addToast(message, 'warning', duration),
    [addToast],
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}

