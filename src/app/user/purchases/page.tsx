"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useRouter } from "next/navigation";

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
}

export default function UserPurchasesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    loadPurchases();
  }, [isAuthenticated, authLoading, router]);

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
          <Badge variant="secondary">
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

  const filteredPurchases = purchases.filter((p) => {
    if (filter === "all") return true;
    if (filter === "paid") return p.paymentStatus === "paid";
    if (filter === "pending") return p.paymentStatus === "pending";
    return true;
  });

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
            {filteredPurchases.map((purchase) => (
              <Card key={purchase.id} className="overflow-hidden">
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

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-bold text-[#48CAE4]">
                        Rp {purchase.totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {purchase.paymentStatus === "paid" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          window.open(purchase.photo.previewUrl, "_blank")
                        }
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
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        {purchase.paymentType === "manual"
                          ? "Waiting for admin verification"
                          : "Payment pending"}
                      </p>
                      {purchase.expiresAt && (
                        <p className="text-xs text-yellow-700 mt-1">
                          Expires:{" "}
                          {new Date(purchase.expiresAt).toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-800">
                        Payment {purchase.paymentStatus}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
