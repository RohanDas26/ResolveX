
'use client';

import React, { useMemo } from 'react';
import { FirebaseContext, type FirebaseContextState } from './provider';
import { initializeFirebase } from '.';

export function FirebaseClientProvider({ children }: { children: React.ReactNode}) {
  const firebaseContextValue = useMemo<FirebaseContextState>(() => {
    // initializeFirebase is idempotent, so this is safe to call on re-renders.
    const { firebaseApp, auth, firestore } = initializeFirebase();
    return { firebaseApp, auth, firestore };
  }, []);

  // The value of the provider is the object containing the Firebase services.
  return (
    <FirebaseContext.Provider value={firebaseContextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}
