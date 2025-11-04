/**
 * Payment Service
 * 
 * Handles payment operations and purchase management
 */

import { db } from '@/db';
import { purchases, photos } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { xenditService } from './xendit.service';
import { nanoid } from 'nanoid';

export interface CreatePurchaseParams {
  buyerId: string;
  photoId: string;
  buyerEmail: string;
}

export interface Purchase {
  id: string;
  buyerId: string;
  photoId: string;
  amount: number;
  paymentMethod: string | null;
  paymentStatus: 'pending' | 'paid' | 'expired' | 'failed';
  transactionId: string | null;
  xenditInvoiceId: string | null;
  xenditInvoiceUrl: string | null;
  paidAt: Date | null;
  expiresAt: Date | null;
  purchasedAt: Date;
}

export class PaymentService {
  /**
   * Create a new purchase and generate payment invoice
   */
  async createPurchase(params: CreatePurchaseParams): Promise<{
    purchase: Purchase;
    invoiceUrl: string;
  }> {
    try {
      // Get photo details
      const [photo] = await db
        .select()
        .from(photos)
        .where(eq(photos.id, params.photoId))
        .limit(1);

      if (!photo) {
        throw new Error('Photo not found');
      }

      if (photo.sold) {
        throw new Error('Photo already sold');
      }

      // Check if user already purchased this photo
      const [existingPurchase] = await db
        .select()
        .from(purchases)
        .where(
          and(
            eq(purchases.buyerId, params.buyerId),
            eq(purchases.photoId, params.photoId),
            eq(purchases.paymentStatus, 'paid')
          )
        )
        .limit(1);

      if (existingPurchase) {
        throw new Error('You have already purchased this photo');
      }

      // Generate unique transaction ID
      const transactionId = `TXN-${Date.now()}-${nanoid(8)}`;

      // Create Xendit invoice
      const invoice = await xenditService.createInvoice({
        externalId: transactionId,
        amount: photo.price,
        payerEmail: params.buyerEmail,
        description: `Purchase photo: ${photo.name}`,
        items: [
          {
            name: photo.name,
            quantity: 1,
            price: photo.price,
            url: photo.previewUrl,
          },
        ],
        successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?transaction_id=${transactionId}`,
        failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed?transaction_id=${transactionId}`,
      });

      // Create purchase record
      const [purchase] = await db
        .insert(purchases)
        .values({
          buyerId: params.buyerId,
          photoId: params.photoId,
          amount: photo.price,
          paymentStatus: 'pending',
          transactionId: transactionId,
          xenditInvoiceId: invoice.id,
          xenditInvoiceUrl: invoice.invoice_url,
          expiresAt: new Date(invoice.expiry_date),
        })
        .returning();

      return {
        purchase: purchase as Purchase,
        invoiceUrl: invoice.invoice_url,
      };
    } catch (error) {
      console.error('Create purchase error:', error);
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

      return purchase as Purchase | null;
    } catch (error) {
      console.error('Get purchase error:', error);
      throw error;
    }
  }

  /**
   * Get user purchases
   */
  async getUserPurchases(buyerId: string): Promise<Purchase[]> {
    try {
      const userPurchases = await db
        .select()
        .from(purchases)
        .where(eq(purchases.buyerId, buyerId))
        .orderBy(purchases.purchasedAt);

      return userPurchases as Purchase[];
    } catch (error) {
      console.error('Get user purchases error:', error);
      throw error;
    }
  }

  /**
   * Update purchase status from webhook
   */
  async updatePurchaseStatus(params: {
    xenditInvoiceId: string;
    status: 'paid' | 'expired';
    paymentMethod?: string;
    paidAt?: Date;
  }): Promise<Purchase> {
    try {
      const [purchase] = await db
        .select()
        .from(purchases)
        .where(eq(purchases.xenditInvoiceId, params.xenditInvoiceId))
        .limit(1);

      if (!purchase) {
        throw new Error('Purchase not found');
      }

      // Update purchase status
      const [updatedPurchase] = await db
        .update(purchases)
        .set({
          paymentStatus: params.status,
          paymentMethod: params.paymentMethod || purchase.paymentMethod,
          paidAt: params.paidAt || null,
        })
        .where(eq(purchases.id, purchase.id))
        .returning();

      // If paid, mark photo as sold
      if (params.status === 'paid') {
        await db
          .update(photos)
          .set({ sold: true })
          .where(eq(photos.id, purchase.photoId));
      }

      return updatedPurchase as Purchase;
    } catch (error) {
      console.error('Update purchase status error:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to photo
   */
  async hasAccessToPhoto(buyerId: string, photoId: string): Promise<boolean> {
    try {
      const [purchase] = await db
        .select()
        .from(purchases)
        .where(
          and(
            eq(purchases.buyerId, buyerId),
            eq(purchases.photoId, photoId),
            eq(purchases.paymentStatus, 'paid')
          )
        )
        .limit(1);

      return !!purchase;
    } catch (error) {
      console.error('Check photo access error:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
