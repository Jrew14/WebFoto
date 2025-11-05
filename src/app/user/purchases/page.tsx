"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Loader2,
  ShoppingBag,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface Purchase {
  id: string;
  transactionId: string;
  amount: number;
  totalAmount: number;
  paymentType: "manual" | "automatic";
  paymentStatus: "pending" | "paid" | "expired" | "failed";
  paymentMethod: string | null;
  purchasedAt: string;
  paidAt: string | null;
  expiresAt: string | null;
  paymentCheckoutUrl: string | null;
  paymentReference: string | null;
  photo: {
    id: string;
    name: string;
    previewUrl: string;
    fullUrl: string;
    event: {
      name: string;
      eventDate: string;
    } | null;
  };
  manualPaymentMethod: {
    id: string | null;
    name: string | null;
    accountNumber: string | null;
    accountName: string | null;
    type: string | null;
    instructions: string | null;
  } | null;
}

function PurchasesContent() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [highlightTransaction, setHighlightTransaction] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ name: string; url: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    loadPurchases();
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const highlight = searchParams.get("highlight");
    setHighlightTransaction(highlight);
  }, [searchParams]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/purchases/user");
      const data = await response.json();

      if (response.ok) {
        setPurchases(data.purchases || []);
      }
    } catch (error) {
      console.error("Failed to load purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (photoId: string, photoName: string) => {
    try {
      const response = await fetch(`/api/photos/download?photoId=${photoId}`);
      
      if (!response.ok) {
        throw new Error("Failed to download photo");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photoName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download photo");
    }
  };

  const handlePreview = (purchase: Purchase) => {
    const url = purchase.photo.fullUrl || purchase.photo.previewUrl;
    if (!url) {
      window.alert("File foto tidak tersedia.");
      return;
    }

    setPreviewPhoto({ name: purchase.photo.name, url });
    setPreviewOpen(true);
  };

  const handlePayNow = async (purchase: Purchase) => {
    try {
      if (!purchase.transactionId) {
        window.alert("Transaksi ini tidak memiliki referensi pembayaran. Silakan buat pesanan baru atau gunakan metode manual.");
        return;
      }

      const response = await fetch(
        `/api/purchases/${encodeURIComponent(purchase.transactionId)}/sync`,
        { method: "PATCH" }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to refresh payment status");
      }

      const updated: Purchase | undefined = data?.purchase;
      if (updated) {
        setPurchases((prev) =>
          prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
        );

        if (updated.paymentStatus !== "pending") {
          window.alert("Transaksi sebelumnya sudah tidak berlaku. Silakan buat pesanan baru.");
          router.push("/shop");
          return;
        }

        if (updated.paymentCheckoutUrl) {
          window.open(updated.paymentCheckoutUrl, "_blank", "noopener");
          return;
        }

        const params = new URLSearchParams();
        if (updated.paymentReference) {
          params.set("reference", updated.paymentReference);
        }
        if (updated.transactionId) {
          params.set("merchant_ref", updated.transactionId);
        }

        window.location.href =
          params.toString().length > 0
            ? `/payment/pending?${params.toString()}`
            : `/payment/pending`;
        return;
      }
    } catch (error) {
      console.error("[Purchases] sync error:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Gagal memeriksa status pembayaran. Coba lagi nanti."
      );
    }
  };

  const handleContinueManual = (purchase: Purchase) => {
    if (!purchase.transactionId) return;
    window.location.href = `/payment/manual-pending?transactionId=${encodeURIComponent(
      purchase.transactionId
    )}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-orange-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (filter === "all") return true;
      if (filter === "paid") return p.paymentStatus === "paid";
      if (filter === "pending") return p.paymentStatus === "pending";
      return true;
    });
  }, [purchases, filter]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#48CAE4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-[#48CAE4]" />
              My Purchases
            </h1>
            <p className="text-gray-600 mt-1">
              View and download your purchased photos
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All ({purchases.length})
          </Button>
          <Button
            variant={filter === "paid" ? "default" : "outline"}
            onClick={() => setFilter("paid")}
            size="sm"
          >
            Paid ({purchases.filter((p) => p.paymentStatus === "paid").length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            size="sm"
          >
            Pending ({purchases.filter((p) => p.paymentStatus === "pending").length})
          </Button>
        </div>

        {/* Purchases List */}
        {filteredPurchases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === "all"
                  ? "No purchases yet"
                  : `No ${filter} purchases`}
              </p>
              <Button
                className="mt-4 bg-[#48CAE4] hover:bg-[#3AAFCE]"
                onClick={() => router.push("/shop")}
              >
                Browse Photos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPurchases.map((purchase) => {
              const isHighlighted =
                !!highlightTransaction &&
                (highlightTransaction === purchase.transactionId ||
                  highlightTransaction === purchase.id);
              const total =
                purchase.totalAmount ?? purchase.amount ?? 0;
              const baseAmount = purchase.amount ?? 0;
              const feeAmount = Math.max(total - baseAmount, 0);

              return (
                <Card
                  key={purchase.id}
                  className={`overflow-hidden transition-shadow ${
                    isHighlighted ? "ring-2 ring-[#48CAE4] shadow-xl" : ""
                  }`}
                >
                  <div className="relative aspect-video">
                    <img
                      src={
                        purchase.paymentStatus === "paid"
                          ? purchase.photo.fullUrl
                          : purchase.photo.previewUrl
                      }
                      alt={purchase.photo.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(purchase.paymentStatus)}
                    </div>
                    {purchase.paymentStatus === "paid" && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Full Quality
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="pt-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {purchase.photo.name}
                      </h3>
                      {purchase.photo.event && (
                        <p className="text-sm text-gray-600">
                          {purchase.photo.event.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(purchase.purchasedAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span className="capitalize">
                          {purchase.paymentType === "manual" ? "Manual Transfer" : "Automatic"}
                        </span>
                      </div>

                      {purchase.paymentType === "manual" &&
                        purchase.manualPaymentMethod && (
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                            <p className="font-medium text-slate-900 mb-1">
                              {purchase.manualPaymentMethod.name}
                            </p>
                            <p>{purchase.manualPaymentMethod.accountName}</p>
                            <p>{purchase.manualPaymentMethod.accountNumber}</p>
                          </div>
                        )}

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="font-bold text-[#48CAE4]">
                          Rp {total.toLocaleString("id-ID")}
                        </span>
                      </div>
                      {feeAmount > 0 && (
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Includes fees</span>
                          <span>Rp {feeAmount.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                    </div>

                    {purchase.paymentStatus === "paid" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handlePreview(purchase)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-[#48CAE4] hover:bg-[#3AAFCE]"
                          onClick={() =>
                            handleDownload(purchase.photo.id, purchase.photo.name)
                          }
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ) : purchase.paymentStatus === "pending" ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800 font-medium">
                            {purchase.paymentType === "manual"
                              ? "Waiting for admin verification / upload proof"
                              : "Payment pending"}
                          </p>
                          {purchase.expiresAt && (
                            <p className="text-xs text-yellow-700 mt-1">
                              Expires:{" "}
                              {new Date(purchase.expiresAt).toLocaleString("id-ID")}
                            </p>
                          )}
                        </div>

                        {purchase.paymentType === "automatic" ? (
                          <Button
                            className="w-full bg-[#48CAE4] hover:bg-[#3AAFCE]"
                            onClick={() => handlePayNow(purchase)}
                          >
                            Pay Now
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-[#48CAE4] hover:bg-[#3AAFCE]"
                            onClick={() => handleContinueManual(purchase)}
                          >
                            Continue Payment
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-800 font-medium">
                            Payment {purchase.paymentStatus}
                          </p>
                          <p className="text-xs text-red-700 mt-1">
                            Silakan lakukan pemesanan ulang jika masih ingin membeli foto ini.
                          </p>
                        </div>
                        <Button
                          className="w-full bg-[#48CAE4] hover:bg-[#3AAFCE]"
                          onClick={() => {
                            router.push(`/shop?photoId=${purchase.photo.id}`);
                          }}
                        >
                          Beli Ulang
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            setPreviewPhoto(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl overflow-hidden border-0 p-0 shadow-2xl">
          <DialogHeader className="px-6 pt-4 pb-2">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {previewPhoto?.name ?? "Preview Foto"}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-slate-900">
            {previewPhoto ? (
              <img
                src={previewPhoto.url}
                alt={previewPhoto.name}
                className="h-[70vh] w-full object-contain"
              />
            ) : (
              <div className="flex h-[70vh] items-center justify-center text-sm text-slate-100">
                Foto tidak tersedia
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UserPurchasesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#48CAE4]" />
      </div>
    }>
      <PurchasesContent />
    </Suspense>
  );
}
