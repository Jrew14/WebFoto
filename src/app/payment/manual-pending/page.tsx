"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ManualPaymentPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-amber-600" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Confirmation Received
              </h1>
              <p className="text-gray-600">
                We have received your payment confirmation
              </p>
            </div>

            {/* Status Steps */}
            <div className="bg-amber-50 rounded-lg p-4 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Payment Submitted</p>
                  <p className="text-sm text-gray-600">
                    Your transfer confirmation has been recorded
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-medium text-gray-900">Verification in Progress</p>
                  <p className="text-sm text-gray-600">
                    Our team is verifying your payment (1-2 hours)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-400">Photo Access</p>
                  <p className="text-sm text-gray-500">
                    You will get access after verification
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>What happens next?</strong>
              </p>
              <ul className="text-left space-y-1 ml-4">
                <li>✓ Admin will verify your payment</li>
                <li>✓ You will receive email notification</li>
                <li>✓ Photo will be available in "My Purchases"</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <Link href="/shop">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Shop
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/gallery">Check My Orders</Link>
              </Button>
            </div>

            {/* Support Note */}
            <div className="pt-4 border-t text-xs text-gray-500">
              <p>
                Need help? Contact admin if payment not verified within 24 hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
