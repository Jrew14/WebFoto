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
import { Input } from "@/components/ui/input";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Eye,
  Loader2,
  ShoppingBag,
  Calendar,
  Mail,
  Phone,
  Shield,
  Edit,
  Trash2,
  Save,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "buyer";
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    role: "" as "admin" | "buyer",
    password: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      phone: user.phone || "",
      role: user.role,
      password: "",
    });
    setIsEditing(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await loadUsers();
        setIsEditing(false);
        setSelectedUser(null);
        alert("User updated successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadUsers();
        setSelectedUser(null);
        alert("User deleted successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchRole = filterRole === "all" || user.role === filterRole;
    const matchSearch =
      searchQuery === "" ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchRole && matchSearch;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.totalPurchases > 0).length,
    admins: users.filter((u) => u.role === "admin").length,
    buyers: users.filter((u) => u.role === "buyer").length,
    totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0),
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
              <Users className="w-8 h-8 text-[#48CAE4]" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all registered users and their activities
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-[#48CAE4]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Buyers</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.buyers}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-[#48CAE4]">
                    Rp {(stats.totalRevenue / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="text-2xl">💰</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Purchases</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.fullName}
                              </div>
                              {user.phone && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === "admin" ? "default" : "secondary"}
                            className={
                              user.role === "admin"
                                ? "bg-purple-600"
                                : "bg-blue-500"
                            }
                          >
                            {user.role === "admin" ? (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              "Buyer"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{user.totalPurchases}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-[#48CAE4]">
                            Rp {user.totalSpent.toLocaleString("id-ID")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.createdAt).toLocaleDateString("id-ID")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleEditUser(user)}
                              className="bg-[#48CAE4] hover:bg-[#3AAFCE]"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => {
        setSelectedUser(null);
        setIsEditing(false);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit User" : "User Details"}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update user information and permissions" 
                : "Detailed information about this user"}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && isEditing ? (
            <div className="space-y-4">
              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    value={selectedUser.email}
                    disabled
                    className="mt-1 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <Select 
                    value={editForm.role} 
                    onValueChange={(value) => setEditForm({ ...editForm, role: value as "admin" | "buyer" })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <Input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Leave empty to keep current password"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Only fill this if you want to change the password</p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  disabled={saving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedUser(null);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveUser}
                    disabled={saving}
                    className="bg-[#48CAE4] hover:bg-[#3AAFCE]"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : selectedUser && (
            <div className="space-y-4">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                {selectedUser.avatarUrl ? (
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.fullName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedUser.fullName}
                  </h3>
                  <Badge
                    variant={selectedUser.role === "admin" ? "default" : "secondary"}
                    className={
                      selectedUser.role === "admin"
                        ? "bg-purple-600 mt-1"
                        : "bg-blue-500 mt-1"
                    }
                  >
                    {selectedUser.role === "admin" ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Administrator
                      </>
                    ) : (
                      "Buyer"
                    )}
                  </Badge>
                </div>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {selectedUser.email}
                  </p>
                </div>
                {selectedUser.phone && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {selectedUser.phone}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(selectedUser.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-mono text-xs text-gray-600">
                    {selectedUser.id.slice(0, 24)}...
                  </p>
                </div>
              </div>

              {/* Purchase Statistics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <ShoppingBag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedUser.totalPurchases}
                  </p>
                  <p className="text-sm text-gray-600">Total Purchases</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="text-2xl font-bold text-green-600">
                    Rp {(selectedUser.totalSpent / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-amber-600">
                    {selectedUser.lastPurchase
                      ? new Date(selectedUser.lastPurchase).toLocaleDateString("id-ID")
                      : "No purchases"}
                  </p>
                  <p className="text-sm text-gray-600">Last Purchase</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedUser(null);
                setIsEditing(false);
              }}
            >
              Close
            </Button>
            {selectedUser && (
              <Button
                onClick={() => handleEditUser(selectedUser)}
                className="bg-[#48CAE4] hover:bg-[#3AAFCE]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit User
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
