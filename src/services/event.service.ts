/**
 * Event Service
 * 
 * Handles photography event operations using Drizzle ORM
 */

import { db } from '@/db';
import { events, photos, profiles } from '@/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import type { NewEvent, Event, Photo } from '@/db/schema';

export interface EventWithPhotographer extends Event {
  photographer: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface EventWithPhotos extends Event {
  photos: Photo[];
  photoCount: number;
}

export class EventService {
  /**
   * Get all events with optional filtering
   */
  async getEvents(filters?: {
    photographerId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      let query = db
        .select({
          event: events,
          photographer: {
            id: profiles.id,
            fullName: profiles.fullName,
            email: profiles.email,
          },
          photoCount: sql<number>`(
            SELECT COUNT(*)::int 
            FROM ${photos} 
            WHERE ${photos.eventId} = ${events.id}
          )`.as('photoCount'),
        })
        .from(events)
        .leftJoin(profiles, eq(events.photographerId, profiles.id))
        .$dynamic();

      // Apply filters
      const conditions = [];
      if (filters?.photographerId) {
        conditions.push(eq(events.photographerId, filters.photographerId));
      }
      if (filters?.startDate) {
        conditions.push(gte(events.eventDate, filters.startDate));
      }
      if (filters?.endDate) {
        conditions.push(lte(events.eventDate, filters.endDate));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query.orderBy(desc(events.eventDate));

      return result.map((r) => ({
        ...r.event,
        photographer: r.photographer || {
          id: '',
          fullName: 'Unknown',
          email: '',
        },
        photoCount: r.photoCount || 0,
      }));
    } catch (error) {
      console.error('Get events error:', error);
      throw error;
    }
  }

  /**
   * Get single event with photos
   */
  async getEventWithPhotos(eventId: string): Promise<EventWithPhotos | null> {
    try {
      // Get event
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!event) return null;

      // Get photos for this event
      const photoList = await db
        .select()
        .from(photos)
        .where(eq(photos.eventId, eventId))
        .orderBy(desc(photos.createdAt));

      return {
        ...event,
        photos: photoList,
        photoCount: photoList.length,
      };
    } catch (error) {
      console.error('Get event with photos error:', error);
      throw error;
    }
  }

  /**
   * Create new event
   */
  async createEvent(event: {
    name: string;
    description?: string;
    eventDate: string;
    photographerId: string;
  }) {
    try {
      const eventData: NewEvent = {
        name: event.name,
        description: event.description || null,
        eventDate: event.eventDate,
        photographerId: event.photographerId,
      };

      const [created] = await db
        .insert(events)
        .values(eventData)
        .returning();

      return created;
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    }
  }

  /**
   * Update event
   */
  async updateEvent(eventId: string, updates: {
    name?: string;
    description?: string;
    eventDate?: string;
  }) {
    try {
      const [updated] = await db
        .update(events)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(events.id, eventId))
        .returning();

      return updated;
    } catch (error) {
      console.error('Update event error:', error);
      throw error;
    }
  }

  /**
   * Delete event (cascade deletes photos)
   */
  async deleteEvent(eventId: string) {
    try {
      await db
        .delete(events)
        .where(eq(events.id, eventId));
    } catch (error) {
      console.error('Delete event error:', error);
      throw error;
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId: string) {
    try {
      const photoList = await db
        .select()
        .from(photos)
        .where(eq(photos.eventId, eventId));

      const soldPhotos = photoList.filter((p) => p.sold);
      const totalRevenue = soldPhotos.reduce((sum, p) => sum + p.price, 0);

      return {
        totalPhotos: photoList.length,
        soldPhotos: soldPhotos.length,
        totalRevenue,
      };
    } catch (error) {
      console.error('Get event stats error:', error);
      throw error;
    }
  }
}

export const eventService = new EventService();
