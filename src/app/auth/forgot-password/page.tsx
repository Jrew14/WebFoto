"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authService.resetPassword(email);
      
      if (error) {
        setError(error.message || "Failed to send reset link. Please try again.");
        return;
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset error:", error);
      setError("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#48CAE4]/10 via-white to-[#00B4D8]/10 flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/home" className="inline-flex items-center gap-3 mb-6 group">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#48CAE4] to-[#00B4D8] text-white shadow-lg group-hover:shadow-xl transition-all">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#48CAE4] to-[#00B4D8] bg-clip-text text-transparent">
                Soraroid
              </span>
            </Link>
          </div>

          <Card className="border-0 shadow-xl text-center">
            <CardHeader className="space-y-4 pb-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-[#48CAE4]/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#48CAE4]" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold mb-2">Check Your Email</CardTitle>
                <CardDescription className="text-base">
                  We've sent password reset instructions to
                </CardDescription>
                <p className="text-sm font-semibold text-[#48CAE4] mt-2">{email}</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Please check your inbox and follow the link to reset your password.
                  If you don't see the email, check your spam folder.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                asChild
                className="w-full h-11 bg-gradient-to-r from-[#48CAE4] to-[#00B4D8] hover:from-[#3AAFCE] hover:to-[#0096C7]"
              >
                <Link href="/auth/signin">
                  Back to Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <div className="text-sm text-slate-600">
                Didn't receive the email?{" "}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="font-semibold text-[#48CAE4] hover:text-[#3AAFCE] hover:underline"
                >
                  Try again
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#48CAE4]/10 via-white to-[#00B4D8]/10 flex items-center justify-center p-4" suppressHydrationWarning>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
          <p className="text-slate-600">No worries, we'll send you reset instructions</p>
        </div>

        {/* Forgot Password Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className={`pl-10 h-11 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {error}
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
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              {/* Back to Sign In */}
              <Button
                type="button"
                variant="ghost"
                className="w-full h-11"
                asChild
                disabled={isLoading}
              >
                <Link href="/auth/signin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Support Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Need help?{" "}
            <Link
              href="/support"
              className="font-semibold text-[#48CAE4] hover:text-[#3AAFCE] hover:underline"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
