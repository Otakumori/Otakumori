// DEPRECATED: This component is a duplicate. Use app\components\ui\select.tsx instead.
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'outline';
  selectSize?: 'sm' | 'md' | 'lg';
}

const Select: React.FC<SelectProps> = ({
  children,
  variant = 'default',
  selectSize = 'md',
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
    <select
      className={`${baseStyles} ${variants[variant]} ${sizes[selectSize]} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

export default Select;
