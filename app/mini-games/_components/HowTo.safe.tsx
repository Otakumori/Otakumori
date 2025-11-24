'use client';

import { useState, useEffect, useRef } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { trapFocus } from '@/app/lib/accessibility';

interface HowToProps {
  children: React.ReactNode;
  className?: string;
}

export default function HowTo({ children, className = '' }: HowToProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleModal = () => setIsOpen(!isOpen);
  const closeModal = () => setIsOpen(false);

  // Handle ESC key and focus trapping
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    // Trap focus within modal
    const cleanup = trapFocus(modalRef.current, buttonRef.current || undefined);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      cleanup();
    };
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Return focus to button when modal closes
  useEffect(() => {
    if (!isOpen) {
      buttonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleModal}
        aria-label="How to play"
        className={`
          inline-flex items-center justify-center
          w-8 h-8 rounded-full
          bg-pink-500/20 hover:bg-pink-500/30
          border border-pink-500/30 hover:border-pink-500/50
          text-pink-200 hover:text-pink-100
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${className}
        `}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="howto-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
            onKeyDown={(e) => e.key === 'Escape' && closeModal()}
            role="button"
            tabIndex={0}
            aria-label="Close modal"
          />

          {/* Modal */}
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto
                     bg-gray-900/95 backdrop-blur-lg
                     border border-white/20 rounded-2xl
                     shadow-2xl"
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 id="howto-title" className="text-xl font-semibold text-white">
                How to Play
              </h2>
              <button
                onClick={closeModal}
                aria-label="Close how-to modal"
                className="
                  p-2 rounded-full
                  hover:bg-white/10
                  text-gray-400 hover:text-white
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-pink-500
                "
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div
                className="prose prose-invert prose-pink max-w-none
                         prose-headings:text-white prose-headings:font-semibold
                         prose-p:text-gray-300 prose-p:leading-relaxed
                         prose-strong:text-pink-300 prose-strong:font-semibold
                         prose-ul:text-gray-300 prose-li:text-gray-300
                         prose-a:text-pink-400 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: children as string }}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-white/10">
              <button
                onClick={closeModal}
                className="
                  px-6 py-2
                  bg-pink-500 hover:bg-pink-600
                  text-white font-medium
                  rounded-lg
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900
                "
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
