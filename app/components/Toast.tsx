'use client';

import React from 'react';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      {/* You can add a toast container here later */}
    </>
  );
};

export const useToast = () => {
  // Placeholder hook
  return {
    toast: ({ title, description }: { title: string; description?: string }) => {
      console.log('Toast:', title, description);
    },
  };
};

export const Toast = ({ title, description }: { title: string; description?: string }) => {
    return (
        <div style={{ border: '1px solid black', padding: '10px', margin: '10px' }}>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
        </div>
    );
}; 