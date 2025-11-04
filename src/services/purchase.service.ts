/**
 * Purchase Service
 * 
 * Handles photo purchase transactions using Drizzle ORM
 */

import { db } from '@/db';
import { purchases, photos, profiles, events } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { NewPurchase, Purchase } from '@/db/schema';

export interface PurchaseWithDetails extends Purchase {
  photo: {
    id: string;
    name: string;
    previewUrl: string;
    fullUrl: string;
    watermarkUrl: string | null;
    price: number;
  } | null;
  event: {
    id: string;
    name: string;
    eventDate: string;
  } | null;
}

export class PurchaseService {
  /**
   * Create purchase (transaction)
   */
  async createPurchase(data: {
    buyerId: string;
    photoId: string;
    amount: number;
    paymentMethod?: string;
    transactionId?: string;
  }) {
    try {
      // Use transaction to ensure atomicity
      return await db.transaction(async (tx) => {
        // 1. Create purchase record
        const purchaseData: NewPurchase = {
          buyerId: data.buyerId,
          photoId: data.photoId,
          amount: data.amount,
          paymentMethod: data.paymentMethod || null,
          paymentStatus: 'pending',
          transactionId: data.transactionId || null,
        };

        const [purchase] = await tx
          .insert(purchases)
          .values(purchaseData)
          .returning();

        // 2. If payment is successful (immediate), mark photo as sold
        if (data.transactionId) {
          await tx
            .update(purchases)
            .set({ paymentStatus: 'success' })
            .where(eq(purchases.id, purchase.id));

          await tx
            .update(photos)
            .set({ sold: true })
            .where(eq(photos.id, data.photoId));
        }

        return purchase;
      });
    } catch (error) {
      console.error('Create purchase error:', error);
      throw error;
    }
  }

  /**
   * Get user purchases
   */
  async getUserPurchases(userId: string): Promise<PurchaseWithDetails[]> {
    try {
      const result = await db
        .select({
          purchase: purchases,
          photo: {
            id: photos.id,
            name: photos.name,
            previewUrl: photos.previewUrl,
            fullUrl: photos.fullUrl,
            watermarkUrl: photos.watermarkUrl,
            price: photos.price,
          },
          event: {
            id: events.id,
            name: events.name,
            eventDate: events.eventDate,
          },
        })
        .from(purchases)
        .leftJoin(photos, eq(purchases.photoId, photos.id))
        .leftJoin(events, eq(photos.eventId, events.id))
        .where(eq(purchases.buyerId, userId))
        .orderBy(desc(purchases.purchasedAt));

      return result.map((r) => ({
        ...r.purchase,
        photo: r.photo,
        event: r.event,
      }));
    } catch (error) {
      console.error('Get user purchases error:', error);
      throw error;
    }
  }

  /**
   * Get purchase by ID
   */
  async getPurchaseById(purchaseId: string): Promise<PurchaseWithDetails | null> {
    try {
      const result = await db
        .select({
          purchase: purchases,
          photo: {
            id: photos.id,
            name: photos.name,
            previewUrl: photos.previewUrl,
            fullUrl: photos.fullUrl,
            watermarkUrl: photos.watermarkUrl,
            price: photos.price,
          },
          event: {
            id: events.id,
            name: events.name,
            eventDate: events.eventDate,
          },
        })
        .from(purchases)
        .leftJoin(photos, eq(purchases.photoId, photos.id))
        .leftJoin(events, eq(photos.eventId, events.id))
        .where(eq(purchases.id, purchaseId))
        .limit(1);

      if (result.length === 0) return null;

      return {
        ...result[0].purchase,
        photo: result[0].photo,
        event: result[0].event,
      };
    } catch (error) {
      console.error('Get purchase by ID error:', error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    purchaseId: string,
    status: 'pending' | 'success' | 'failed'
  ) {
    try {
      return await db.transaction(async (tx) => {
        // Update purchase status
        const [updated] = await tx
          .update(purchases)
          .set({ paymentStatus: status })
          .where(eq(purchases.id, purchaseId))
          .returning();

        // If payment successful, mark photo as sold
        if (status === 'success') {
          await tx
            .update(photos)
            .set({ sold: true })
            .where(eq(photos.id, updated.photoId));
        }

        // If payment failed, mark photo as available
        if (status === 'failed') {
          await tx
            .update(photos)
            .set({ sold: false })
            .where(eq(photos.id, updated.photoId));
        }

        return updated;
      });
    } catch (error) {
      console.error('Update payment status error:', error);
      throw error;
    }
  }

  /**
   * Get purchase by transaction ID
   */
  async getPurchaseByTransactionId(transactionId: string): Promise<Purchase | null> {
    try {
      const [purchase] = await db
        .select()
        .from(purchases)
        .where(eq(purchases.transactionId, transactionId))
        .limit(1);

      return purchase || null;
    } catch (error) {
      console.error('Get purchase by transaction ID error:', error);
      throw error;
    }
  }

  /**
   * Check if user has purchased photo
   */
  async hasPurchased(userId: string, photoId: string): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(purchases)
        .where(
          and(
            eq(purchases.buyerId, userId),
            eq(purchases.photoId, photoId),
            eq(purchases.paymentStatus, 'success')
          )
        )
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('Check purchase error:', error);
      return false;
    }
  }

  /**
   * Get total revenue (for admin/photographer)
   */
  async getTotalRevenue(photographerId?: string) {
    try {
      let query = db
        .select({
          purchase: purchases,
          photo: photos,
        })
        .from(purchases)
        .leftJoin(photos, eq(purchases.photoId, photos.id))
        .where(eq(purchases.paymentStatus, 'success'))
        .$dynamic();

      if (photographerId) {
        query = query.where(eq(photos.photographerId, photographerId));
      }

      const result = await query;

      const totalRevenue = result.reduce((sum, r) => sum + r.purchase.amount, 0);
      const totalSales = result.length;

      return {
        totalRevenue,
        totalSales,
      };
    } catch (error) {
      console.error('Get total revenue error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const purchaseService = new PurchaseService();
