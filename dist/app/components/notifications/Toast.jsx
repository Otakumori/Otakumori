'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useToast = useToast;
exports.ToastProvider = ToastProvider;
exports.useToastHelpers = useToastHelpers;
const react_1 = require('react');
const lucide_react_1 = require('lucide-react');
const utils_1 = require('../../lib/utils');
const ToastContext = (0, react_1.createContext)(undefined);
function useToast() {
  const context = (0, react_1.useContext)(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
function ToastProvider({ children }) {
  const [toasts, setToasts] = (0, react_1.useState)([]);
  const addToast = toast => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    // Auto-dismiss after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };
  const removeToast = id => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  const clearToasts = () => {
    setToasts([]);
  };
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}
function ToastContainer() {
  const { toasts, removeToast } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed right-4 top-4 z-50 max-w-sm space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
function ToastItem({ toast, onRemove }) {
  const [isVisible, setIsVisible] = (0, react_1.useState)(false);
  (0, react_1.useEffect)(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <lucide_react_1.CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <lucide_react_1.XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <lucide_react_1.Info className="h-5 w-5 text-blue-500" />;
    }
  };
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };
  return (
    <div
      className={(0, utils_1.cn)(
        'transform transition-all duration-300 ease-in-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div
        className={(0, utils_1.cn)(
          'flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm',
          getStyles()
        )}
      >
        {getIcon()}
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{toast.title}</h4>
          {toast.message && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{toast.message}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 rounded-md p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <lucide_react_1.X className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
// Convenience functions for common toast types
function useToastHelpers() {
  const { addToast } = useToast();
  return {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    custom: addToast,
  };
}
