import { NextResponse } from "next/server";
import { paymentService } from "@/services/payment.service";
import { tripayService, TripayTransaction } from "@/services/tripay.service";

const CALLBACK_SECRET = process.env.TRIPAY_CALLBACK_SECRET;

function buildTransactionFromPayload(payload: Record<string, unknown>): TripayTransaction {
  return {
    reference: payload?.reference,
    merchant_ref: payload?.merchant_ref,
    payment_method: payload?.payment_method,
    payment_name: payload?.payment_name,
    amount: Number(payload?.amount ?? 0),
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
    if (CALLBACK_SECRET) {
      const callbackToken = request.headers.get("x-callback-token");
      if (!callbackToken || callbackToken !== CALLBACK_SECRET) {
        console.error("Tripay webhook: invalid callback token");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = await request.json();
    const signature = payload?.signature ?? request.headers.get("x-signature");

    const isValidSignature = tripayService.verifyCallbackSignature({
      reference: payload?.reference,
      merchantRef: payload?.merchant_ref,
      status: payload?.status,
      totalAmount: payload?.total_amount ?? payload?.amount,
      signature,
    });

    if (!isValidSignature) {
      console.error("Tripay webhook: invalid signature", payload);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let transaction: TripayTransaction;

    try {
      transaction = await tripayService.getTransactionDetail(payload.reference);
    } catch (error) {
      console.warn("Tripay webhook: fallback to payload", error);
      transaction = buildTransactionFromPayload(payload);
    }

    await paymentService.updatePurchaseFromTripay(transaction);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tripay webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 200 });
  }
}
