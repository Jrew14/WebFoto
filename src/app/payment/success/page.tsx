"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Download, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#48CAE4]/10 to-[#00B4D8]/10">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#48CAE4] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Processing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#48CAE4]/10 to-[#00B4D8]/10">
      <Card className="max-w-md w-full border-0 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold mb-2">Payment Successful!</CardTitle>
            <CardDescription className="text-base">
              Your photo purchase has been completed
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {transactionId && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Transaction ID</p>
              <p className="text-sm font-mono font-semibold text-slate-900 break-all">
                {transactionId}
              </p>
            </div>
          )}

          <div className="p-4 bg-[#48CAE4]/10 border border-[#48CAE4]/20 rounded-lg">
            <p className="text-sm text-slate-700 leading-relaxed">
              Your photo is now available in your <strong>Gallery</strong>. You can download it anytime!
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              asChild
              className="w-full bg-[#48CAE4] hover:bg-[#3AAFCE]"
            >
              <Link href="/gallery">
                <Download className="w-4 h-4 mr-2" />
                Go to Gallery
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="w-full"
            >
              <Link href="/shop">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
