import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  purchases,
  photos,
  events,
  profiles,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile.length || profile[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const totalPhotosRows = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(photos);
    const soldPhotosRows = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(photos)
      .where(eq(photos.sold, true));
    const totalEventsRows = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(events);

    const revenueRows = await db
      .select({
        total: sql<number>`COALESCE(SUM(${purchases.totalAmount}), 0)`,
      })
      .from(purchases)
      .where(eq(purchases.paymentStatus, "paid"));

    const recentRows = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(photos)
      .where(sql`${photos.createdAt} >= NOW() - INTERVAL '30 days'`);

    const salesPerMonth = await db
      .select({
        month: sql<string>`TO_CHAR(date_trunc('month', ${purchases.paidAt}), 'YYYY-MM')`,
        count: sql<number>`COUNT(*)`,
      })
      .from(purchases)
      .where(eq(purchases.paymentStatus, "paid"))
      .groupBy(sql`date_trunc('month', ${purchases.paidAt})`)
      .orderBy(sql`date_trunc('month', ${purchases.paidAt}) DESC`)
      .limit(6);

    const revenuePerMonth = await db
      .select({
        month: sql<string>`TO_CHAR(date_trunc('month', ${purchases.paidAt}), 'YYYY-MM')`,
        total: sql<number>`COALESCE(SUM(${purchases.totalAmount}), 0)`,
      })
      .from(purchases)
      .where(eq(purchases.paymentStatus, "paid"))
      .groupBy(sql`date_trunc('month', ${purchases.paidAt})`)
      .orderBy(sql`date_trunc('month', ${purchases.paidAt}) DESC`)
      .limit(6);

    const topPhotos = await db
      .select({
        photoId: photos.id,
        name: photos.name,
        totalSales: sql<number>`COUNT(${purchases.id})`,
        totalRevenue: sql<number>`COALESCE(SUM(${purchases.totalAmount}), 0)`,
      })
      .from(purchases)
      .leftJoin(photos, eq(purchases.photoId, photos.id))
      .where(
        and(
          eq(purchases.paymentStatus, "paid"),
          sql`${photos.id} IS NOT NULL`
        )
      )
      .groupBy(photos.id, photos.name)
      .orderBy(sql`COUNT(${purchases.id}) DESC`)
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalPhotos: totalPhotosRows[0]?.count ?? 0,
        soldPhotos: soldPhotosRows[0]?.count ?? 0,
        totalRevenue: revenueRows[0]?.total ?? 0,
        totalEvents: totalEventsRows[0]?.count ?? 0,
        recentPhotos: recentRows[0]?.count ?? 0,
        salesPerMonth: salesPerMonth.reverse(),
        revenuePerMonth: revenuePerMonth.reverse(),
        topPhotos,
      },
    });
  } catch (error) {
    console.error("[Admin Dashboard] stats error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}
