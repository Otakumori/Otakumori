/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

const AbyssContext = createContext();

export function AbyssProvider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [petals, setPetals] = useState(0);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);

  useEffect(() => {
    if (isSignedIn && user) {
      // Fetch user data from your database
      // This is where you'd typically make an API call to get the user's petals, level, etc.
      // For now, we'll use placeholder data
      setPetals(100);
      setLevel(1);
      setExperience(0);
    }
  }, [isSignedIn, user]);

  const value = {
    user: user,
    isLoaded: isLoaded,
    petals,
    setPetals,
    level,
    setLevel,
    experience,
    setExperience,
  };

  return <AbyssContext.Provider value={value}>{children}</AbyssContext.Provider>;
}

export function useAbyss() {
  const context = useContext(AbyssContext);
  if (context === undefined) {
    throw new Error('useAbyss must be used within an AbyssProvider');
  }
  return context;
}
