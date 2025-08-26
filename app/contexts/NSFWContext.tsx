/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import React, { createContext, useContext, useState, useEffect } from 'react';

interface NSFWContextType {
  isNSFWAllowed: boolean;
  verifyAge: (age: number) => void;
  resetAge: () => void;
}

const NSFWContext = createContext<NSFWContextType | undefined>(undefined);

export const useNSFW = () => {
  const ctx = useContext(NSFWContext);
  if (!ctx) throw new Error('useNSFW must be used within NSFWProvider');
  return ctx;
};

export const NSFWProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNSFWAllowed, setIsNSFWAllowed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const allowed = localStorage.getItem('otakumori_nsfw_allowed');
    setIsNSFWAllowed(allowed === 'true');
  }, []);

  const verifyAge = (age: number) => {
    if (age >= 18) {
      setIsNSFWAllowed(true);
      localStorage.setItem('otakumori_nsfw_allowed', 'true');
      setShowModal(false);
    } else {
      setIsNSFWAllowed(false);
      localStorage.setItem('otakumori_nsfw_allowed', 'false');
      setShowModal(true);
    }
  };

  const resetAge = () => {
    setIsNSFWAllowed(false);
    localStorage.setItem('otakumori_nsfw_allowed', 'false');
    setShowModal(true);
  };

  return (
    <NSFWContext.Provider value={{ isNSFWAllowed, verifyAge, resetAge }}>
      {children}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-xs rounded-xl border border-pink-400/30 bg-[#2d2233] p-8 text-center shadow-lg">
            <h2 className="font-cormorant-garamond mb-4 text-xl text-pink-200">Age Verification</h2>
            <p className="mb-4 text-pink-100">
              You must be 18+ to access NSFW content. Please enter your age:
            </p>
            <input
              type="number"
              min={0}
              max={120}
              className="mb-4 w-20 rounded bg-pink-400/10 px-2 text-pink-100"
              onKeyDown={e => e.stopPropagation()}
              onChange={e => verifyAge(Number(e.target.value))}
            />
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 rounded bg-pink-400/20 px-4 py-2 font-bold text-pink-100 transition hover:bg-pink-400/40"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </NSFWContext.Provider>
  );
};
