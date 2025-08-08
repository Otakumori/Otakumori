import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-lg font-bold transition focus:outline-none';
  const variants = {
    primary:
      'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg',
    secondary:
      'bg-gradient-to-r from-blue-400 to-indigo-400 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg',
    outline: 'border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white',
    ghost: 'bg-transparent text-pink-500 hover:bg-pink-100 dark:hover:bg-pink-900/20',
  };
  const sizes = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
