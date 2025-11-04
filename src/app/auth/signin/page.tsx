"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/services/client";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  useEffect(() => {
    setIsMounted(true);
    
    // Check for error from URL params
    const errorParam = searchParams.get("error");
    if (errorParam === "admin_not_allowed") {
      setErrors(prev => ({
        ...prev,
        general: "Admin accounts cannot login here. Please use the admin login page."
      }));
    }
  }, [searchParams]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    let hasError = false;

    if (!formData.email) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      hasError = true;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({ email: "", password: "", general: "" });

    try {
      const { user, error } = await authService.signIn({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrors(prev => ({ 
            ...prev, 
            general: "Please verify your email address. Check your inbox for the verification link." 
          }));
          setIsLoading(false);
          return;
        }
        
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrors(prev => ({ 
            ...prev, 
            general: "Invalid email or password. Please try again." 
          }));
          setIsLoading(false);
          return;
        }
        
        // Generic error
        setErrors(prev => ({ ...prev, general: error.message }));
        setIsLoading(false);
        return;
      }

      if (!user) {
        setErrors(prev => ({ ...prev, general: "Sign in failed. Please try again." }));
        setIsLoading(false);
        return;
      }

      // Check if user is admin or regular user and redirect accordingly
      if (user.role === 'admin') {
        router.push("/admin/dashboard");
      } else {
        router.push("/shop");
      }
      
      // Force router refresh to update auth state
      router.refresh();
    } catch (error) {
      console.error("Sign in error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrors({ email: "", password: "", general: "" });
    
    try {
      const { error } = await authService.signInWithGoogle();

      if (error) {
        throw new Error(error.message);
      }

      // Google OAuth will redirect automatically
      // No need to manually redirect here
    } catch (error) {
      console.error("Google sign in error:", error);
      const errorMessage = error instanceof Error ? error.message : "Google sign in failed";
      setErrors(prev => ({ ...prev, general: errorMessage }));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#48CAE4]/10 via-white to-[#00B4D8]/10 flex items-center justify-center p-4 py-12" suppressHydrationWarning>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="w-full max-w-md" suppressHydrationWarning>
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/home" className="inline-flex items-center gap-3 mb-6 group">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#48CAE4] to-[#00B4D8] text-white shadow-lg group-hover:shadow-xl transition-all">
              <Camera className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#48CAE4] to-[#00B4D8] bg-clip-text text-transparent">
              Soraroid
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600">Sign in to your account to continue</p>
        </div>

        {/* Sign In Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errors.general}</span>
                </p>
                {errors.general.toLowerCase().includes('verify') && (
                  <p className="text-xs text-slate-600 mt-2 ml-6">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <Link href="/auth/verify-email" className="text-[#48CAE4] hover:underline font-medium">
                      resend verification email
                    </Link>
                  </p>
                )}
              </div>
            )}

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 mb-4"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4" suppressHydrationWarning>
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 h-11 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 h-11 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  {isMounted && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      disabled={isLoading}
                      suppressHydrationWarning
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  )}
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-[#48CAE4] to-[#00B4D8] hover:from-[#3AAFCE] hover:to-[#0096C7] text-white shadow-md hover:shadow-lg transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-slate-600">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold text-[#48CAE4] hover:text-[#3AAFCE] hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#48CAE4]/10 to-[#00B4D8]/10">
        <Loader2 className="w-12 h-12 text-[#48CAE4] animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
