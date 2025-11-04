import { NextResponse } from "next/server";
import { tripayService } from "@/services/tripay.service";

export async function GET() {
  try {
    const channels = await tripayService.getPaymentChannels();

    return NextResponse.json({
      success: true,
      channels,
    });
  } catch (error) {
    console.error("Failed to fetch Tripay channels:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch payment channels";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
