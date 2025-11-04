/**
 * Authentication Service (Client-Safe Version)
 * 
 * Handles ONLY Supabase Auth operations - NO database access
 * For use in client components
 */

import { createClient } from '@/lib/supabase/client';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'buyer';
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
}

export class AuthServiceClient {
  private supabase = createClient();

  /**
   * Sign up - delegates to server action for profile creation
   */
  async signUp(data: SignUpData): Promise<{ user: User | null; error: Error | null }> {
    try {
      // Create auth user in Supabase
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            role: 'buyer',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        return { user: null, error: authError };
      }

      if (!authData.user) {
        return { user: null, error: new Error('No user returned from signup') };
      }

      // Profile will be created by database trigger or server action
      // For now, return basic user data
      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        fullName: data.fullName,
        role: 'buyer',
        phone: data.phone || null,
        avatarUrl: null,
        createdAt: new Date(authData.user.created_at),
      };

      return { user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Sign up failed') 
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInData): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { user: null, error: authError };
      }

      if (!authData.user) {
        return { user: null, error: new Error('No user returned from sign in') };
      }

      // Get user data from auth metadata
      const metadata = authData.user.user_metadata;
      
      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        fullName: metadata?.full_name || authData.user.email!.split('@')[0],
        role: metadata?.role || 'buyer',
        phone: metadata?.phone || null,
        avatarUrl: metadata?.avatar_url || null,
        createdAt: new Date(authData.user.created_at),
      };

      return { user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Sign in failed') 
      };
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: error instanceof Error ? error : new Error('Google sign in failed') };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error instanceof Error ? error : new Error('Sign out failed') };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data: { user: authUser }, error } = await this.supabase.auth.getUser();

      if (error || !authUser) {
        return { user: null, error };
      }

      const metadata = authUser.user_metadata;

      const user: User = {
        id: authUser.id,
        email: authUser.email!,
        fullName: metadata?.full_name || authUser.email!.split('@')[0],
        role: metadata?.role || 'buyer',
        phone: metadata?.phone || null,
        avatarUrl: metadata?.avatar_url || null,
        createdAt: new Date(authUser.created_at),
      };

      return { user, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Failed to get current user') 
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error instanceof Error ? error : new Error('Reset password failed') };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      return { error };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error instanceof Error ? error : new Error('Update password failed') };
    }
  }
}

// Export singleton instance
export const authService = new AuthServiceClient();
export type { AuthServiceClient as AuthService };
