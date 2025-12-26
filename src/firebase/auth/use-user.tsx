
'use client';
import { User } from 'firebase/auth';
import { UserProfile } from '@/lib/types';

// This is a mock user state since authentication has been removed.
// It provides a consistent structure for components that previously used the real hook.
const mockUser: User = {
  uid: 'user_student_1',
  email: 'alex.doe@example.com',
  displayName: 'Alex Doe',
  photoURL: 'https://api.dicebear.com/8.x/bottts/svg?seed=alex',
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

const mockProfile: UserProfile = {
    id: 'user_student_1',
    name: 'Alex Doe',
    email: 'alex.doe@example.com',
    imageUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=alex',
    grievanceCount: 0,
    isAdmin: false,
};


interface AuthState {
  user: User | null;
  claims: any | null;
  isUserLoading: boolean;
  userError: Error | null;
  profile: UserProfile | null;
  isProfileLoading: boolean;
}

// Mock implementation of useUser (previously useAuthState)
export function useUser(): AuthState {
  return {
    user: mockUser,
    claims: { isAdmin: false },
    isUserLoading: false,
    userError: null,
    profile: mockProfile,
    isProfileLoading: false
  };
}

// Keep useAuthState for any components that might still reference it.
export const useAuthState = useUser;

