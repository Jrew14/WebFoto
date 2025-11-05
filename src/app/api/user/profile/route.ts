import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileService } from "@/services/profile.service";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await profileService.getProfile(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("[Profile API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fullName, phone } = await request.json();

    if (!fullName && !phone) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const updatedProfile = await profileService.updateProfile(user.id, {
      fullName: fullName?.trim(),
      phone: phone?.trim(),
    });

    // Keep Supabase auth metadata in sync
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: updatedProfile.fullName,
        phone: updatedProfile.phone,
      },
    });

    if (authError) {
      console.warn("[Profile API] Failed to update auth metadata:", authError);
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("[Profile API] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
