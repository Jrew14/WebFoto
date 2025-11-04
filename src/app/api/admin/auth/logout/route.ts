import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Logout dari Supabase Auth
    await supabase.auth.signOut();

    const response = NextResponse.json(
      { message: "Logout berhasil" },
      { status: 200 }
    );

    // Hapus admin session cookie
    response.cookies.delete("admin_session");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Gagal logout" },
      { status: 500 }
    );
  }
}
