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

// PATCH - Toggle payment method status
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await checkAdminAuth();

    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const method = await manualPaymentMethodService.togglePaymentMethodStatus(
      resolvedParams.id
    );

    return NextResponse.json({ method });
  } catch (error) {
    console.error("Error toggling payment method status:", error);
    return NextResponse.json(
      { error: "Failed to toggle status" },
      { status: 500 }
    );
  }
}
