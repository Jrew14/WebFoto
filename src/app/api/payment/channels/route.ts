import { NextResponse } from "next/server";
import { tripayService } from "@/services/tripay.service";

export async function GET() {
  try {
    const channels = await tripayService.getPaymentChannels();
    const fallback = tripayService.popFallbackReason();

    const payload: Record<string, unknown> = {
      success: true,
      channels,
    };

    if (fallback) {
      payload.fallback = fallback;
      if (fallback === "unauthorized_ip") {
        payload.warning =
          "Tripay menolak IP server ini (Unauthorized IP). Tambahkan IP backend ke whitelist Tripay atau gunakan pembayaran manual sementara.";
      } else if (fallback === "cloudflare") {
        payload.warning =
          "Tripay tidak bisa dihubungi karena Cloudflare memblokir permintaan. Menggunakan daftar channel cadangan.";
      } else {
        payload.warning =
          "Tripay payment channels menggunakan data cadangan.";
      }
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to fetch Tripay channels:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch payment channels";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
