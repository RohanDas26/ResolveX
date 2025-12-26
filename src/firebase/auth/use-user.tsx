
'use client';
import { User, onAuthStateChanged } from 'firebase/auth';
import { UserProfile } from '@/lib/types';
import { useAuth, useFirestore, useMemoFirebase } from '..';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc } from '../firestore/use-doc';


interface AuthState {
  user: User | null;
  claims: any | null;
  isUserLoading: boolean;
  userError: Error | null;
  profile: UserProfile | null;
  isProfileLoading: boolean;
}

export function useUser(): AuthState {
  const auth = useAuth();
  const firestore = useFirestore();
  const [authState, setAuthState] = useState<{ user: User | null; isLoading: boolean; error: Error | null; claims: any | null }>({
    user: null,
    isLoading: true,
    error: null,
    claims: null,
  });

  useEffect(() => {
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


  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authState.user) return null;
    return doc(firestore, 'users', authState.user.uid);
  }, [firestore, authState.user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  return {
    user: authState.user,
    claims: authState.claims,
    isUserLoading: authState.isLoading,
    userError: authState.error,
    profile,
    isProfileLoading,
  };
}

// Keep useAuthState for any components that might still reference it.
export const useAuthState = useUser;

    