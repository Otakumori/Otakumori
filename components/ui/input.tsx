/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input: React.FC<InputProps> = ({
  variant = 'default',
  inputSize = 'md',
  className = '',
  ...props
}) => {
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

export default Input;
