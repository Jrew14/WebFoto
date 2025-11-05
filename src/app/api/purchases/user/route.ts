import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  purchases,
  photos,
  events,
  manualPaymentMethods,
} from "@/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = request.nextUrl;
    const ownedOnly = url.searchParams.get("ownedOnly") === "1";
    const includePending =
      url.searchParams.get("includePending") !== "0" &&
      url.searchParams.get("includePending") !== "false";

    if (ownedOnly) {
      const statuses: Array<"pending" | "paid" | "expired" | "failed"> = includePending ? ["pending", "paid"] : ["paid"];

      const rows = await db
        .select({ photoId: purchases.photoId })
        .from(purchases)
        .where(
          and(
            eq(purchases.buyerId, user.id),
            inArray(purchases.paymentStatus, statuses)
          )
        );

      const photoIds = Array.from(
        new Set(
          rows
            .map((row) => row.photoId)
            .filter((id): id is string => Boolean(id))
        )
      );

      return NextResponse.json({
        success: true,
        photoIds,
      });
    }

    const userPurchases = await db
      .select({
        id: purchases.id,
        transactionId: purchases.transactionId,
        amount: purchases.amount,
        totalAmount: purchases.totalAmount,
        paymentType: purchases.paymentType,
        paymentStatus: purchases.paymentStatus,
        paymentMethod: purchases.paymentMethod,
        purchasedAt: purchases.purchasedAt,
        paidAt: purchases.paidAt,
        expiresAt: purchases.expiresAt,
        paymentCheckoutUrl: purchases.paymentCheckoutUrl,
        paymentReference: purchases.paymentReference,
        manualPaymentMethodId: purchases.manualPaymentMethodId,
        photo: {
          id: photos.id,
          name: photos.name,
          previewUrl: photos.previewUrl,
          fullUrl: photos.fullUrl,
        },
        event: {
          id: events.id,
          name: events.name,
          eventDate: events.eventDate,
        },
        manualMethod: {
          id: manualPaymentMethods.id,
          name: manualPaymentMethods.name,
          accountNumber: manualPaymentMethods.accountNumber,
          accountName: manualPaymentMethods.accountName,
          type: manualPaymentMethods.type,
          instructions: manualPaymentMethods.instructions,
        },
      })
      .from(purchases)
      .leftJoin(photos, eq(purchases.photoId, photos.id))
      .leftJoin(events, eq(photos.eventId, events.id))
      .leftJoin(
        manualPaymentMethods,
        eq(purchases.manualPaymentMethodId, manualPaymentMethods.id)
      )
      .where(eq(purchases.buyerId, user.id))
      .orderBy(desc(purchases.purchasedAt));

    const formattedPurchases = userPurchases
      .map((p) => ({
        id: p.id,
        transactionId: p.transactionId,
        amount: p.amount,
        totalAmount: p.totalAmount,
        paymentType: p.paymentType || "automatic",
        paymentStatus: p.paymentStatus,
        paymentMethod: p.paymentMethod,
        purchasedAt: p.purchasedAt,
        paidAt: p.paidAt,
        expiresAt: p.expiresAt,
        paymentCheckoutUrl: p.paymentCheckoutUrl,
        paymentReference: p.paymentReference,
        photo: p.photo
          ? {
              id: p.photo.id,
              name: p.photo.name,
              previewUrl: p.photo.previewUrl,
              fullUrl: p.photo.fullUrl,
              event: p.event
                ? {
                    name: p.event.name,
                    eventDate: p.event.eventDate,
                  }
                : null,
            }
          : null,
        manualPaymentMethod: p.manualMethod
          ? {
              id: p.manualMethod.id,
              name: p.manualMethod.name,
              accountNumber: p.manualMethod.accountNumber,
              accountName: p.manualMethod.accountName,
              type: p.manualMethod.type,
              instructions: p.manualMethod.instructions,
            }
          : null,
      }))
      .filter((p) => p.photo !== null);

    return NextResponse.json({
      success: true,
      purchases: formattedPurchases,
    });
  } catch (error) {
    console.error("Failed to fetch user purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
