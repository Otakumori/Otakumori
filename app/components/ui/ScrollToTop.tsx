'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling 300px
      setIsVisible(window.scrollY > 300);
    };

    // Check on mount
    toggleVisibility();

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-40 p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-[#080611]"
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
