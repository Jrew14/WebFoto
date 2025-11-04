import { NextResponse } from "next/server";
import { manualPaymentMethodService } from "@/services/manual-payment.service";

// GET - Get active payment methods (public)
export async function GET() {
  try {
    const methods = await manualPaymentMethodService.getActivePaymentMethods();

    return NextResponse.json({ methods });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}
