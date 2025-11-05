import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  purchases,
  photos,
  manualPaymentMethods,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const [record] = await db
      .select({
        purchase: purchases,
        photo: {
          id: photos.id,
          name: photos.name,
          previewUrl: photos.previewUrl,
          fullUrl: photos.fullUrl,
          price: photos.price,
        },
        manualMethod: {
          id: manualPaymentMethods.id,
          name: manualPaymentMethods.name,
          type: manualPaymentMethods.type,
          accountNumber: manualPaymentMethods.accountNumber,
          accountName: manualPaymentMethods.accountName,
          fee: manualPaymentMethods.fee,
          feePercentage: manualPaymentMethods.feePercentage,
          instructions: manualPaymentMethods.instructions,
        },
      })
      .from(purchases)
      .leftJoin(photos, eq(purchases.photoId, photos.id))
      .leftJoin(
        manualPaymentMethods,
        eq(purchases.manualPaymentMethodId, manualPaymentMethods.id)
      )
      .where(eq(purchases.transactionId, transactionId))
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      purchase: {
        ...record.purchase,
        photo: record.photo,
        manualPaymentMethod: record.manualMethod,
      },
    });
  } catch (error) {
    console.error("[Purchase Detail API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase detail" },
      { status: 500 }
    );
  }
}
