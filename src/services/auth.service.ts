/**
 * Authentication Service
 * 
 * Handles user authentication using Supabase Auth
 * - Sign up (buyer registration)
 * - Sign in (email + password)
 * - Sign in with Google OAuth
 * - Sign out
 * - Get current user
 * - Password reset
 */

import { createClient } from '@/lib/supabase/client';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { NewProfile } from '@/db/schema';

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

export class AuthService {
  private supabase = createClient();

  /**
   * Sign up new buyer
   */
  async signUp(data: SignUpData): Promise<{ user: User | null; error: Error | null }> {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // 2. Create profile
      const profileData: NewProfile = {
        id: authData.user.id,
        email: data.email,
        fullName: data.fullName,
        role: 'buyer',
        phone: data.phone || null,
      };

      await db.insert(profiles).values(profileData);

      // 3. Get created profile
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, authData.user.id))
        .limit(1);

      const user: User = {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
        createdAt: profile.createdAt,
      };

      return { user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign in with email and password (for buyers only)
   */
  async signIn(data: SignInData): Promise<{ user: User | null; error: Error | null }> {
    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to sign in');

      // 2. Get profile from database
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, authData.user.id))
        .limit(1);

      if (!profile) {
        // Sign out if profile not found
        await this.supabase.auth.signOut();
        throw new Error('Profile not found');
      }

      // 3. Check if user is buyer (not admin)
      if (profile.role !== 'buyer') {
        // Sign out if user is admin
        await this.supabase.auth.signOut();
        throw new Error('Admin accounts cannot login here. Please use admin login page.');
      }

      const user: User = {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
        createdAt: profile.createdAt,
      };

      return { user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error as Error };
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
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: error as Error };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as Error };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      // 1. Get auth user
      const { data: { user: authUser }, error: authError } = await this.supabase.auth.getUser();

      if (authError) throw authError;
      if (!authUser) return { user: null, error: null };

      // 2. Get profile from database
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, authUser.id))
        .limit(1);

      if (!profile) throw new Error('Profile not found');

      const user: User = {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
        createdAt: profile.createdAt,
      };

      return { user, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Request password reset
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as Error };
    }
  }

  /**
   * Update password (after reset)
   */
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error as Error };
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return session !== null;
    } catch (error) {
      console.error('Check auth error:', error);
      return false;
    }
  }

  /**
   * Check if user is admin
   */
  async isAdmin(): Promise<boolean> {
    try {
      const { user } = await this.getCurrentUser();
      return user?.role === 'admin';
    } catch (error) {
      console.error('Check admin error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
