import { db } from "@/db";
import { purchases, photos, profiles } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { tripayService, TripayTransaction } from "./tripay.service";
import { fonnteService } from "./fonnte.service";
import { purchaseLogService } from "./purchase-log.service";

export interface CreatePurchaseParams {
  buyerId: string;
  buyerEmail: string;
  photoId: string;
  paymentMethod?: string | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
}

export interface Purchase {
  id: string;
  buyerId: string;
  photoId: string;
  amount: number;
  totalAmount: number | null;
  paymentMethod: string | null;
  paymentType: "manual" | "automatic";
  paymentStatus: "pending" | "paid" | "expired" | "failed";
  transactionId: string | null;
  paymentReference: string | null;
  paymentCheckoutUrl: string | null;
  paymentCode: string | null;
  paymentNote: string | null;
  paidAt: Date | null;
  expiresAt: Date | null;
  purchasedAt: Date;
}

const DEFAULT_PAYMENT_METHOD = process.env.NEXT_PUBLIC_TRIPAY_DEFAULT_METHOD ?? null;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const CALLBACK_URL = process.env.TRIPAY_CALLBACK_URL ?? `${APP_URL ?? ""}/api/webhooks/tripay`;
const MIN_TRIPAY_AMOUNT =
  Number(process.env.NEXT_PUBLIC_TRIPAY_MIN_AMOUNT ?? "1000") || 1000;

