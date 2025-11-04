"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, ArrowLeft, CheckCircle, Upload, Loader2, Info, Copy, Check, Building2 } from "lucide-react";
import Link from "next/link";

export default function ManualPaymentPendingPage() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (transactionId) {
      fetchPurchaseDetails();
    } else {
      setLoading(false);
    }
  }, [transactionId]);

  const fetchPurchaseDetails = async () => {
    try {
      const response = await fetch(`/api/purchases/${transactionId}`);
      if (response.ok) {
        const data = await response.json();
        setPurchase(data.purchase);
        setUploaded(!!data.purchase.paymentProofUrl);
      }
    } catch (error) {
      console.error("Failed to fetch purchase:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !transactionId) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("transactionId", transactionId);

      const response = await fetch("/api/payment/upload-proof", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploaded(true);
        setFile(null);
      } else {
        setError(data.error || "Failed to upload proof");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload proof. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!transactionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-gray-600">Invalid transaction</p>
            <Button asChild className="mt-4">
              <Link href="/shop">Back to Shop</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (uploaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                  <Clock className="w-10 h-10 text-amber-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Payment Confirmation Received
                </h1>
                <p className="text-gray-600">
                  We have received your payment confirmation
                </p>
              </div>

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

  // Main upload form
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600">Transfer to our bank account and upload proof</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#48CAE4]" />
              Bank Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Please transfer <strong>Rp {purchase?.totalAmount?.toLocaleString('id-ID') || '0'}</strong> to the account below
              </AlertDescription>
            </Alert>

            <div className="bg-gradient-to-br from-[#48CAE4]/10 to-[#00B4D8]/10 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-gray-600">Bank Name:</span>
                <span className="col-span-2 font-semibold">BCA</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-gray-600">Account Number:</span>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="font-mono font-semibold">1234567890</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2"
                    onClick={() => copyToClipboard("1234567890")}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-gray-600">Account Name:</span>
                <span className="col-span-2 font-semibold">PT Soraroid Foto</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="col-span-2 font-semibold text-green-600">
                  Rp {purchase?.totalAmount?.toLocaleString('id-ID') || '0'}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>Transaction ID: <span className="font-mono">{transactionId}</span></p>
              <p>⏰ Payment must be completed within 24 hours</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#48CAE4]" />
              Upload Payment Proof
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proof">Transfer Receipt/Screenshot</Label>
              <Input
                id="proof"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <p className="text-xs text-gray-500">
                Upload screenshot or photo of your transfer receipt (max 5MB)
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {file && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="text-blue-900">
                  <strong>Selected:</strong> {file.name} ({(file.size / 1024).toFixed(0)} KB)
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 bg-gradient-to-r from-[#48CAE4] to-[#00B4D8] hover:from-[#00B4D8] hover:to-[#0096C7]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Proof
                  </>
                )}
              </Button>

              <Button asChild variant="outline">
                <Link href="/shop">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm text-gray-600">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Transfer the exact amount to the bank account above</li>
                <li>Take a screenshot or photo of your transfer receipt</li>
                <li>Upload the proof using the form above</li>
                <li>Wait for admin verification (usually 1-2 hours)</li>
                <li>You'll receive email notification once verified</li>
                <li>Access your photo from "My Purchases" menu</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
