/**
 * Profile Service
 * 
 * Handles user profile operations using Drizzle ORM
 */

import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { Profile, NewProfile } from '@/db/schema';

export class ProfileService {
  /**
   * Get profile by user ID
   */
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1);

      return profile || null;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Get profile by email
   */
  async getProfileByEmail(email: string): Promise<Profile | null> {
    try {
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.email, email))
        .limit(1);

      return profile || null;
    } catch (error) {
      console.error('Get profile by email error:', error);
      throw error;
    }
  }

  /**
   * Update profile
   */
  async updateProfile(userId: string, updates: {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
    watermarkUrl?: string;
  }): Promise<Profile> {
    try {
      const [updated] = await db
        .update(profiles)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, userId))
        .returning();

      if (!updated) {
        throw new Error('Profile not found');
      }

      return updated;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Create profile (for new users)
   */
  async createProfile(data: NewProfile): Promise<Profile> {
    try {
      const [created] = await db
        .insert(profiles)
        .values(data)
        .returning();

      return created;
    } catch (error) {
      console.error('Create profile error:', error);
      throw error;
    }
  }

  /**
   * Delete profile
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      await db
        .delete(profiles)
        .where(eq(profiles.id, userId));
    } catch (error) {
      console.error('Delete profile error:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
