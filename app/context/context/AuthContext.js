/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useEffect, useState, createContext } from 'react';
import { useUser } from '@clerk/nextjs';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded) {
      setSession(user ? { user } : null);
    }
  }, [user, isLoaded]);

  return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>;
};
