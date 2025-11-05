import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { db } from "@/db";
import { purchases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { purchaseLogService } from "@/services/purchase-log.service";

const BUCKET = "payment-proofs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const transactionId = formData.get("transactionId");

    if (!(file instanceof File) || typeof transactionId !== "string") {
      return NextResponse.json(
        { error: "File and transactionId are required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `proofs/${transactionId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("[Upload Proof] Upload error:", uploadError);
      return NextResponse.json(
        {
          error:
            uploadError.message.includes("Bucket not found") ?
              "Storage bucket 'payment-proofs' is missing. Please create it from Supabase dashboard." :
              "Failed to upload payment proof",
        },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);

    const [purchase] = await db
      .update(purchases)
      .set({
        paymentProofUrl: publicUrl,
        paymentNote: "Payment proof uploaded by buyer",
      })
      .where(eq(purchases.transactionId, transactionId))
      .returning();

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    await purchaseLogService.log({
      purchaseId: purchase.id,
      action: "manual_proof_uploaded",
      note: "Buyer uploaded payment proof.",
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error("[Upload Proof] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload payment proof" },
      { status: 500 }
    );
  }
}
