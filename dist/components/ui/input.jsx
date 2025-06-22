'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const react_1 = __importDefault(require('react'));
const Input = ({ variant = 'default', inputSize = 'md', className = '', ...props }) => {
  const baseStyles = 'rounded-lg transition focus:outline-none';
  const variants = {
    default: 'bg-white/80 border-2 border-pink-200 focus:border-pink-500 shadow-sm',
    outline: 'bg-transparent border-2 border-pink-500 focus:border-pink-600',
  };
  const sizes = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };
  return (
    <input
      className={`${baseStyles} ${variants[variant]} ${sizes[inputSize]} ${className}`}
      {...props}
    />
  );
};
exports.default = Input;
