"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Images,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Loader2,
  Info,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getEventsAction, getPhotosAction, getTotalRevenueAction } from "@/actions";

// Mock data untuk demo - nanti bisa diganti dengan data dari database
const salesData = [
  { name: "Jan", penjualan: 12, revenue: 4200 },
  { name: "Feb", penjualan: 19, revenue: 6800 },
  { name: "Mar", penjualan: 15, revenue: 5300 },
  { name: "Apr", penjualan: 25, revenue: 8900 },
  { name: "Mei", penjualan: 22, revenue: 7700 },
  { name: "Jun", penjualan: 30, revenue: 10500 },
  { name: "Jul", penjualan: 28, revenue: 9800 },
];

const topPhotos = [
  { name: "Wedding - Couple Shot", views: 245, sales: 15 },
  { name: "Birthday Party - Group", views: 198, sales: 12 },
  { name: "Corporate Event", views: 176, sales: 10 },
  { name: "Graduation Photo", views: 154, sales: 8 },
  { name: "Family Portrait", views: 132, sales: 7 },
];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    soldPhotos: 0,
    totalRevenue: 0,
    totalEvents: 0,
    recentPhotos: 0,
  });

  useEffect(() => {
    // Check for info message from URL params
    const infoParam = searchParams.get("info");
    if (infoParam === "admin_cannot_access_user_routes") {
      setShowInfo(true);
      // Auto hide after 5 seconds
      setTimeout(() => setShowInfo(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // Load all data in parallel
        const [photos, events, revenueData] = await Promise.all([
          getPhotosAction(),
          getEventsAction(),
          getTotalRevenueAction(), // Get total revenue
        ]);

        // Calculate stats
        const totalPhotos = photos.length;
        const soldPhotos = photos.filter((p: { sold: boolean }) => p.sold).length;
        const totalRevenue = revenueData.totalRevenue || 0;
        const totalEvents = events.length;

        // Get recent photos (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentPhotos = photos.filter(
          (p: { createdAt: Date }) => new Date(p.createdAt) >= thirtyDaysAgo
        ).length;

        setStats({
          totalPhotos,
          soldPhotos,
          totalRevenue,
          totalEvents,
          recentPhotos,
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Calculate percentage of sold photos
  const soldPercentage =
    stats.totalPhotos > 0
      ? ((stats.soldPhotos / stats.totalPhotos) * 100).toFixed(1)
      : "0.0";

  // Show loading state
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Info Message */}
      {showInfo && (
        <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Informasi
            </h3>
            <p className="text-sm text-blue-800">
              Anda sedang login sebagai admin. Halaman Gallery dan Shop hanya dapat diakses oleh user biasa. 
              Untuk melihat halaman tersebut, silakan logout dan login menggunakan akun buyer.
            </p>
          </div>
          <button
            onClick={() => setShowInfo(false)}
            className="text-blue-600 hover:text-blue-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">
          Overview aktivitas dan performa penjualan foto Anda
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Foto Diunggah"
          value={stats.totalPhotos.toLocaleString('id-ID')}
          description="Total foto dalam gallery"
          icon={Images}
          trend={{ value: stats.recentPhotos, isPositive: true }}
        />
        <StatCard
          title="Foto Terjual"
          value={stats.soldPhotos.toLocaleString('id-ID')}
          description={`${soldPercentage}% dari total foto`}
          icon={ShoppingCart}
          trend={{ value: parseFloat(soldPercentage), isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value={`Rp ${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          description="Total pendapatan"
          icon={DollarSign}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Total Events"
          value={stats.totalEvents.toLocaleString('id-ID')}
          description="Event yang tersedia"
          icon={Users}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Grafik Penjualan</CardTitle>
            <CardDescription>
              Trend penjualan foto dalam 7 bulan terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="penjualan"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={{ fill: "#0f172a", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Jumlah Foto Terjual"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Grafik Revenue</CardTitle>
            <CardDescription>
              Pendapatan dalam ribuan rupiah (7 bulan terakhir)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`Rp ${value}K`, "Revenue"]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#0f172a"
                  radius={[8, 8, 0, 0]}
                  name="Revenue (Ribu)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Photos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Foto Terpopuler</CardTitle>
            <CardDescription>
              5 foto dengan views tertinggi bulan ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPhotos.map((photo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {photo.name}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Eye className="w-3 h-3" />
                        {photo.views} views
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {photo.sales} terjual
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terakhir</CardTitle>
            <CardDescription>
              Update terbaru dari aktivitas admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-medium">
                    Penjualan baru
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    "Wedding - Couple Shot" terjual ke John Doe
                  </p>
                  <p className="text-xs text-slate-400 mt-1">2 jam yang lalu</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Images className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-medium">
                    Upload foto berhasil
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    15 foto dari "Corporate Event 2024" berhasil diunggah
                  </p>
                  <p className="text-xs text-slate-400 mt-1">5 jam yang lalu</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-medium">
                    Pelanggan baru
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Jane Smith mendaftar sebagai pelanggan
                  </p>
                  <p className="text-xs text-slate-400 mt-1">1 hari yang lalu</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-medium">
                    Revenue milestone
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Mencapai Rp 45M revenue bulan ini
                  </p>
                  <p className="text-xs text-slate-400 mt-1">2 hari yang lalu</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
