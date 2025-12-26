
'use client';

import React, { ReactNode } from 'react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// This is a simplified provider that no longer manages auth state.
// It can be used to wrap components that might need other Firebase context in the future.
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  return (
    <>
      <FirebaseErrorListener />
      {children}
    </>
  );
};

export default AuthProvider;
