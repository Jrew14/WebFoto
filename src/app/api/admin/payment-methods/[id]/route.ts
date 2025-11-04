import { NextResponse } from "next/server";
import { manualPaymentMethodService } from "@/services/manual-payment.service";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, user: null };
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile || profile.role !== "admin") {
    return { authorized: false, user: null };
  }

  return { authorized: true, user };
}

// PUT - Update payment method
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await checkAdminAuth();

    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();

    const method = await manualPaymentMethodService.updatePaymentMethod(
      resolvedParams.id,
      {
        name: body.name,
        type: body.type,
        accountNumber: body.accountNumber,
        accountName: body.accountName,
        minAmount: body.minAmount,
        maxAmount: body.maxAmount,
        fee: body.fee,
        feePercentage: body.feePercentage,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
        instructions: body.instructions,
      }
    );

    return NextResponse.json({ method });
  } catch (error) {
    console.error("Error updating payment method:", error);
    return NextResponse.json(
      { error: "Failed to update payment method" },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment method
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await checkAdminAuth();

    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    await manualPaymentMethodService.deletePaymentMethod(resolvedParams.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 }
    );
  }
}
