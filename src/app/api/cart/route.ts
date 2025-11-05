import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { cartItems, photos, events, profiles } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

let cartSchemaEnsured = false;
let cartSchemaPromise: Promise<void> | null = null;

async function ensureCartSchema() {
  if (cartSchemaEnsured) {
    return;
  }

  if (cartSchemaPromise) {
    return cartSchemaPromise;
  }

  cartSchemaPromise = (async () => {
    try {
      await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS cart_items (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          photo_id uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
          created_at timestamptz NOT NULL DEFAULT now()
        );
      `);

      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_cart_user_photo
        ON cart_items (user_id, photo_id);
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_cart_items_user
        ON cart_items (user_id);
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_cart_items_photo
        ON cart_items (photo_id);
      `);
      cartSchemaEnsured = true;
    } finally {
      cartSchemaPromise = null;
    }
  })();

  return cartSchemaPromise;
}

async function ensureBuyerProfile(user: SupabaseAuthUser) {
  const [existingProfile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (existingProfile) {
    return;
  }

  const fallbackEmail =
    user.email ?? `${user.id}@no-email.local`;
  const fallbackName =
    (user.user_metadata?.full_name as string | undefined) ??
    fallbackEmail.split("@")[0] ??
    "Pengguna";

  await db
    .insert(profiles)
    .values({
      id: user.id,
      email: fallbackEmail,
      fullName: fallbackName,
      role: "buyer",
      phone: (user.user_metadata?.phone as string | undefined) ?? null,
    })
    .onConflictDoNothing();
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureBuyerProfile(user);
    await ensureCartSchema();

    const items = await db
      .select({
        id: cartItems.id,
        addedAt: cartItems.createdAt,
        photo: {
          id: photos.id,
          name: photos.name,
          price: photos.price,
          previewUrl: photos.previewUrl,
          fullUrl: photos.fullUrl,
        },
        event: {
          id: events.id,
          name: events.name,
        },
      })
      .from(cartItems)
      .leftJoin(photos, eq(cartItems.photoId, photos.id))
      .leftJoin(events, eq(photos.eventId, events.id))
      .where(eq(cartItems.userId, user.id));

    const formatted = items
      .filter((item) => item.photo !== null)
      .map((item) => ({
        id: item.id,
        addedAt: item.addedAt,
        photo: {
          ...item.photo!,
          event: item.event ? { id: item.event.id, name: item.event.name } : null,
        },
      }));

    return NextResponse.json({ success: true, items: formatted });
  } catch (error) {
    console.error("[Cart] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureBuyerProfile(user);
    await ensureCartSchema();

    const body = await request.json();
    const photoId = body?.photoId as string | undefined;

    if (!photoId) {
      return NextResponse.json(
        { error: "photoId is required" },
        { status: 400 }
      );
    }

    const [photo] = await db
      .select({
        id: photos.id,
        sold: photos.sold,
      })
      .from(photos)
      .where(eq(photos.id, photoId))
      .limit(1);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (photo.sold) {
      return NextResponse.json(
        { error: "Photo already sold" },
        { status: 400 }
      );
    }

    // check already in cart
    const [existing] = await db
      .select({ id: cartItems.id })
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, user.id),
          eq(cartItems.photoId, photoId)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json({ success: true, alreadyExists: true });
    }

    await db.insert(cartItems).values({
      userId: user.id,
      photoId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Cart] POST error:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return NextResponse.json({ success: true, alreadyExists: true });
    }

    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("cart_items")
    ) {
      return NextResponse.json(
        {
          error:
            "Fitur keranjang belum siap. Jalankan migrasi database terbaru lalu coba lagi.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}
