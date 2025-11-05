"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const merchantRef = searchParams.get("merchant_ref") || searchParams.get("transaction_id");
  const reference = searchParams.get("reference");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Checking payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-slate-50">
      <Card className="max-w-md w-full border-0 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold mb-2">Payment Failed</CardTitle>
            <CardDescription className="text-base">
              Your payment could not be processed
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {merchantRef && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Merchant Reference</p>
              <p className="text-sm font-mono font-semibold text-slate-900 break-all">
                {merchantRef}
              </p>
            </div>
          )}

          {reference && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Tripay Reference</p>
              <p className="text-sm font-mono font-semibold text-slate-900 break-all">
                {reference}
              </p>
            </div>
          )}

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900 leading-relaxed">
              <strong>Possible reasons:</strong>
            </p>
            <ul className="text-sm text-red-800 mt-2 space-y-1 list-disc list-inside">
              <li>Payment was cancelled</li>
              <li>Insufficient funds</li>
              <li>Payment timeout/expired</li>
              <li>Technical error</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700 leading-relaxed">
              Don't worry! No charges were made. You can try purchasing again.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full bg-[#48CAE4] hover:bg-[#3AAFCE]"
              onClick={() => router.push("/shop")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/gallery")}
            >
              Go to Gallery
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => router.push("/user/purchases")}
            >
              View Purchase Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
