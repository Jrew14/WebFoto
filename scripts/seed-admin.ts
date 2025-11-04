import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { db } from "../src/db";
import { profiles } from "../src/db/schema";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@piksel-jual.com";
const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD ?? "Admin123!@#";

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase environment variables are incomplete. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: userList, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    throw listError;
  }

  const existingUser = userList?.users.find(
    (user) => user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
  );

  const userId = existingUser?.id;

  if (userId) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      },
    );

    if (updateError) {
      throw updateError;
    }
  } else {
    const { data: createdUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
      });

    if (createError || !createdUser.user) {
      throw createError ?? new Error("Failed to create admin user.");
    }
  }

  let finalUserId = userId;

  if (!finalUserId) {
    const { data: refreshedUsers, error: refreshError } =
      await supabase.auth.admin.listUsers();

    if (refreshError) {
      throw refreshError;
    }

    finalUserId =
      refreshedUsers?.users.find(
        (user) => user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
      )?.id ?? null;
  }

  if (!finalUserId) {
    throw new Error("Admin user could not be confirmed.");
  }

  // Create or update profile using Drizzle
  const existingProfile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, finalUserId))
    .limit(1);

  if (existingProfile.length > 0) {
    // Update existing profile
    await db
      .update(profiles)
      .set({
        email: ADMIN_EMAIL,
        fullName: "Admin Piksel Jual",
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, finalUserId));
  } else {
    // Insert new profile
    await db.insert(profiles).values({
      id: finalUserId,
      email: ADMIN_EMAIL,
      fullName: "Admin Piksel Jual",
      role: "admin",
    });
  }

  console.log(
    `✅ Admin user ensured.\n📧 Email: ${ADMIN_EMAIL}\n🔑 Password: ${ADMIN_PASSWORD}`,
  );
}

main().catch((error) => {
  console.error("Failed to seed admin user:", error);
  process.exit(1);
});
