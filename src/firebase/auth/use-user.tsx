
'use client';
import { User, onAuthStateChanged } from 'firebase/auth';
import { UserProfile } from '@/lib/types';
import { useAuth, useFirestore, useMemoFirebase } from '..';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc } from '../firestore/use-doc';

const MOCK_USER_ID = 'user_student_1';

const mockUser: User = {
  uid: MOCK_USER_ID,
  email: 'alex.doe@example.com',
  displayName: 'Alex Doe',
  photoURL: `https://api.dicebear.com/8.x/bottts/svg?seed=alex`,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'password',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
};


interface AuthState {
  user: User | null;
  claims: any | null;
  isUserLoading: boolean;
  userError: Error | null;
  profile: UserProfile | null;
  isProfileLoading: boolean;
}

// This hook now provides a real auth state that includes a mock user.
// In a real app, you would replace the mock user with the result of onAuthStateChanged.
export function useUser(): AuthState {
  const auth = useAuth();
  const firestore = useFirestore();
  const [authState, setAuthState] = useState<{ user: User | null; isLoading: boolean; error: Error | null; claims: any | null }>({
    user: null,
    isLoading: true,
    error: null,
    claims: null,
  });

  // For this demo, we'll always use a mock user, but the structure is here for real auth.
   useEffect(() => {
    setAuthState({ user: mockUser, isLoading: false, error: null, claims: { isAdmin: false }});
  }, []);

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
