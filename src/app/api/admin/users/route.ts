import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles, purchases } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile || profile.length === 0 || profile[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users with their purchase statistics
    const allUsers = await db.select().from(profiles);

    // Get purchase statistics for each user
    const usersWithStats = await Promise.all(
      allUsers.map(async (user) => {
        // Get total purchases count
        const purchaseStats = await db
          .select({
            totalPurchases: sql<number>`count(*)::int`,
            totalSpent: sql<number>`coalesce(sum(${purchases.totalAmount}), 0)::int`,
            lastPurchase: sql<string>`max(${purchases.purchasedAt})`,
          })
          .from(purchases)
          .where(eq(purchases.buyerId, user.id));

        const stats = purchaseStats[0] || {
          totalPurchases: 0,
          totalSpent: 0,
          lastPurchase: null,
        };

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          totalPurchases: stats.totalPurchases,
          totalSpent: stats.totalSpent,
          lastPurchase: stats.lastPurchase,
        };
      })
    );

    // Sort by total spent (highest first)
    usersWithStats.sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json({
      success: true,
      users: usersWithStats,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