export class PaymentService {
  async createPurchase(params: CreatePurchaseParams): Promise<{
    purchase: Purchase;
    checkoutUrl: string | null;
    payCode: string | null;
    reference: string | null;
  }> {
    try {
      if (!APP_URL) {
        throw new Error("App URL is not configured. Please set NEXT_PUBLIC_APP_URL.");
      }

      const paymentMethod = params.paymentMethod || DEFAULT_PAYMENT_METHOD;
      if (!paymentMethod) {
        throw new Error("Payment method is required");
      }

      const [photo] = await db
        .select()
        .from(photos)
        .where(eq(photos.id, params.photoId))
        .limit(1);

      if (!photo) {
        throw new Error("Photo not found");
      }

      if (photo.sold) {
        throw new Error("Photo already sold");
      }

      // Check if already purchased (paid) or has pending payment
      let reusablePurchaseId: string | null = null;

      const [existingPurchaseRow] = await db
        .select()
        .from(purchases)
        .where(
          and(
            eq(purchases.buyerId, params.buyerId),
            eq(purchases.photoId, params.photoId)
          )
        )
        .orderBy(desc(purchases.purchasedAt))
        .limit(1);

      let existingPurchase = existingPurchaseRow as Purchase | undefined;

      if (
        existingPurchase &&
        existingPurchase.paymentStatus === "pending" &&
        existingPurchase.paymentType === "automatic" &&
        existingPurchase.paymentReference
      ) {
        try {
          const tripayTransaction =
            await tripayService.getTransactionDetail(
              existingPurchase.paymentReference
            );
          const remoteStatus = tripayService.mapTripayStatus(
            tripayTransaction.status
          );

          if (remoteStatus !== existingPurchase.paymentStatus) {
            const synced = await this.updatePurchaseFromTripay(
              tripayTransaction
            );
            existingPurchase = synced;
          }
        } catch (syncError) {
          console.warn(
            "[Payment] Unable to sync pending Tripay transaction status:",
            syncError
          );
        }
      }

      if (existingPurchase) {
        if (existingPurchase.paymentStatus === "paid") {
          throw new Error("You have already purchased this photo");
        }

        const wantsManual = paymentMethod === "manual_transfer";
        const existingAmount = existingPurchase.amount;
        const amountChanged = existingAmount !== photo.price;
        const isPending = existingPurchase.paymentStatus === "pending";
        const existingType = existingPurchase.paymentType;
        const typeChanged =
          (existingType === "manual" && !wantsManual) ||
          (existingType === "automatic" && wantsManual);

        if (isPending && !typeChanged && !amountChanged) {
          return {
            purchase: existingPurchase,
            checkoutUrl:
              existingPurchase.paymentCheckoutUrl ||
              `${APP_URL}/payment/manual-pending?transactionId=${existingPurchase.transactionId}`,
            payCode: existingPurchase.paymentCode,
            reference: existingPurchase.paymentReference,
          };
        }

        if (isPending) {
          await purchaseLogService.log({
            purchaseId: existingPurchase.id,
            action: "pending_replaced",
            note: typeChanged
              ? `Pending ${existingType} payment diganti menjadi percobaan ${wantsManual ? "manual" : "otomatis"} baru.`
              : "Pending payment diganti karena harga foto berubah.",
          });

          await db
            .update(purchases)
            .set({
              paymentStatus: "failed",
              paymentNote: "Ditandai gagal otomatis sebelum membuat percobaan pembayaran baru",
              expiresAt: new Date(),
            })
            .where(eq(purchases.id, existingPurchase.id));
          reusablePurchaseId = existingPurchase.id;
        } else if (
          existingPurchase.paymentStatus === "failed" ||
          existingPurchase.paymentStatus === "expired"
        ) {
          await purchaseLogService.log({
            purchaseId: existingPurchase.id,
            action: "retry_initiated",
            note: `Pengguna mencoba pembayaran ${wantsManual ? "manual" : "otomatis"} lagi setelah status ${existingPurchase.paymentStatus}.`,
          });
          reusablePurchaseId = existingPurchase.id;
        }
      }

      if (paymentMethod !== "manual_transfer" && photo.price < MIN_TRIPAY_AMOUNT) {
        throw new Error(
          `Harga minimum untuk pembayaran otomatis adalah Rp ${MIN_TRIPAY_AMOUNT.toLocaleString(
            "id-ID"
          )}. Silakan gunakan transfer manual atau perbarui harga foto.`
        );
      }

      const transactionId = `TXN-${Date.now()}-${nanoid(8)}`;

      // Return URL untuk redirect user setelah pembayaran
      const returnUrl = `${APP_URL}/api/payment/callback?merchant_ref=${transactionId}`;

      // Try Tripay, fallback to manual payment if Cloudflare blocks
      let transaction;
      try {
        transaction = await tripayService.createTransaction({
          method: paymentMethod,
          merchantRef: transactionId,
          amount: photo.price,
          customerName: params.buyerName || params.buyerEmail.split("@")[0] || "Customer",
          customerEmail: params.buyerEmail,
          customerPhone: params.buyerPhone ?? null,
          items: [
            {
              name: photo.name,
              quantity: 1,
              price: photo.price,
              url: photo.previewUrl,
              description: photo.eventId ? `Event ${photo.eventId}` : undefined,
            },
          ],
          callbackUrl: CALLBACK_URL,
          returnUrl,
        });
      } catch (tripayError) {
        const errorMessage =
          tripayError instanceof Error
            ? tripayError.message
            : String(tripayError);

        console.error("[Payment] Tripay API failure:", tripayError);

        const lowerMessage = errorMessage.toLowerCase();
        const isConnectivityIssue =
          lowerMessage.includes("cloudflare") ||
          lowerMessage.includes("fetch failed") ||
          lowerMessage.includes("network") ||
          lowerMessage.includes("timeout") ||
          lowerMessage.includes("socket hang up") ||
          lowerMessage.includes("getaddrinfo") ||
          lowerMessage.includes("unauthorized ip") ||
          lowerMessage.includes("whitelist ip");

        if (!isConnectivityIssue) {
          throw tripayError instanceof Error
            ? tripayError
            : new Error(errorMessage);
        }

        console.warn(
          "[Payment] Tripay connectivity issue detected, falling back to manual payment."
        );

        // Fallback: Create manual payment transaction so the customer can still proceed
        const manualTransactionId = `MANUAL-${Date.now()}-${nanoid(8)}`;

        const manualExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        let manualPurchase: Purchase | null = null;
        if (reusablePurchaseId) {
          const [updated] = await db
            .update(purchases)
            .set({
              amount: photo.price,
              totalAmount: photo.price,
              paymentStatus: "pending",
              paymentMethod: "manual_transfer",
              paymentType: "manual",
              transactionId: manualTransactionId,
              paymentReference: null,
              paymentCheckoutUrl: null,
              paymentCode: null,
              paymentNote: "Please transfer to the bank account provided",
              paymentProofUrl: null,
              manualPaymentMethodId: null,
              verifiedBy: null,
              verifiedAt: null,
              paidAt: null,
              expiresAt: manualExpiresAt,
              purchasedAt: new Date(),
            })
            .where(eq(purchases.id, reusablePurchaseId))
            .returning();

          manualPurchase = { ...(updated as Purchase), paymentType: "manual" };
        } else {
          const manualValues = {
            amount: photo.price,
            totalAmount: photo.price,
            paymentStatus: "pending" as const,
            paymentMethod: "manual_transfer",
            paymentType: "manual" as const,
            transactionId: manualTransactionId,
            paymentReference: null,
            paymentCheckoutUrl: null,
            paymentCode: null,
            paymentNote: "Please transfer to the bank account provided",
            paymentProofUrl: null,
            manualPaymentMethodId: null,
            verifiedBy: null,
            verifiedAt: null,
            paidAt: null,
            expiresAt: manualExpiresAt,
            purchasedAt: new Date(),
          };

          const [upserted] = await db
            .insert(purchases)
            .values({
              buyerId: params.buyerId,
              photoId: params.photoId,
              ...manualValues,
            })
            .onConflictDoUpdate({
              target: [purchases.buyerId, purchases.photoId],
              set: manualValues,
            })
            .returning();

          manualPurchase = { ...(upserted as Purchase), paymentType: "manual" };
        }

        if (!manualPurchase) {
          throw new Error("Failed to create manual purchase record");
        }

        await purchaseLogService.log({
          purchaseId: manualPurchase.id,
          action: "manual_created",
          note: `Fallback ke pembayaran manual karena kendala koneksi Tripay: ${errorMessage}`,
        });

        return {
          purchase: manualPurchase,
          checkoutUrl: `${APP_URL}/payment/manual-pending?transactionId=${manualTransactionId}`,
          payCode: null,
          reference: null,
        };
      }

      const expiresAt = transaction.expired_time
        ? new Date(transaction.expired_time * 1000)
        : null;

      const paidAt = transaction.paid_time
        ? new Date(transaction.paid_time * 1000)
        : null;

      const automaticData = {
        amount: photo.price,
        totalAmount: transaction.total_amount ?? transaction.amount,
        paymentStatus: tripayService.mapTripayStatus(transaction.status),
        paymentMethod,
        paymentType: "automatic" as const,
        transactionId,
        paymentReference: transaction.reference,
        paymentCheckoutUrl: transaction.checkout_url,
        paymentCode: transaction.pay_code ?? null,
        paymentNote: transaction.note ?? null,
        paymentProofUrl: null,
        manualPaymentMethodId: null,
        verifiedBy: null,
        verifiedAt: null,
        paidAt,
        expiresAt,
        purchasedAt: new Date(),
      };

      const [purchase] = await db
        .insert(purchases)
        .values({
          buyerId: params.buyerId,
          photoId: params.photoId,
          ...automaticData,
        })
        .onConflictDoUpdate({
          target: [purchases.buyerId, purchases.photoId],
          set: automaticData,
        })
        .returning();

      if (!purchase) {
        throw new Error("Failed to create purchase record");
      }

      await purchaseLogService.log({
        purchaseId: purchase.id,
        action: "automatic_created",
        note: `Transaksi Tripay dibuat dengan reference ${transaction.reference ?? "unknown"}.`,
      });

      // Send WhatsApp notification (async, don't wait)
      const [buyer] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, params.buyerId))
        .limit(1);

