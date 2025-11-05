"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Button,
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Camera,
} from "lucide-react";

interface CartItem {
  id: string;
  addedAt: string;
  photo: {
    id: string;
    name: string;
    price: number;
    previewUrl: string;
    fullUrl: string;
    event: { id: string; name: string } | null;
  };
}

interface TripayChannel {
  code: string;
  name: string;
}

export default function CartPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [channels, setChannels] = useState<TripayChannel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }
    loadCart();
    loadChannels();
  }, [isAuthenticated, authLoading, router]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cart");
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("[Cart] load error:", err);
      setError("Failed to load cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async () => {
    try {
      const response = await fetch("/api/payment/channels");
      if (!response.ok) return;
      const data = await response.json();
      const list: TripayChannel[] = Array.isArray(data.channels)
        ? data.channels
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setChannels(list);
      if (list.length > 0) {
        setSelectedChannel(list[0].code);
      }
    } catch (error) {
      console.warn("[Cart] failed to load payment channels", error);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await fetch(`/api/cart/${id}`, {
        method: "DELETE",
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("[Cart] remove error:", err);
      setError("Failed to remove item.");
    }
  };

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + (item.photo?.price ?? 0), 0),
    [items]
  );

  const handleCheckoutAutomatic = async (singleItem?: CartItem) => {
    const targetItems = singleItem ? [singleItem] : items;
    if (targetItems.length === 0) {
      setCheckoutMessage("No items to checkout.");
      return;
    }
    if (!selectedChannel) {
      setError("Please select a payment channel first.");
      return;
    }

    setProcessing(true);
    setError(null);
    setCheckoutMessage(null);

    const purchases: Array<{
      checkoutUrl: string | null;
      transactionId: string | null;
      paymentType: string;
    }> = [];

    try {
      for (const item of targetItems) {
        const response = await fetch("/api/purchases/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photoId: item.photo.id,
            paymentMethod: selectedChannel,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create purchase.");
        }

        purchases.push({
          checkoutUrl: data.checkoutUrl ?? null,
          transactionId: data.purchase?.transactionId ?? null,
          paymentType: data.purchase?.paymentType ?? "automatic",
        });

        // remove from cart regardless of automatic/manual fallback
        await fetch(`/api/cart/${item.id}`, { method: "DELETE" });
      }

      // refresh cart list
      await loadCart();

      const firstWithCheckout = purchases.find((p) => p.checkoutUrl);
      if (firstWithCheckout?.checkoutUrl) {
        window.location.href = firstWithCheckout.checkoutUrl;
        return;
      }

      const manualFallback = purchases.find(
        (p) => p.paymentType === "manual" && p.transactionId
      );
      if (manualFallback?.transactionId) {
        window.location.href = `/payment/manual-pending?transactionId=${manualFallback.transactionId}`;
        return;
      }

      setCheckoutMessage(
        "Purchases created. You can review them in My Purchases."
      );
    } catch (err) {
      console.error("[Cart] checkout error:", err);
      setError(
        err instanceof Error ? err.message : "Checkout failed. Please try again."
      );
      await loadCart();
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#48CAE4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <ShoppingCart className="w-6 h-6 text-[#48CAE4]" />
                Shopping Cart
              </CardTitle>
              <p className="text-sm text-gray-600">
                Review your selected photos before checkout.
              </p>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                {channels.length === 0 && <option value="">No channels</option>}
                {channels.map((channel) => (
                  <option key={channel.code} value={channel.code}>
                    {channel.name}
                  </option>
                ))}
              </select>
              <Button
                className="bg-[#48CAE4] hover:bg-[#3AAFCE]"
                disabled={processing || items.length === 0 || !selectedChannel}
                onClick={() => handleCheckoutAutomatic()}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Checkout Automatic ({items.length})
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {checkoutMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>{checkoutMessage}</span>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500">Your cart is empty.</p>
                <Button asChild className="bg-[#48CAE4] hover:bg-[#3AAFCE]">
                  <Link href="/shop">Browse Photos</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Photo</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={item.photo.previewUrl}
                              alt={item.photo.name}
                              className="w-16 h-16 rounded-lg object-cover border"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {item.photo.name}
                              </p>
                              {item.photo.event && (
                                <p className="text-sm text-gray-500">
                                  {item.photo.event.name}
                                </p>
                              )}
                              <p className="text-xs text-gray-400">
                                Added:{" "}
                                {new Date(item.addedAt).toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-900">
                          Rp {item.photo.price.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCheckoutAutomatic(item)}
                            disabled={processing}
                          >
                            Pay Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/payment/manual-instructions?photoId=${item.photo.id}`
                              )
                            }
                          >
                            Manual Pay
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleRemove(item.id)}
                            disabled={processing}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t pt-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Camera className="w-4 h-4" />
                    <span>{items.length} photo(s) in cart</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Estimated</p>
                    <p className="text-2xl font-bold text-[#48CAE4]">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
