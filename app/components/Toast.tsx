'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface ToastMessage {
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (message: ToastMessage) => void;
  clear: () => void;
  currentToast: ToastMessage | null;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null);

  const toast = useCallback((message: ToastMessage) => {
    setCurrentToast(message);
    // eslint-disable-next-line no-console
    console.log('Toast:', message.title, message.description);
  }, []);

  const clear = useCallback(() => setCurrentToast(null), []);

  const value = useMemo<ToastContextValue>(
    () => ({ toast, clear, currentToast }),
    [toast, clear, currentToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container reserved for future implementation */}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

export function Toast({ title, description }: ToastMessage) {
  return (
    <div className="m-4 rounded border border-black/10 bg-white p-4 shadow">
      <h3 className="font-semibold text-black">{title}</h3>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
}
