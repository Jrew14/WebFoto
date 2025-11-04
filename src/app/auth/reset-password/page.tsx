"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Check if user came from email link
  useEffect(() => {
    // Supabase automatically handles the hash fragment with access_token
    // We just need to verify user has valid session
    const checkSession = async () => {
      const { user } = await authService.getCurrentUser();
      if (!user) {
        // If no session, redirect to forgot password
        router.push("/auth/forgot-password");
      }
    };

    checkSession();
  }, [router]);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters";
    }
    return "";
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError("");
    setError("");
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setConfirmPasswordError("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPasswordError("");
    setConfirmPasswordError("");

    // Validation
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authService.updatePassword(password);
      
      if (error) {
        setError(error.message || "Failed to update password. Please try again.");
        return;
      }
      
      setIsSuccess(true);
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error) {
      console.error("Update password error:", error);
      setError("Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
                <CardTitle className="text-2xl font-bold mb-2">Password Updated!</CardTitle>
                <CardDescription className="text-base">
                  Your password has been successfully updated.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 leading-relaxed">
                  You can now sign in with your new password.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to sign in...</span>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                asChild
                className="w-full h-11 bg-gradient-to-r from-[#48CAE4] to-[#00B4D8] hover:from-[#3AAFCE] hover:to-[#0096C7]"
              >
                <Link href="/auth/signin">
                  Go to Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h1>
          <p className="text-slate-600">Enter your new password</p>
        </div>

        {/* Reset Password Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
            <CardDescription>
              Your new password must be different from previously used passwords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
              {/* General Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`pl-10 pr-10 h-11 ${passwordError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {passwordError}
                  </p>
                )}
                {!passwordError && password && (
                  <p className="text-sm text-slate-500">
                    Password strength: {password.length >= 12 ? "Strong" : password.length >= 8 ? "Medium" : "Weak"}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    className={`pl-10 pr-10 h-11 ${confirmPasswordError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {confirmPasswordError}
                  </p>
                )}
                {!confirmPasswordError && confirmPassword && password === confirmPassword && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-700 mb-2">Password requirements:</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={`w-1 h-1 rounded-full ${password.length >= 8 ? "bg-green-500" : "bg-slate-300"}`} />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-1 h-1 rounded-full ${password !== confirmPassword || !confirmPassword ? "bg-slate-300" : "bg-green-500"}`} />
                    Passwords must match
                  </li>
                </ul>
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
                    Updating Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
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
