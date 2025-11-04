"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Edit, Plus, Trash2 } from "lucide-react";
import { type ManualPaymentMethod } from "@/db/schema";

export default function ManualPaymentMethodsPage() {
  const [methods, setMethods] = useState<ManualPaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ManualPaymentMethod | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "bank_transfer" as "bank_transfer" | "e_wallet" | "other",
    accountNumber: "",
    accountName: "",
    minAmount: 10000,
    maxAmount: 20000000,
    fee: 0,
    feePercentage: 0,
    isActive: true,
    sortOrder: 0,
    instructions: "",
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/payment-methods");
      if (!response.ok) throw new Error("Failed to load payment methods");
      const data = await response.json();
      setMethods(data.methods || []);
    } catch (err) {
      console.error("Error loading payment methods:", err);
      setError("Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingMethod
        ? `/api/admin/payment-methods/${editingMethod.id}`
        : "/api/admin/payment-methods";

      const response = await fetch(url, {
        method: editingMethod ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save payment method");
      }

      await loadPaymentMethods();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (method: ManualPaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      accountNumber: method.accountNumber,
      accountName: method.accountName,
      minAmount: method.minAmount,
      maxAmount: method.maxAmount,
      fee: method.fee,
      feePercentage: method.feePercentage,
      isActive: method.isActive,
      sortOrder: method.sortOrder,
      instructions: method.instructions || "",
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/payment-methods/${id}/toggle`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to toggle status");
      await loadPaymentMethods();
    } catch (err) {
      console.error("Error toggling status:", err);
      setError("Failed to toggle status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/payment-methods/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete payment method");
      await loadPaymentMethods();
    } catch (err) {
      console.error("Error deleting payment method:", err);
      setError("Failed to delete payment method");
    }
  };

  const resetForm = () => {
    setEditingMethod(null);
    setFormData({
      name: "",
      type: "bank_transfer",
      accountNumber: "",
      accountName: "",
      minAmount: 10000,
      maxAmount: 20000000,
      fee: 0,
      feePercentage: 0,
      isActive: true,
      sortOrder: 0,
      instructions: "",
    });
    setError("");
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manual Payment Methods</h1>
          <p className="text-gray-600 mt-1">
            Manage manual payment options for customers
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Configure bank transfer, e-wallet, and other payment options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Account Info</TableHead>
                  <TableHead>Min</TableHead>
                  <TableHead>Max</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell className="capitalize">
                      {method.type.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-mono">{method.accountNumber}</div>
                        <div className="text-gray-600">{method.accountName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      Rp {method.minAmount.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      Rp {method.maxAmount.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      {method.fee > 0 && `Rp ${method.fee.toLocaleString("id-ID")}`}
                      {method.feePercentage > 0 &&
                        ` + ${method.feePercentage / 100}%`}
                      {method.fee === 0 && method.feePercentage === 0 && "Free"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={method.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleStatus(method.id)}
                        className={
                          method.isActive
                            ? "bg-green-600 hover:bg-green-700"
                            : ""
                        }
                      >
                        {method.isActive ? "Active" : "Inactive"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(method)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(method.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription>
              Configure payment method details and settings
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Payment Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., BCA, DANA"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="e_wallet">E-Wallet</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account/Wallet Number *</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => handleChange("accountNumber", e.target.value)}
                  placeholder="1234567890"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name *</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => handleChange("accountName", e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">Minimum Amount (Rp) *</Label>
                <Input
                  id="minAmount"
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) =>
                    handleChange("minAmount", parseInt(e.target.value))
                  }
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAmount">Maximum Amount (Rp) *</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) =>
                    handleChange("maxAmount", parseInt(e.target.value))
                  }
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee">Fixed Fee (Rp)</Label>
                <Input
                  id="fee"
                  type="number"
                  value={formData.fee}
                  onChange={(e) => handleChange("fee", parseInt(e.target.value))}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feePercentage">
                  Percentage Fee (basis points, 100 = 1%)
                </Label>
                <Input
                  id="feePercentage"
                  type="number"
                  value={formData.feePercentage}
                  onChange={(e) =>
                    handleChange("feePercentage", parseInt(e.target.value))
                  }
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  handleChange("sortOrder", parseInt(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Payment Instructions</Label>
              <textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleChange("instructions", e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter payment instructions for users..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (visible to users)
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {editingMethod ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
