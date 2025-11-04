import { NextResponse } from "next/server";
import { tripayService } from "@/services/tripay.service";

/**
 * Tripay Return URL Callback
 * This endpoint handles user redirect after completing/canceling payment
 * Different from webhook - this is for UX redirect only
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const merchant_ref = searchParams.get("merchant_ref");

    if (!reference) {
      return NextResponse.redirect(
        new URL("/payment/failed?error=missing_reference", request.url)
      );
    }

    // Fetch latest transaction status from Tripay
    const transaction = await tripayService.getTransactionDetail(reference);

    // Redirect based on payment status
    if (transaction.status === "PAID") {
      return NextResponse.redirect(
        new URL(
          `/payment/success?reference=${reference}&merchant_ref=${merchant_ref || transaction.merchant_ref}`,
          request.url
        )
      );
    } else if (transaction.status === "EXPIRED" || transaction.status === "FAILED") {
      return NextResponse.redirect(
        new URL(
          `/payment/failed?reference=${reference}&merchant_ref=${merchant_ref || transaction.merchant_ref}`,
          request.url
        )
      );
    } else {
      // Status: UNPAID or REFUND
      return NextResponse.redirect(
        new URL(
          `/payment/pending?reference=${reference}&merchant_ref=${merchant_ref || transaction.merchant_ref}`,
          request.url
        )
      );
    }
  } catch (error) {
    console.error("Tripay callback error:", error);
    return NextResponse.redirect(
      new URL("/payment/failed?error=callback_failed", request.url)
    );
  }
}
