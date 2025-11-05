import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { purchases, photos, events, profiles, purchaseLogs } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile || profile.length === 0 || profile[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all purchases with buyer, photo, and event details
    const allPurchases = await db
      .select({
        id: purchases.id,
        transactionId: purchases.transactionId,
        amount: purchases.amount,
        totalAmount: purchases.totalAmount,
        paymentType: purchases.paymentType,
        paymentStatus: purchases.paymentStatus,
        paymentMethod: purchases.paymentMethod,
        paymentProofUrl: purchases.paymentProofUrl,
        purchasedAt: purchases.purchasedAt,
        paidAt: purchases.paidAt,
        verifiedAt: purchases.verifiedAt,
        verifiedBy: purchases.verifiedBy,
        buyer: {
          id: profiles.id,
          fullName: profiles.fullName,
          email: profiles.email,
        },
        photo: {
          id: photos.id,
          name: photos.name,
          previewUrl: photos.previewUrl,
        },
        event: {
          id: events.id,
          name: events.name,
        },
      })
      .from(purchases)
      .leftJoin(profiles, eq(purchases.buyerId, profiles.id))
      .leftJoin(photos, eq(purchases.photoId, photos.id))
      .leftJoin(events, eq(photos.eventId, events.id))
      .orderBy(desc(purchases.purchasedAt));

    const purchaseIds = allPurchases
      .map((p) => p.id)
      .filter((id): id is string => Boolean(id));

    const logsByPurchase = new Map<
      string,
      Array<{ id: string; action: string; note: string | null; createdAt: Date }>
    >();

    if (purchaseIds.length > 0) {
      try {
        const purchaseLogsData = await db
          .select({
            id: purchaseLogs.id,
            purchaseId: purchaseLogs.purchaseId,
            action: purchaseLogs.action,
            note: purchaseLogs.note,
            createdAt: purchaseLogs.createdAt,
          })
          .from(purchaseLogs)
          .where(inArray(purchaseLogs.purchaseId, purchaseIds))
          .orderBy(desc(purchaseLogs.createdAt));

        purchaseLogsData.forEach((log) => {
          if (!log.purchaseId) return;
          const arr = logsByPurchase.get(log.purchaseId) ?? [];
          arr.push({
            id: log.id,
            action: log.action,
            note: log.note,
            createdAt: log.createdAt,
          });
          logsByPurchase.set(log.purchaseId, arr);
        });
      } catch (error) {
        console.warn("[Admin Purchases] purchaseLogs lookup skipped:", error);
      }
    }

    // Get verifier info separately for purchases that have been verified
    const purchasesWithVerifier = await Promise.all(
      allPurchases.map(async (p) => {
        let verifier = null;
        if (p.verifiedAt && p.verifiedBy) {
          const verifierProfile = await db
            .select({ fullName: profiles.fullName })
            .from(profiles)
            .where(eq(profiles.id, p.verifiedBy))
            .limit(1);
          
          if (verifierProfile && verifierProfile.length > 0) {
            verifier = { fullName: verifierProfile[0].fullName };
          }
        }

        return {
          ...p,
          verifier,
          buyer: p.buyer || { id: "", fullName: "Unknown", email: "" },
          photo: {
            id: p.photo?.id ?? "",
            name: p.photo?.name ?? "Foto tidak tersedia",
            previewUrl: p.photo?.previewUrl ?? "",
            event: p.event || null,
          },
          logs: logsByPurchase.get(p.id) ?? [],
        };
      })
    );

    return NextResponse.json({
      success: true,
      purchases: purchasesWithVerifier,
    });
  } catch (error) {
    console.error("Failed to fetch admin purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
