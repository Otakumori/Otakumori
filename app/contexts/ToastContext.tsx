'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useToast } from '@/app/hooks/useToast';
import { ToastContainer } from '@/app/components/ui/ToastContainer';
import type { ToastType } from '@/app/components/ui/Toast';

interface ToastContextValue {
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  addToast: (message: string, type?: ToastType, duration?: number) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, removeToast, success, error, info, warning, addToast } = useToast();

  return (
    <ToastContext.Provider value={{ success, error, info, warning, addToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
}

