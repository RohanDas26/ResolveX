'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, onIdTokenChanged, User, Auth } from 'firebase/auth';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import { useFirebaseApp } from '../provider';

interface AuthState {
  user: User | null;
  claims: any | null; // Can be typed more strictly
  isUserLoading: boolean;
  userError: Error | null;
  profile: UserProfile | null;
  isProfileLoading: boolean;
}

export function useAuthState(auth: Auth): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<any | null>(null);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const [userError, setUserError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  
  const app = useFirebaseApp();
  const firestore = getFirestore(app);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsUserLoading(false);
    }, (error) => {
      setUserError(error);
      setIsUserLoading(false);
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        setClaims(tokenResult.claims);
      } else {
        setClaims(null);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [auth]);

  useEffect(() => {
    if (user && firestore) {
      setIsProfileLoading(true);
      const profileRef = doc(firestore, 'users', user.uid);
      const unsubscribeProfile = onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setIsProfileLoading(false);
      }, () => {
        setIsProfileLoading(false);
      });

      return () => unsubscribeProfile();
    } else {
      setProfile(null);
      setIsProfileLoading(false);
    }
  }, [user, firestore]);

  return { user, claims, isUserLoading, userError, profile, isProfileLoading };
}
