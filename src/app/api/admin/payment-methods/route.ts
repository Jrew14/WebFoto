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

// GET - Get all payment methods (admin only)
export async function GET() {
  try {
    const { authorized } = await checkAdminAuth();

    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const methods = await manualPaymentMethodService.getAllPaymentMethods();

    return NextResponse.json({ methods });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

// POST - Create new payment method
export async function POST(request: Request) {
  try {
    const { authorized } = await checkAdminAuth();

    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const method = await manualPaymentMethodService.createPaymentMethod({
      name: body.name,
      type: body.type,
      accountNumber: body.accountNumber,
      accountName: body.accountName,
      minAmount: body.minAmount,
      maxAmount: body.maxAmount,
      fee: body.fee || 0,
      feePercentage: body.feePercentage || 0,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder || 0,
      instructions: body.instructions || null,
    });

    return NextResponse.json({ method }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return NextResponse.json(
      { error: "Failed to create payment method" },
      { status: 500 }
    );
  }
}
