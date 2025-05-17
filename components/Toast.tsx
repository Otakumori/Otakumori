'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'achievement';
  icon?: string;
}

interface ToastContextType {
  showToast: (message: string, type: Toast['type'], icon?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'], icon?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className={`rounded-lg p-4 shadow-lg backdrop-blur-lg ${toast.type === 'success' ? 'bg-green-500/20 text-green-200' : ''} ${toast.type === 'error' ? 'bg-red-500/20 text-red-200' : ''} ${toast.type === 'info' ? 'bg-blue-500/20 text-blue-200' : ''} ${toast.type === 'achievement' ? 'bg-purple-500/20 text-purple-200' : ''} `}
            >
              <div className="flex items-center space-x-2">
                {toast.icon && <span className="text-xl">{toast.icon}</span>}
                <p>{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
