'use client';

import { useEffect, useState, createContext } from 'react';
import supabase from '@/utils/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>;
};
