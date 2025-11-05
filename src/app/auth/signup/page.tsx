"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Mail, Lock, User, Phone, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/services/client";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      general: "",
    };

    let hasError = false;
    let normalizedPhone = "";

    // Validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      hasError = true;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      hasError = true;
    }

    const phoneValue = formData.phone.trim();
    if (!phoneValue) {
      newErrors.phone = "Nomor WhatsApp wajib diisi";
      hasError = true;
    } else {
      const digits = phoneValue.replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 15) {
        newErrors.phone = "Masukkan nomor WhatsApp yang valid";
        hasError = true;
      } else if (!(digits.startsWith("62") || digits.startsWith("0"))) {
        newErrors.phone = "Gunakan format +62 atau 0 di awal nomor";
        hasError = true;
      } else {
        normalizedPhone = digits.startsWith("62")
          ? `+${digits}`
          : `+62${digits.slice(1)}`;
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      hasError = true;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      hasError = true;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      hasError = true;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({ name: "", email: "", phone: "", password: "", confirmPassword: "", general: "" });

    try {
      const { user, error } = await authService.signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        phone: normalizedPhone,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!user) {
        throw new Error("Sign up failed");
      }

      // Show success message
      setShowSuccess(true);

      // Wait 2 seconds before redirecting to sign in
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
      
    } catch (error) {
      console.error("Sign up error:", error);
      const errorMessage = error instanceof Error ? error.message : "Sign up failed. Please try again.";
      
      // Check for specific errors
      if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
        setErrors(prev => ({ ...prev, email: "This email is already registered" }));
      } else {
        setErrors(prev => ({ ...prev, general: errorMessage }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrors({ name: "", email: "", phone: "", password: "", confirmPassword: "", general: "" });
    
    try {
      const { error } = await authService.signInWithGoogle();

      if (error) {
        throw new Error(error.message);
      }

      // Google OAuth will redirect automatically
      // No need to manually redirect here
    } catch (error) {
      console.error("Google sign up error:", error);
      const errorMessage = error instanceof Error ? error.message : "Google sign up failed";
      setErrors(prev => ({ ...prev, general: errorMessage }));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#48CAE4]/10 via-white to-[#00B4D8]/10 flex items-center justify-center p-4" suppressHydrationWarning>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="w-full max-w-md" suppressHydrationWarning>
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-4 rounded-lg bg-[#48CAE4]/10 border border-[#48CAE4]/30 animate-in slide-in-from-top">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#48CAE4] mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#0077B6]">Account created successfully!</h3>
                <p className="text-sm text-[#3AAFCE] mt-1">
                  Please check your email to verify your account. Redirecting to sign in...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logo & Header */}
        <div className="text-center mb-6">
          <Link href="/home" className="inline-flex items-center gap-3 mb-4 group">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#48CAE4] to-[#00B4D8] text-white shadow-lg group-hover:shadow-xl transition-all">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#48CAE4] to-[#00B4D8] bg-clip-text text-transparent">
              Soraroid
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h1>
          <p className="text-sm text-slate-600">Join thousands of happy photo buyers</p>
        </div>

        {/* Sign Up Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Sign Up</CardTitle>
            <CardDescription className="text-sm">
              Enter your email to create an account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* General Error Message */}
            {errors.general && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {errors.general}
                </p>
              </div>
            )}

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-10"
              disabled={isLoading}
              onClick={handleGoogleSignUp}
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
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-500">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSignUp} className="space-y-3" suppressHydrationWarning>
              {/* Name Field */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className={`pl-9 h-9 text-sm ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-9 h-9 text-sm ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                  />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* WhatsApp Field */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">Nomor WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Contoh: 0852-8722-9898"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`pl-9 h-9 text-sm ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {errors.phone}
                </p>
              )}
              <p className="text-[11px] text-slate-500">
                Kami akan mengirimkan invoice ke nomor WhatsApp ini.
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-9 pr-9 h-9 text-sm ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    disabled={isLoading}
                    suppressHydrationWarning
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-9 pr-9 h-9 text-sm ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    disabled={isLoading}
                    suppressHydrationWarning
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-9 bg-gradient-to-r from-[#48CAE4] to-[#00B4D8] hover:from-[#3AAFCE] hover:to-[#0096C7] text-white shadow-md hover:shadow-lg transition-all text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Terms */}
            <p className="text-xs text-slate-500 text-center mt-3">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-[#48CAE4] hover:text-[#3AAFCE] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#48CAE4] hover:text-[#3AAFCE] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
          <CardFooter className="flex flex-col pt-3 pb-4">
            <div className="text-xs text-center text-slate-600">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-semibold text-[#48CAE4] hover:text-[#3AAFCE] hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
