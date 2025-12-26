'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthState, AuthState } from './use-user';
import { useAuth } from '../provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// Create the context with an undefined initial value
const AuthContext = createContext<AuthState | undefined>(undefined);

// Define the provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps parts of the app needing auth state.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth(); // Get the auth instance from the parent FirebaseProvider
  const authState = useAuthState(auth);

  return (
    <AuthContext.Provider value={authState}>
      <FirebaseErrorListener />
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
