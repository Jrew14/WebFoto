import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

// Settings stored in .env.local file
const ENV_FILE_PATH = path.join(process.cwd(), ".env.local");

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Return current settings from environment
    return NextResponse.json({
      settings: {
        fonnteToken: process.env.FONNTE_TOKEN || "",
        tripayApiKey: process.env.TRIPAY_API_KEY || "",
        tripayPrivateKey: process.env.TRIPAY_PRIVATE_KEY || "",
        tripayMerchantCode: process.env.TRIPAY_MERCHANT_CODE || "",
        tripayMode: process.env.TRIPAY_MODE || "sandbox",
      },
    });
  } catch (error) {
    console.error("Failed to get settings:", error);
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { fonnteToken, tripayApiKey, tripayPrivateKey, tripayMerchantCode, tripayMode } = body;

    // Read current .env.local file
    let envContent = "";
    try {
      envContent = fs.readFileSync(ENV_FILE_PATH, "utf-8");
    } catch (error) {
      // File doesn't exist, create new
      envContent = "";
    }

    // Parse existing env vars
    const envLines = envContent.split("\n");
    const envVars = new Map<string, string>();
    
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key) {
          envVars.set(key.trim(), valueParts.join("=").trim());
        }
      }
    }

    // Update or add settings
    const updateEnvVar = (key: string, value: string | undefined) => {
      if (value !== undefined) {
        if (value.trim() === "") {
          envVars.delete(key);
        } else {
          envVars.set(key, value.trim());
        }
      }
    };

    updateEnvVar("FONNTE_TOKEN", fonnteToken);
    updateEnvVar("TRIPAY_API_KEY", tripayApiKey);
    updateEnvVar("TRIPAY_PRIVATE_KEY", tripayPrivateKey);
    updateEnvVar("TRIPAY_MERCHANT_CODE", tripayMerchantCode);
    updateEnvVar("TRIPAY_MODE", tripayMode);

    // Rebuild .env.local content
    const newEnvLines: string[] = [
      "# Environment Variables",
      "# Updated: " + new Date().toISOString(),
      "",
    ];

    // Add all env vars
    for (const [key, value] of envVars) {
      newEnvLines.push(`${key}=${value}`);
    }

    const newEnvContent = newEnvLines.join("\n") + "\n";

    // Write to .env.local
    fs.writeFileSync(ENV_FILE_PATH, newEnvContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully. Please restart the server.",
    });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
