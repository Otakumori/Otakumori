'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const AbyssContext = createContext();

export function AbyssProvider({ children }) {
  const { data: session, status } = useSession();
  const [petals, setPetals] = useState(0);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);

  useEffect(() => {
    if (session?.user) {
      // Fetch user data from your database
      // This is where you'd typically make an API call to get the user's petals, level, etc.
      // For now, we'll use placeholder data
      setPetals(100);
      setLevel(1);
      setExperience(0);
    }
  }, [session]);

  const value = {
    user: session?.user,
    isLoaded: status !== 'loading',
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
