/**
 * Cart Service
 * Handles shopping cart operations for multiple photo purchases
 */

import { db } from '@/db';
import { cartItems, photos, events, profiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface CartItemWithDetails {
  id: string;
  photoId: string;
  photoName: string;
  photoPreviewUrl: string;
  photoPrice: number;
  eventName: string;
  photographerName: string;
  createdAt: Date;
}

export interface CartSummary {
  items: CartItemWithDetails[];
  totalItems: number;
  subtotal: number;
  platformFee: number;
  total: number;
}

class CartService {
  /**
   * Get user's cart with full details
   */
  async getCart(userId: string): Promise<CartSummary> {
    try {
      const items = await db
        .select({
          id: cartItems.id,
          photoId: photos.id,
          photoName: photos.name,
          photoPreviewUrl: photos.previewUrl,
          photoPrice: photos.price,
          eventName: events.name,
          photographerName: profiles.fullName,
          createdAt: cartItems.createdAt,
        })
        .from(cartItems)
        .innerJoin(photos, eq(cartItems.photoId, photos.id))
        .innerJoin(events, eq(photos.eventId, events.id))
        .innerJoin(profiles, eq(photos.photographerId, profiles.id))
        .where(eq(cartItems.userId, userId))
        .orderBy(cartItems.createdAt);

      const subtotal = items.reduce((sum, item) => sum + item.photoPrice, 0);
      const platformFee = Math.round(subtotal * 0.05); // 5% platform fee
      const total = subtotal + platformFee;

      return {
        items,
        totalItems: items.length,
        subtotal,
        platformFee,
        total,
      };
    } catch (error) {
      console.error('[Cart Service] Error getting cart:', error);
      throw new Error('Failed to get cart');
    }
  }

  /**
   * Get cart item count
   */
  async getCartCount(userId: string): Promise<number> {
    try {
      const items = await db
        .select({ id: cartItems.id })
        .from(cartItems)
        .where(eq(cartItems.userId, userId));

      return items.length;
    } catch (error) {
      console.error('[Cart Service] Error getting cart count:', error);
      return 0;
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(userId: string, photoId: string): Promise<void> {
    try {
      // Check if photo exists
      const photo = await db
        .select({ id: photos.id, sold: photos.sold })
        .from(photos)
        .where(eq(photos.id, photoId))
        .limit(1);

      if (!photo.length) {
        throw new Error('Photo not found');
      }

      if (photo[0].sold) {
        throw new Error('Photo is already sold');
      }

      // Check if already in cart
      const existing = await db
        .select({ id: cartItems.id })
        .from(cartItems)
        .where(and(eq(cartItems.userId, userId), eq(cartItems.photoId, photoId)))
        .limit(1);

      if (existing.length > 0) {
        throw new Error('Photo is already in cart');
      }

      // Add to cart
      await db.insert(cartItems).values({
        userId,
        photoId,
      });
    } catch (error) {
      console.error('[Cart Service] Error adding to cart:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: string, cartItemId: string): Promise<void> {
    try {
      await db
        .delete(cartItems)
        .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)));
    } catch (error) {
      console.error('[Cart Service] Error removing from cart:', error);
      throw new Error('Failed to remove item from cart');
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<void> {
    try {
      await db.delete(cartItems).where(eq(cartItems.userId, userId));
    } catch (error) {
      console.error('[Cart Service] Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    }
  }

  /**
   * Check if photo is in user's cart
   */
  async isInCart(userId: string, photoId: string): Promise<boolean> {
    try {
      const item = await db
        .select({ id: cartItems.id })
        .from(cartItems)
        .where(and(eq(cartItems.userId, userId), eq(cartItems.photoId, photoId)))
        .limit(1);

      return item.length > 0;
    } catch (error) {
      console.error('[Cart Service] Error checking cart:', error);
      return false;
    }
  }

  /**
   * Validate cart items before checkout
   */
  async validateCart(userId: string): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const cart = await this.getCart(userId);
      const errors: string[] = [];

      if (cart.totalItems === 0) {
        errors.push('Cart is empty');
      }

      // Check if any photos are sold or no longer available
      for (const item of cart.items) {
        const photo = await db
          .select({ id: photos.id, sold: photos.sold })
          .from(photos)
          .where(eq(photos.id, item.photoId))
          .limit(1);

        if (!photo.length) {
          errors.push(`Photo "${item.photoName}" is no longer available`);
        } else if (photo[0].sold) {
          errors.push(`Photo "${item.photoName}" has been sold`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      console.error('[Cart Service] Error validating cart:', error);
      return {
        valid: false,
        errors: ['Failed to validate cart'],
      };
    }
  }
}

export const cartService = new CartService();
