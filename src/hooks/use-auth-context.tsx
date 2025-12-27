
'use client';

import { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// This is a mock user. In a real app, this would come from your auth provider.
const MOCK_USER: UserProfile = {
  id: 'user_123',
  name: 'Demo User',
  email: 'demo@example.com',
  imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=user_123`,
  grievanceCount: 5, // Example count
};

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for a "logged in" state
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn) {
        setUser(MOCK_USER);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = () => {
    setIsLoading(true);
    localStorage.setItem('isLoggedIn', 'true');
    setUser(MOCK_USER);
    setIsLoading(false);
    router.push('/map'); // Redirect after login
  };

  const logout = () => {
    setIsLoading(true);
    localStorage.removeItem('isLoggedIn');
    setUser(null);
    setIsLoading(false);
    router.push('/'); // Redirect to home after logout
  };

  const value = { user, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
