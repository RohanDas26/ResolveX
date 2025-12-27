
'use client';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '..';
import { useEffect, useState } from 'react';

interface AuthState {
  user: User | null;
  claims: any | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export function useUser(): Omit<AuthState, 'claims'> {
  const auth = useAuth();
  const [authState, setAuthState] = useState<{ user: User | null; isLoading: boolean; error: Error | null; claims: any | null }>({
    user: null,
    isLoading: true,
    error: null,
    claims: null,
  });

  useEffect(() => {
    if (!auth) {
        setAuthState({ user: null, claims: null, isLoading: false, error: new Error("Firebase Auth is not initialized.") });
        return;
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthState({ user, claims: null, isLoading: false, error: null });
      } else {
        setAuthState({ user: null, claims: null, isLoading: false, error: null });
      }
    }, (error) => {
      setAuthState({ user: null, claims: null, isLoading: false, error });
    });

    return () => unsubscribe();
  }, [auth]);

  return {
    user: authState.user,
    isUserLoading: authState.isLoading,
    userError: authState.error,
  };
}
