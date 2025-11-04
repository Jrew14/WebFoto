'use client';

import { useState, useEffect } from 'react';
import { authService, type User } from '@/services/client';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Custom hook for managing authentication state
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, isAuthenticated, isAdmin } = useAuth();
 *   
 *   if (loading) return <Spinner />;
 *   if (!isAuthenticated) return <SignInPrompt />;
 *   
 *   return <div>Welcome {user?.fullName}</div>;
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const { user } = await authService.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    await loadUser();
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    signOut,
    refreshUser,
  };
}
