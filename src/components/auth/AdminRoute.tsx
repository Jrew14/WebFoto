"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute Component
 * 
 * Wraps routes that require admin role.
 * Redirects to /auth/signin if not authenticated.
 * Shows unauthorized page if authenticated but not admin.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Not authenticated, redirect to signin
      router.push("/auth/signin");
    }
  }, [loading, isAuthenticated, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated but not admin - show unauthorized page
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Access Denied
          </h1>
          <p className="text-slate-600 mb-6">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.push("/shop")}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Go to Shop
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
            >
              Go Back
            </Button>
          </div>
          {user && (
            <p className="text-sm text-slate-500 mt-6">
              Logged in as: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // User is authenticated and is admin, render children
  return <>{children}</>;
}
