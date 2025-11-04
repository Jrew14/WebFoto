/**
 * Photo Service
 * 
 * Handles photo operations using Drizzle ORM
 */

import { db } from '@/db';
import { photos, events, profiles } from '@/db/schema';
import { eq, and, desc, gte, lte, like, or, sql as drizzleSql } from 'drizzle-orm';
import type { NewPhoto, Photo } from '@/db/schema';

export interface PhotoWithDetails extends Photo {
  event: {
    id: string;
    name: string;
    eventDate: string;
  } | null;
  photographer: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export class PhotoService {
  /**
   * Get all photos with optional filtering
   */
  async getPhotos(filters?: {
    eventId?: string;
    photographerId?: string;
    sold?: boolean;
    searchQuery?: string;
  }) {
    try {
      let query = db
        .select({
          photo: photos,
          event: {
            id: events.id,
            name: events.name,
            eventDate: events.eventDate,
          },
          photographer: {
            id: profiles.id,
            fullName: profiles.fullName,
            email: profiles.email,
          },
        })
        .from(photos)
        .leftJoin(events, eq(photos.eventId, events.id))
        .leftJoin(profiles, eq(photos.photographerId, profiles.id))
        .$dynamic();

      // Apply filters
      const conditions = [];
      if (filters?.eventId) {
        conditions.push(eq(photos.eventId, filters.eventId));
      }
      if (filters?.photographerId) {
        conditions.push(eq(photos.photographerId, filters.photographerId));
      }
      if (filters?.sold !== undefined) {
        conditions.push(eq(photos.sold, filters.sold));
      }
      if (filters?.searchQuery) {
        conditions.push(
          or(
            like(photos.name, `%${filters.searchQuery}%`),
            like(events.name, `%${filters.searchQuery}%`)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query.orderBy(desc(photos.createdAt));

      return result.map((r) => ({
        ...r.photo,
        event: r.event,
        photographer: r.photographer,
      }));
    } catch (error) {
      console.error('Get photos error:', error);
      throw error;
    }
  }

  /**
   * Get single photo with details
   */
  async getPhoto(photoId: string): Promise<PhotoWithDetails | null> {
    try {
      const result = await db
        .select({
          photo: photos,
          event: {
            id: events.id,
            name: events.name,
            eventDate: events.eventDate,
          },
          photographer: {
            id: profiles.id,
            fullName: profiles.fullName,
            email: profiles.email,
          },
        })
        .from(photos)
        .leftJoin(events, eq(photos.eventId, events.id))
        .leftJoin(profiles, eq(photos.photographerId, profiles.id))
        .where(eq(photos.id, photoId))
        .limit(1);

      if (result.length === 0) return null;

      return {
        ...result[0].photo,
        event: result[0].event,
        photographer: result[0].photographer,
      };
    } catch (error) {
      console.error('Get photo error:', error);
      throw error;
    }
  }

  /**
   * Create photo record (after upload to storage)
   */
  async createPhoto(photo: {
    name: string;
    price: number;
    eventId: string;
    photographerId: string;
    previewUrl: string;
    fullUrl: string;
    watermarkUrl?: string;
  }) {
    try {
      const photoData: NewPhoto = {
        name: photo.name,
        price: photo.price,
        eventId: photo.eventId,
        photographerId: photo.photographerId,
        previewUrl: photo.previewUrl,
        fullUrl: photo.fullUrl,
        watermarkUrl: photo.watermarkUrl || null,
        sold: false,
      };

      // Use SET LOCAL to set auth context for RLS
      await db.execute(drizzleSql`SET LOCAL role TO 'service_role';`);

      const [created] = await db
        .insert(photos)
        .values(photoData)
        .returning();

      // Reset role
      await db.execute(drizzleSql`RESET role;`);

      return created;
    } catch (error) {
      console.error('Create photo error:', error);
      throw error;
    }
  }

  /**
   * Update photo
   */
  async updatePhoto(photoId: string, updates: {
    name?: string;
    price?: number;
  }) {
    try {
      const [updated] = await db
        .update(photos)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(photos.id, photoId))
        .returning();

      return updated;
    } catch (error) {
      console.error('Update photo error:', error);
      throw error;
    }
  }

  /**
   * Delete photo
   */
  async deletePhoto(photoId: string) {
    try {
      await db
        .delete(photos)
        .where(eq(photos.id, photoId));
    } catch (error) {
      console.error('Delete photo error:', error);
      throw error;
    }
  }

  /**
   * Mark photo as sold
   */
  async markPhotoAsSold(photoId: string) {
    try {
      const [updated] = await db
        .update(photos)
        .set({
          sold: true,
          updatedAt: new Date(),
        })
        .where(eq(photos.id, photoId))
        .returning();

      return updated;
    } catch (error) {
      console.error('Mark photo as sold error:', error);
      throw error;
    }
  }

  /**
   * Search photos by name or event
   */
  async searchPhotos(query: string) {
    try {
      const result = await db
        .select({
          photo: photos,
          event: {
            id: events.id,
            name: events.name,
            eventDate: events.eventDate,
          },
        })
        .from(photos)
        .leftJoin(events, eq(photos.eventId, events.id))
        .where(
          or(
            like(photos.name, `%${query}%`),
            like(events.name, `%${query}%`)
          )
        )
        .orderBy(desc(photos.createdAt));

      return result.map((r) => ({
        ...r.photo,
        event: r.event,
      }));
    } catch (error) {
      console.error('Search photos error:', error);
      throw error;
    }
  }
}

export const photoService = new PhotoService();
