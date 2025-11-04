"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Copy, Check, Upload, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { ManualPaymentMethod } from "@/db/schema";

function ManualPaymentInstructionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const photoId = searchParams.get("photoId");
  
  const [paymentMethods, setPaymentMethods] = useState<ManualPaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<ManualPaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoDetails, setPhotoDetails] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    if (!photoId) {
      router.push("/shop");
      return;
    }

    async function loadData() {
      try {
        // Load active payment methods
        const methodsResponse = await fetch("/api/payment-methods");
        const methodsData = await methodsResponse.json();
        
        if (methodsData.methods) {
          setPaymentMethods(methodsData.methods);
          if (methodsData.methods.length > 0) {
            setSelectedMethod(methodsData.methods[0]);
          }
        }

        // TODO: Load photo details
        // For now, using placeholder
        setPhotoDetails({
          name: "Photo",
          price: 10000,
        });
      } catch (error) {
        console.error("Failed to load payment data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [photoId, router]);

  const handleCopyAccountNumber = () => {
    if (selectedMethod) {
      navigator.clipboard.writeText(selectedMethod.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedMethod || !photoId) return;

    try {
      setUploadingProof(true);

      const response = await fetch("/api/purchases/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId: photoId,
          manualPaymentMethodId: selectedMethod.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create purchase");
      }

      // Redirect to pending page with transaction ID
      router.push(`/payment/manual-pending?transactionId=${data.purchase.transactionId}`);
    } catch (error) {
      console.error("Failed to create manual purchase:", error);
      alert(error instanceof Error ? error.message : "Failed to create purchase");
      setUploadingProof(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#48CAE4]" />
      </div>
    );
  }

  if (!photoId) {
    return null;
  }

  const totalAmount = photoDetails?.price || 0;
  const fee = selectedMethod ? selectedMethod.fee + Math.floor((totalAmount * selectedMethod.feePercentage) / 10000) : 0;
  const finalAmount = totalAmount + fee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manual Transfer Payment</h1>
            <p className="text-gray-600">Complete your payment within 24 hours</p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important!</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Transfer the exact amount shown below</li>
                <li>Keep your transfer receipt/proof</li>
                <li>Upload payment proof after transfer</li>
                <li>Payment will be verified within 1-2 hours</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Payment Methods */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Select Payment Method</h3>
              
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      selectedMethod?.id === method.id
                        ? "border-[#48CAE4] bg-[#48CAE4]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {method.type.replace("_", " ")}
                        </p>
                      </div>
                      {method.fee > 0 || method.feePercentage > 0 ? (
                        <span className="text-xs text-gray-500">
                          +Rp {method.fee.toLocaleString("id-ID")}
                          {method.feePercentage > 0 && ` + ${method.feePercentage / 100}%`}
                        </span>
                      ) : (
                        <span className="text-xs text-green-600">Free</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Payment Details */}
          <Card>
            <CardContent className="pt-6 space-y-6">
              <h3 className="font-semibold text-lg">Transfer Details</h3>

              {selectedMethod && (
                <>
                  {/* Account Info */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Account Number</p>
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-mono font-semibold text-gray-900">
                          {selectedMethod.accountNumber}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyAccountNumber}
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Account Name</p>
                      <p className="font-semibold text-gray-900">
                        {selectedMethod.accountName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Bank/Provider</p>
                      <p className="font-semibold text-gray-900">{selectedMethod.name}</p>
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Photo Price</span>
                      <span className="font-medium">
                        Rp {totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    {fee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Admin Fee</span>
                        <span className="font-medium">
                          Rp {fee.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t-2">
                      <span className="font-semibold text-lg">Total Transfer</span>
                      <span className="font-bold text-xl text-[#48CAE4]">
                        Rp {finalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Instructions */}
                  {selectedMethod.instructions && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        Payment Instructions:
                      </p>
                      <p className="text-sm text-blue-800 whitespace-pre-wrap">
                        {selectedMethod.instructions}
                      </p>
                    </div>
                  )}

                  {/* Confirm Button */}
                  <Button
                    className="w-full bg-[#48CAE4] hover:bg-[#3AAFCE]"
                    size="lg"
                    onClick={handleConfirmPayment}
                    disabled={uploadingProof}
                  >
                    I Have Transferred
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/shop">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ManualPaymentInstructionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#48CAE4]" />
        </div>
      }
    >
      <ManualPaymentInstructionsContent />
    </Suspense>
  );
}
