// DEPRECATED: This component is a duplicate. Use app\components\ui\button.tsx instead.
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
      'bg-gradient-to-r from-primary to-accent text-white hover:from-primary-hover hover:to-accent-hover shadow-lg',
    secondary:
      'bg-glass-bg border border-glass-border text-text-primary hover:bg-glass-bg-hover hover:border-border-hover shadow-lg',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'bg-transparent text-primary hover:bg-white/5',
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