      if (buyer?.phone && transaction.checkout_url && expiresAt) {
        const formattedPhone = fonnteService.formatPhoneNumber(buyer.phone);
        fonnteService.sendAutomaticPaymentInvoice({
          customerName: buyer.fullName,
          customerPhone: formattedPhone,
          photoName: photo.name,
          amount: transaction.total_amount ?? transaction.amount,
          paymentMethod: transaction.payment_name,
          checkoutUrl: transaction.checkout_url,
          transactionId: transactionId,
          expiresAt: expiresAt,
        }).catch(error => {
          console.error("Failed to send automatic payment WhatsApp notification:", error);
        });
      }

      return {
        purchase: purchase as Purchase,
        checkoutUrl: transaction.checkout_url ?? null,
        payCode: transaction.pay_code ?? null,
        reference: transaction.reference ?? null,
      };
    } catch (error) {
      console.error("Create purchase error:", error);
      throw error;
    }
  }

  async getPurchaseByTransactionId(transactionId: string): Promise<Purchase | null> {
    try {
      const [purchase] = await db
        .select()
        .from(purchases)
        .where(eq(purchases.transactionId, transactionId))
        .limit(1);

      return (purchase as Purchase) ?? null;
    } catch (error) {
      console.error("Get purchase error:", error);
      throw error;
    }
  }

  async getPurchaseByPaymentReference(reference: string): Promise<Purchase | null> {
    try {
      const [purchase] = await db
        .select()
        .from(purchases)
        .where(eq(purchases.paymentReference, reference))
        .limit(1);

      return (purchase as Purchase) ?? null;
    } catch (error) {
      console.error("Get purchase by reference error:", error);
      throw error;
    }
  }

  async getUserPurchases(buyerId: string): Promise<Purchase[]> {
    try {
      const userPurchases = await db
        .select()
        .from(purchases)
        .where(eq(purchases.buyerId, buyerId))
        .orderBy(purchases.purchasedAt);

      return userPurchases as Purchase[];
    } catch (error) {
      console.error("Get user purchases error:", error);
      throw error;
    }
  }

  async updatePurchaseFromTripay(transaction: TripayTransaction): Promise<Purchase> {
    try {
      const status = tripayService.mapTripayStatus(transaction.status);

      const [purchase] = await db
        .select()
        .from(purchases)
        .where(eq(purchases.paymentReference, transaction.reference))
        .limit(1);

      if (!purchase) {
        throw new Error("Purchase not found for reference");
      }

      const [updatedPurchase] = await db
        .update(purchases)
        .set({
          paymentStatus: status,
          paymentMethod: transaction.payment_method ?? purchase.paymentMethod,
          totalAmount: transaction.total_amount ?? purchase.totalAmount,
          paymentCheckoutUrl: transaction.checkout_url ?? purchase.paymentCheckoutUrl,
          paymentCode: transaction.pay_code ?? purchase.paymentCode,
          paymentNote: transaction.note ?? purchase.paymentNote,
          paidAt: transaction.paid_time ? new Date(transaction.paid_time * 1000) : purchase.paidAt,
          expiresAt: transaction.expired_time ? new Date(transaction.expired_time * 1000) : purchase.expiresAt,
        })
        .where(eq(purchases.id, purchase.id))
        .returning();

      if (status === "paid") {
        await db
          .update(photos)
          .set({ sold: true })
          .where(eq(photos.id, purchase.photoId));
      } else {
        await db
          .update(photos)
          .set({ sold: false })
          .where(eq(photos.id, purchase.photoId));
      }

      return updatedPurchase as Purchase;
    } catch (error) {
      console.error("Update purchase status error:", error);
      throw error;
    }
  }

  async hasAccessToPhoto(buyerId: string, photoId: string): Promise<boolean> {
    try {
      const [purchase] = await db
        .select()
        .from(purchases)
        .where(
          and(
            eq(purchases.buyerId, buyerId),
            eq(purchases.photoId, photoId),
            eq(purchases.paymentStatus, "paid")
          )
        )
        .limit(1);

      return !!purchase;
    } catch (error) {
      console.error("Check photo access error:", error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
