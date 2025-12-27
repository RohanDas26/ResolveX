
'use client';

import React from 'react';
export function FirebaseClientProvider({ children }: { children: React.ReactNode}) {
  // This provider is now a pass-through since AuthProvider handles initialization.
  return <>{children}</>;
}
