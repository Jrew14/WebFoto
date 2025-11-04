import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile and role if authenticated
  let userRole: 'admin' | 'buyer' | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    userRole = profile?.role || null;
  }

  const pathname = request.nextUrl.pathname;

  // Define route categories
  const adminRoutes = pathname.startsWith("/admin");
  const customerRoutes = pathname.startsWith("/gallery") || 
                        pathname.startsWith("/shop") || 
                        pathname.startsWith("/user") ||
                        pathname.startsWith("/home");

  // Protect admin routes - only admin can access
  if (adminRoutes) {
    // Allow access to admin login page
    if (pathname === "/admin/login") {
      // If already logged in as admin, redirect to dashboard
      if (user && userRole === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      // Allow non-authenticated or non-admin to view login page
      return response;
    }

    // For all other admin routes, require admin authentication
    if (!user) {
      // Not authenticated, redirect to admin login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (userRole !== "admin") {
      // User is authenticated but not admin, redirect to gallery (customer area)
      const url = new URL("/gallery", request.url);
      url.searchParams.set("error", "admin_only");
      return NextResponse.redirect(url);
    }

    // User is admin, allow access
    return response;
  }

  // Protect customer routes - only buyers can access
  if (customerRoutes) {
    if (user && userRole === "admin") {
      // Admin trying to access customer routes, redirect to admin dashboard
      const url = new URL("/admin/dashboard", request.url);
      url.searchParams.set("info", "customer_only");
      return NextResponse.redirect(url);
    }

    // Allow buyers and non-authenticated users to access customer routes
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    // Admin routes
    "/admin/:path*",
    // Customer routes
    "/gallery/:path*",
    "/shop/:path*",
    "/user/:path*",
    "/home/:path*"
  ],
};
