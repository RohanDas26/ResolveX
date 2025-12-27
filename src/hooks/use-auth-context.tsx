
'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './use-toast';

// Define a minimal User-like type for the frontend simulation
interface SimulatedUser {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
}

interface AuthContextType {
  user: SimulatedUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SimulatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check localStorage for a "logged in" user on initial load
    try {
      const storedUser = localStorage.getItem('simulatedUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('simulatedUser');
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simulate a successful login
    const uid = 'simulated-uid-' + new Date().getTime();
    const simulatedUser: SimulatedUser = {
      displayName: 'Demo User',
      email: email,
      photoURL: `https://api.dicebear.com/8.x/bottts/svg?seed=${uid}`,
      uid: uid,
    };
    localStorage.setItem('simulatedUser', JSON.stringify(simulatedUser));
    setUser(simulatedUser);
    toast({ title: 'Sign In Successful', description: 'Welcome back! (Simulation)' });
    router.push('/map');
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Simulate a successful sign-up
     const uid = 'simulated-uid-' + new Date().getTime();
    const simulatedUser: SimulatedUser = {
      displayName: name,
      email: email,
      photoURL: `https://api.dicebear.com/8.x/bottts/svg?seed=${uid}`,
      uid: uid,
    };
    localStorage.setItem('simulatedUser', JSON.stringify(simulatedUser));
    setUser(simulatedUser);
    toast({ title: 'Sign Up Successful', description: 'Welcome! You are now logged in. (Simulation)' });
    router.push('/map');
  };

  const logout = async () => {
    localStorage.removeItem('simulatedUser');
    setUser(null);
    router.push('/');
  };

  const value = { user, isLoading, signIn, signUp, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
