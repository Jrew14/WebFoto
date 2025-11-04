"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = () => {
    // TODO: Implement resend email logic
    console.log("Resending verification email...");
    setCountdown(60);
    setCanResend(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#48CAE4]/10 via-white to-[#00B4D8]/10 flex items-center justify-center p-4" suppressHydrationWarning>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="w-full max-w-md" suppressHydrationWarning>
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

        {/* Verification Card */}
        <Card className="border-0 shadow-xl text-center">
          <CardHeader className="space-y-4 pb-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-[#48CAE4]/20 flex items-center justify-center">
              <Mail className="w-10 h-10 text-[#48CAE4]" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold mb-2">Check Your Email</CardTitle>
              <CardDescription className="text-base">
                We've sent a verification link to your email address
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 leading-relaxed">
                Please check your inbox and click the verification link to activate your account.
                If you don't see the email, check your spam folder.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-[#48CAE4]" />
                <span>Email sent successfully</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <div className="w-full space-y-3">
              <Button
                onClick={handleResend}
                disabled={!canResend}
                variant="outline"
                className="w-full h-11"
              >
                {canResend ? (
                  "Resend Verification Email"
                ) : (
                  `Resend in ${countdown}s`
                )}
              </Button>

              <Button
                asChild
                className="w-full h-11 bg-gradient-to-r from-[#48CAE4] to-[#00B4D8] hover:from-[#3AAFCE] hover:to-[#0096C7]"
              >
                <Link href="/auth/signin">
                  Back to Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="text-sm text-slate-600">
              Wrong email?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold text-[#48CAE4] hover:text-[#3AAFCE] hover:underline"
              >
                Sign up again
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
