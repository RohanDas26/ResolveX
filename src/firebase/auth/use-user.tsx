
'use client';
import { User, onAuthStateChanged } from 'firebase/auth';
import { UserProfile } from '@/lib/types';
import { useAuth, useFirestore, useMemoFirebase } from '..';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useDoc } from '../firestore/use-doc';


interface AuthState {
  user: User | null;
  claims: any | null;
  isUserLoading: boolean;
  userError: Error | null;
  profile: UserProfile | null;
  isProfileLoading: boolean;
}

// This simplified hook only manages the Firebase Auth user object.
// Profile data is now fetched separately in the components that need it.
export function useUser(): Omit<AuthState, 'profile' | 'isProfileLoading'> {
  const auth = useAuth();
  const [authState, setAuthState] = useState<{ user: User | null; isLoading: boolean; error: Error | null; claims: any | null }>({
    user: null,
    isLoading: true,
    error: null,
    claims: null,
  });

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        setAuthState({ user, claims: tokenResult.claims, isLoading: false, error: null });
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
    claims: authState.claims,
    isUserLoading: authState.isLoading,
    userError: authState.error,
  };
}
    
