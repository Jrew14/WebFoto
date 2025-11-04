"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const merchant_ref = searchParams.get("merchant_ref");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Pembayaran Menunggu
              </h1>
              <p className="text-gray-600">
                Pesanan Anda menunggu pembayaran
              </p>
            </div>

            {/* Transaction Info */}
            {(reference || merchant_ref) && (
              <div className="bg-amber-50 rounded-lg p-4 space-y-2 text-sm">
                {merchant_ref && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono font-semibold text-gray-900">
                      {merchant_ref}
                    </span>
                  </div>
                )}
                {reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Referensi:</span>
                    <span className="font-mono text-gray-900">{reference}</span>
                  </div>
                )}
              </div>
            )}

            {/* Message */}
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                Silakan selesaikan pembayaran Anda sebelum waktu kedaluwarsa.
              </p>
              <p>
                Status pembayaran akan diperbarui secara otomatis setelah
                pembayaran berhasil dikonfirmasi.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <Link href="/shop">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Shop
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/user/home">Lihat Pesanan Saya</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
        </div>
      }
    >
      <PaymentPendingContent />
    </Suspense>
  );
}
