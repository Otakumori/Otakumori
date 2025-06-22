'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.Toast = exports.useToast = exports.ToastProvider = void 0;
const react_1 = __importDefault(require('react'));
const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      {/* You can add a toast container here later */}
    </>
  );
};
exports.ToastProvider = ToastProvider;
const useToast = () => {
  // Placeholder hook
  return {
    toast: ({ title, description }) => {
      console.log('Toast:', title, description);
    },
  };
};
exports.useToast = useToast;
const Toast = ({ title, description }) => {
  return (
    <div style={{ border: '1px solid black', padding: '10px', margin: '10px' }}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
};
exports.Toast = Toast;
