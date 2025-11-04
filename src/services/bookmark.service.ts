/**
 * Bookmark Service
 * 
 * Handles user bookmarks using Drizzle ORM
 */

import { db } from '@/db';
import { bookmarks, photos, events, profiles } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { NewBookmark, Bookmark } from '@/db/schema';

export interface BookmarkWithDetails extends Bookmark {
  photo: {
    id: string;
    name: string;
    previewUrl: string;
    fullUrl: string;
    watermarkUrl: string | null;
    price: number;
    sold: boolean;
  } | null;
  event: {
    id: string;
    name: string;
    eventDate: string;
  } | null;
}

export class BookmarkService {
  /**
   * Verify user profile exists (required for foreign key)
   */
  private async verifyUserProfile(userId: string): Promise<void> {
    console.log('[BookmarkService] Verifying profile exists for userId:', userId);
    
    const existing = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (existing.length === 0) {
      console.error('[BookmarkService] Profile not found for userId:', userId);
      throw new Error('User profile not found. Please ensure your account is properly set up.');
    }
    
    console.log('[BookmarkService] Profile verified');
  }

  /**
   * Toggle bookmark (add if not exists, remove if exists)
   */
  async toggleBookmark(userId: string, photoId: string): Promise<{
    bookmarked: boolean;
    bookmark: Bookmark | null;
  }> {
    try {
      console.log('[BookmarkService] Toggle bookmark - userId:', userId, 'photoId:', photoId);
      
      // Verify user profile exists
      await this.verifyUserProfile(userId);
      console.log('[BookmarkService] User profile verified');

      // Verify photo exists
      const photoCheck = await db
        .select({ id: photos.id })
        .from(photos)
        .where(eq(photos.id, photoId))
        .limit(1);
      
      if (photoCheck.length === 0) {
        console.error('[BookmarkService] Photo not found:', photoId);
        throw new Error('Photo not found');
      }
      console.log('[BookmarkService] Photo exists');

      // Check if already bookmarked
      const existing = await db
        .select()
        .from(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.photoId, photoId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Remove bookmark
        console.log('[BookmarkService] Removing existing bookmark');
        await db
          .delete(bookmarks)
          .where(eq(bookmarks.id, existing[0].id));

        console.log('[BookmarkService] Bookmark removed successfully');
        return { bookmarked: false, bookmark: null };
      } else {
        // Add bookmark
        console.log('[BookmarkService] Adding new bookmark');
        const bookmarkData: NewBookmark = {
          userId,
          photoId,
        };

        const [bookmark] = await db
          .insert(bookmarks)
          .values(bookmarkData)
          .returning();

        console.log('[BookmarkService] Bookmark added successfully:', bookmark.id);
        return { bookmarked: true, bookmark };
      }
    } catch (error: any) {
      console.error('[BookmarkService] Toggle bookmark error:', error);
      console.error('[BookmarkService] Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
      });
      throw error;
    }
  }

  /**
   * Add bookmark
   */
  async addBookmark(userId: string, photoId: string): Promise<Bookmark> {
    try {
      const bookmarkData: NewBookmark = {
        userId,
        photoId,
      };

      const [bookmark] = await db
        .insert(bookmarks)
        .values(bookmarkData)
        .returning();

      return bookmark;
    } catch (error) {
      console.error('Add bookmark error:', error);
      throw error;
    }
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(userId: string, photoId: string): Promise<void> {
    try {
      await db
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.photoId, photoId)
          )
        );
    } catch (error) {
      console.error('Remove bookmark error:', error);
      throw error;
    }
  }

  /**
   * Get user bookmarks
   */
  async getUserBookmarks(userId: string): Promise<BookmarkWithDetails[]> {
    try {
      const result = await db
        .select({
          bookmark: bookmarks,
          photo: {
            id: photos.id,
            name: photos.name,
            previewUrl: photos.previewUrl,
            fullUrl: photos.fullUrl,
            watermarkUrl: photos.watermarkUrl,
            price: photos.price,
            sold: photos.sold,
          },
          event: {
            id: events.id,
            name: events.name,
            eventDate: events.eventDate,
          },
        })
        .from(bookmarks)
        .leftJoin(photos, eq(bookmarks.photoId, photos.id))
        .leftJoin(events, eq(photos.eventId, events.id))
        .where(eq(bookmarks.userId, userId))
        .orderBy(desc(bookmarks.createdAt));

      return result.map((r) => ({
        ...r.bookmark,
        photo: r.photo,
        event: r.event,
      }));
    } catch (error) {
      console.error('Get user bookmarks error:', error);
      throw error;
    }
  }

  /**
   * Check if photo is bookmarked by user
   */
  async isBookmarked(userId: string, photoId: string): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.photoId, photoId)
          )
        )
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('Check bookmark error:', error);
      return false;
    }
  }

  /**
   * Get bookmark count for photo
   */
  async getBookmarkCount(photoId: string): Promise<number> {
    try {
      const result = await db
        .select()
        .from(bookmarks)
        .where(eq(bookmarks.photoId, photoId));

      return result.length;
    } catch (error) {
      console.error('Get bookmark count error:', error);
      return 0;
    }
  }

  /**
   * Get user's bookmark IDs (for quick checking)
   */
  async getUserBookmarkIds(userId: string): Promise<string[]> {
    try {
      const result = await db
        .select({ photoId: bookmarks.photoId })
        .from(bookmarks)
        .where(eq(bookmarks.userId, userId));

      return result.map((r) => r.photoId);
    } catch (error) {
      console.error('Get user bookmark IDs error:', error);
      return [];
    }
  }

  /**
   * Remove all bookmarks for a photo (when photo is deleted)
   */
  async removeAllBookmarksForPhoto(photoId: string): Promise<void> {
    try {
      await db
        .delete(bookmarks)
        .where(eq(bookmarks.photoId, photoId));
    } catch (error) {
      console.error('Remove all bookmarks error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const bookmarkService = new BookmarkService();
