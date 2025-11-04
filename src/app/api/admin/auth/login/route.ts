import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password harus diisi" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Coba login menggunakan email (username as email)
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

    if (authError) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Login gagal" },
        { status: 401 }
      );
    }

    // Cek apakah user adalah admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      // Logout if profile not found
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Profil tidak ditemukan" },
        { status: 403 }
      );
    }

    if (profile?.role !== "admin") {
      // Logout jika bukan admin
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Akses ditolak. Hanya admin yang dapat login di halaman ini." },
        { status: 403 }
      );
    }

    // Set custom cookie untuk menandai ini adalah admin session
    const response = NextResponse.json(
      {
        message: "Login berhasil",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName: profile.full_name,
          role: profile.role,
        },
      },
      { status: 200 }
    );

    // Set admin session cookie (httpOnly untuk keamanan)
    response.cookies.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
