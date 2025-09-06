'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { motionVariants } from '../motion/MotionProvider';

interface DialogContextType {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  toggleDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = useCallback(() => setIsOpen(true), []);
  const closeDialog = useCallback(() => setIsOpen(false), []);
  const toggleDialog = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <DialogContext.Provider value={{ isOpen, openDialog, closeDialog, toggleDialog }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogProps {
  children: ReactNode;
  trigger?: ReactNode;
  title?: string;
  description?: string;
  onClose?: () => void;
}

export function Dialog({ children, trigger, title, description, onClose }: DialogProps) {
  const { isOpen, openDialog, closeDialog } = useDialog();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    closeDialog();
    onClose?.();
  }, [closeDialog, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the dialog
      if (dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        if (firstElement) {
          firstElement.focus();
        }
      }
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  return (
    <>
      {trigger && (
        <button onClick={openDialog} className="focus-ring">
          {trigger}
        </button>
      )}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={motionVariants}
            initial="dialogBackdrop"
            animate="dialogBackdrop"
            exit="dialogBackdrop"
            className="fixed inset-0 z-50 dialog-backdrop"
            onClick={handleClose}
          >
            <motion.div
              ref={dialogRef}
              variants={motionVariants}
              initial="dialogPanel"
              animate="dialogPanel"
              exit="dialogPanel"
              className="glass-panel m-4 max-w-md mx-auto mt-20"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'dialog-title' : undefined}
              aria-describedby={description ? 'dialog-description' : undefined}
            >
              <div className="p-6">
                {title && (
                  <h2 id="dialog-title" className="text-lg font-semibold text-white mb-2">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="dialog-description" className="text-sm text-zinc-300 mb-4">
                    {description}
                  </p>
                )}
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface DialogActionsProps {
  children: ReactNode;
  className?: string;
}

export function DialogActions({ children, className = '' }: DialogActionsProps) {
  return (
    <div className={`flex gap-3 justify-end mt-6 ${className}`}>
      {children}
    </div>
  );
}
