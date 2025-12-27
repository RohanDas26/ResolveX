
'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './use-toast';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase/provider';


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
  const auth = useFirebaseAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (!auth) {
        // Firebase might not be initialized yet
        return;
    };
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signIn = async (email: string, password: string) => {
    if (!auth) return;
    await signInWithEmailAndPassword(auth, email, password);
    toast({ title: 'Sign In Successful', description: 'Welcome back!' });
    router.push('/map');
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!auth || !firestore) return;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });
    
    // Create user profile in Firestore
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
        name: name,
        email: user.email,
        imageUrl: user.photoURL || `https://api.dicebear.com/8.x/bottts/svg?seed=${user.uid}`,
        grievanceCount: 0,
        isAdmin: false, // Default to not an admin
    });

    toast({ title: 'Sign Up Successful', description: 'Welcome! You are now logged in.' });
    router.push('/map');
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const value = { user, isLoading, signIn, signUp, logout };

   if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
