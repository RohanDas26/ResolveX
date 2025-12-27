
'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const { auth, firestore } = initializeFirebase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    toast({ title: 'Sign In Successful', description: 'Welcome back!' });
    router.push('/map');
  };

  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (userCredential.user) {
        await updateProfile(userCredential.user, {
            displayName: name,
            photoURL: `https://api.dicebear.com/8.x/bottts/svg?seed=${userCredential.user.uid}`
        });

        // Create user profile in Firestore
        const userRef = doc(firestore, "users", userCredential.user.uid);
        await setDoc(userRef, {
            name: name,
            email: userCredential.user.email,
            imageUrl: userCredential.user.photoURL,
            grievanceCount: 0,
            isAdmin: false // Default to not admin
        });
        
        // Manually update the user state because onAuthStateChanged might be slow
        setUser({ ...userCredential.user, displayName: name, photoURL: userCredential.user.photoURL });
    }
    toast({ title: 'Sign Up Successful', description: 'Welcome! You are now logged in.' });
    router.push('/map');
  };

  const logout = async () => {
    await signOut(auth);
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
