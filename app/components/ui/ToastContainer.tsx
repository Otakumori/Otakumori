'use client';

import { Toast, type ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div
      className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex flex-col gap-2 pointer-events-auto max-w-md">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}
