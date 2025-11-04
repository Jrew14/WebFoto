"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ShoppingBag,
  Loader2,
  Filter,
} from "lucide-react";

interface Purchase {
  id: string;
  transactionId: string;
  amount: number;
  totalAmount: number;
  paymentType: "manual" | "automatic";
  paymentStatus: "pending" | "paid" | "expired" | "failed";
  paymentMethod: string | null;
  paymentProofUrl: string | null;
  purchasedAt: string;
  paidAt: string | null;
  verifiedAt: string | null;
  buyer: {
    id: string;
    fullName: string;
    email: string;
  };
  photo: {
    id: string;
    name: string;
    previewUrl: string;
    event: {
      name: string;
    } | null;
  };
  verifier: {
    fullName: string;
  } | null;
}

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/purchases");
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

  const handleVerify = async (purchaseId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/admin/purchases/${purchaseId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await loadPurchases();
        setSelectedPurchase(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to verify purchase");
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("Failed to verify purchase");
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
    if (filterStatus !== "all" && p.paymentStatus !== filterStatus) return false;
    if (filterType !== "all" && p.paymentType !== filterType) return false;
    return true;
  });

  const stats = {
    total: purchases.length,
    pending: purchases.filter((p) => p.paymentStatus === "pending").length,
    paid: purchases.filter((p) => p.paymentStatus === "paid").length,
    manualPending: purchases.filter(
      (p) => p.paymentType === "manual" && p.paymentStatus === "pending"
    ).length,
  };

  if (loading) {
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
              Purchase Management
            </h1>
            <p className="text-gray-600 mt-1">
              View and verify all purchase transactions
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Purchases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
              <p className="text-sm text-gray-600">Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{stats.manualPending}</div>
              <p className="text-sm text-gray-600">Manual Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="w-48">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Payment Type
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      No purchases found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-mono text-sm">
                        {purchase.transactionId.slice(0, 12)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{purchase.buyer.fullName}</div>
                          <div className="text-sm text-gray-500">{purchase.buyer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={purchase.photo.previewUrl}
                            alt={purchase.photo.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="text-sm">
                            <div className="font-medium truncate max-w-[150px]">
                              {purchase.photo.name}
                            </div>
                            {purchase.photo.event && (
                              <div className="text-gray-500">{purchase.photo.event.name}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>Rp {purchase.totalAmount.toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <Badge variant={purchase.paymentType === "manual" ? "outline" : "secondary"}>
                          {purchase.paymentType}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(purchase.paymentStatus)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(purchase.purchasedAt).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPurchase(purchase)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Detail Dialog */}
      <Dialog open={!!selectedPurchase} onOpenChange={() => setSelectedPurchase(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription>
              Transaction ID: {selectedPurchase?.transactionId}
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-4">
              {/* Photo Preview */}
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <img
                  src={selectedPurchase.photo.previewUrl}
                  alt={selectedPurchase.photo.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Buyer:</span>
                  <p className="font-medium">{selectedPurchase.buyer.fullName}</p>
                  <p className="text-gray-500">{selectedPurchase.buyer.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedPurchase.paymentStatus)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Payment Type:</span>
                  <p className="font-medium capitalize">{selectedPurchase.paymentType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <p className="font-medium">
                    Rp {selectedPurchase.totalAmount.toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Purchased At:</span>
                  <p className="font-medium">
                    {new Date(selectedPurchase.purchasedAt).toLocaleString("id-ID")}
                  </p>
                </div>
                {selectedPurchase.paidAt && (
                  <div>
                    <span className="text-gray-600">Paid At:</span>
                    <p className="font-medium">
                      {new Date(selectedPurchase.paidAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                )}
                {selectedPurchase.verifiedAt && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Verified By:</span>
                    <p className="font-medium">
                      {selectedPurchase.verifier?.fullName} at{" "}
                      {new Date(selectedPurchase.verifiedAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Proof for Manual */}
              {selectedPurchase.paymentType === "manual" && selectedPurchase.paymentProofUrl && (
                <div>
                  <span className="text-gray-600 text-sm">Payment Proof:</span>
                  <img
                    src={selectedPurchase.paymentProofUrl}
                    alt="Payment Proof"
                    className="mt-2 w-full rounded-lg border"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedPurchase?.paymentStatus === "pending" &&
              selectedPurchase?.paymentType === "manual" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleVerify(selectedPurchase.id, "reject")}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleVerify(selectedPurchase.id, "approve")}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
