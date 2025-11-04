import { NextResponse } from "next/server";
import crypto from "crypto";
import { paymentService } from "@/services/payment.service";
import { tripayService, TripayTransaction } from "@/services/tripay.service";

const PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY!;
const USE_OPTIONAL_TOKEN = false; // kalau mau pakai token internal sendiri
const CALLBACK_SECRET = process.env.TRIPAY_CALLBACK_SECRET; // opsional

function buildTransactionFromPayload(payload: any): TripayTransaction {
  return {
    reference: payload?.reference,
    merchant_ref: payload?.merchant_ref,
    payment_method: payload?.payment_method,
    payment_name: payload?.payment_name,
    amount: Number(payload?.amount ?? payload?.total_amount ?? 0),
    total_amount: Number(payload?.total_amount ?? payload?.amount ?? 0),
    fee_merchant: Number(payload?.fee_merchant ?? 0),
    fee_customer: Number(payload?.fee_customer ?? 0),
    status: payload?.status,
    note: payload?.note ?? payload?.notes ?? null,
    pay_code: payload?.pay_code ?? null,
    checkout_url: payload?.checkout_url ?? null,
    expired_time: payload?.expired_time ?? null,
    paid_time: payload?.paid_time ?? null,
  } as TripayTransaction;
}

export async function POST(request: Request) {
  try {
    // 1) Ambil raw body untuk HMAC
    const raw = await request.text();

    // 2) Validasi signature dari header X-Callback-Signature
    const callbackSig = request.headers.get("x-callback-signature") || "";
    if (!PRIVATE_KEY) {
      return NextResponse.json({ success: false, message: "Missing TRIPAY_PRIVATE_KEY" }, { status: 500 });
    }
    const expected = crypto.createHmac("sha256", PRIVATE_KEY).update(raw).digest("hex");
    if (expected !== callbackSig) {
      // signature salah -> biar Tripay retry, kembalikan 401/400
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
    }

    // 3) (Opsional) Validasi token internal buatan sendiri
    if (USE_OPTIONAL_TOKEN && CALLBACK_SECRET) {
      const token = request.headers.get("x-callback-token");
      if (token !== CALLBACK_SECRET) {
        return NextResponse.json({ success: false, message: "Unauthorized token" }, { status: 401 });
      }
    }

    // 4) Cek event
    const event = request.headers.get("x-callback-event") || "";
    if (event !== "payment_status") {
      return NextResponse.json({ success: false, message: `Unrecognized event: ${event}` }, { status: 400 });
    }

    // 5) Parse JSON setelah HMAC
    const payload = JSON.parse(raw);

    // 6) (Opsional) cross-check ke Tripay agar status paling mutakhir
    let transaction: TripayTransaction;
    try {
      transaction = await tripayService.getTransactionDetail(payload.reference);
    } catch {
      // kalau gagal, pakai payload langsung
      transaction = buildTransactionFromPayload(payload);
    }

    // 7) Update internal
    await paymentService.updatePurchaseFromTripay(transaction);

    // 8) Jawab sesuai yang diharapkan Tripay
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    // Boleh 500 agar Tripay retry; log di server
    console.error("Tripay webhook error:", error);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
