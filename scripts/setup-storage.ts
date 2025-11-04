import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

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

  console.log("🔄 Setting up Supabase Storage buckets...");

  // Check if 'photos' bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error("❌ Error listing buckets:", listError);
    throw listError;
  }

  const photoBucketExists = buckets?.some((bucket) => bucket.name === "photos");

  if (!photoBucketExists) {
    console.log("📁 Creating 'photos' bucket...");
    
    const { data: newBucket, error: createError } = await supabase.storage.createBucket("photos", {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    });

    if (createError) {
      console.error("❌ Error creating bucket:", createError);
      throw createError;
    }

    console.log("✅ 'photos' bucket created successfully");
  } else {
    console.log("✅ 'photos' bucket already exists");
  }

  // Set bucket to public (if not already)
  const { data: bucketData, error: updateError } = await supabase.storage.updateBucket("photos", {
    public: true,
  });

  if (updateError) {
    console.warn("⚠️  Warning updating bucket:", updateError.message);
  } else {
    console.log("✅ Bucket 'photos' is now public");
  }

  console.log("\n✅ Storage setup complete!");
  console.log("📦 Bucket: photos");
  console.log("🔓 Public: Yes");
  console.log("📏 Max file size: 50MB");
  console.log("📝 Allowed types: jpeg, jpg, png, webp");
}

main().catch((error) => {
  console.error("Failed to setup storage:", error);
  process.exit(1);
});
