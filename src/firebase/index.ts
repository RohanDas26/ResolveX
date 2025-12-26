
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase(): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore } {
  if (getApps().length === 0) {
    try {
      // Try to initialize with environment variables (for App Hosting)
      firebaseApp = initializeApp();
    } catch (e) {
      // Fallback to local config for development
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }
  
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
}

// Immediately initialize to ensure services are ready.
const services = initializeFirebase();

// Export the initialized services directly.
export const getSdks = () => services;


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
