 

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type User, type AgeVerification } from '../app/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  verifyAge: (verification: AgeVerification) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    // Mock login
    setUser({
      id: '1',
      email,
      username: 'user',
      displayName: 'User',
      ageVerified: true,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        showNSFW: false,
        theme: 'light',
        notifications: {
          email: true,
          push: false,
        },
      },
    });
  };

  const logout = async () => {
    setUser(null);
  };

  const register = async (email: string, password: string, username: string) => {
    // Mock register
    setUser({
      id: '1',
      email,
      username,
      displayName: username,
      ageVerified: false,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        showNSFW: false,
        theme: 'light',
        notifications: {
          email: true,
          push: false,
        },
      },
    });
  };

  const verifyAge = async (verification: AgeVerification) => {
    // Mock age verification
  };

  useEffect(() => {
    setIsLoading(false);
  }, [false]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        verifyAge,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
