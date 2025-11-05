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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
const formatMonth = (value: string) => {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("id-ID", {
    month: "short",
    year: "2-digit",
  });
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showConfigAlert, setShowConfigAlert] = useState(false);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    soldPhotos: 0,
    totalRevenue: 0,
    totalEvents: 0,
    recentPhotos: 0,
  });
  const [salesChart, setSalesChart] = useState<
    Array<{ name: string; penjualan: number; revenue: number }>
  >([]);
  const [revenueChart, setRevenueChart] = useState<
    Array<{ name: string; total: number }>
  >([]);
  const [topPhotos, setTopPhotos] = useState<
    Array<{ photoId?: string; name: string; totalSales: number; totalRevenue?: number }>
  >([]);

  useEffect(() => {
    // Check for info message from URL params
    const infoParam = searchParams.get("info");
    if (infoParam === "admin_cannot_access_user_routes") {
      setShowInfo(true);
      // Auto hide after 5 seconds
      setTimeout(() => setShowInfo(false), 5000);
    }

    // Check if Tripay or Fonnte is not configured
    const checkConfiguration = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();
          const settings = data.settings;
          
          // Check if essential settings are missing
          const isTripayConfigured = settings.tripayApiKey && settings.tripayPrivateKey && settings.tripayMerchantCode;
          const isFonnteConfigured = settings.fonnteToken;
          
          if (!isTripayConfigured || !isFonnteConfigured) {
            setShowConfigAlert(true);
          }
        }
      } catch (error) {
        console.error("Failed to check configuration:", error);
      }
    };

    checkConfiguration();
  }, [searchParams]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        const response = await fetch("/api/admin/dashboard/stats");
        if (!response.ok) {
          throw new Error("Failed to load dashboard stats");
        }

        const data = await response.json();
        const s = data.stats ?? {};

        setStats({
          totalPhotos: s.totalPhotos ?? 0,
          soldPhotos: s.soldPhotos ?? 0,
          totalRevenue: s.totalRevenue ?? 0,
          totalEvents: s.totalEvents ?? 0,
          recentPhotos: s.recentPhotos ?? 0,
        });

        const sales = Array.isArray(s.salesPerMonth)
          ? s.salesPerMonth.map(
              (item: { month: string; count: number; total?: number }) => ({
                name: formatMonth(item.month),
                penjualan: item.count ?? 0,
                revenue: item.total ?? 0,
              })
            )
          : [];

        const revenues = Array.isArray(s.revenuePerMonth)
          ? s.revenuePerMonth.map(
              (item: { month: string; total: number }) => ({
                name: formatMonth(item.month),
                total: item.total ?? 0,
              })
            )
          : [];

        setSalesChart(sales);
        setRevenueChart(revenues);
        setTopPhotos(
          Array.isArray(s.topPhotos)
            ? s.topPhotos.map(
                (item: {
                  photoId?: string;
                  name: string;
                  totalSales: number;
                  totalRevenue?: number;
                }) => ({
                  photoId: item.photoId,
                  name: item.name,
                  totalSales: item.totalSales ?? 0,
                  totalRevenue: item.totalRevenue ?? undefined,
                })
              )
            : []
        );
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
      {/* Configuration Alert */}
      {showConfigAlert && (
        <div className="mb-6 rounded-lg bg-amber-50 p-4 border border-amber-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900 mb-1">
              ⚠️ Konfigurasi Diperlukan
            </h3>
            <p className="text-sm text-amber-800 mb-2">
              Tripay atau Fonnte belum dikonfigurasi. Silakan lengkapi konfigurasi untuk mengaktifkan payment gateway dan notifikasi WhatsApp.
            </p>
            <a
              href="/admin/settings"
              className="inline-flex items-center text-sm font-medium text-amber-900 hover:text-amber-700 underline"
            >
              Buka Settings →
            </a>
          </div>
          <button
            onClick={() => setShowConfigAlert(false)}
            className="text-amber-600 hover:text-amber-800"
          >
            ✕
          </button>
        </div>
      )}

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
              <LineChart data={salesChart}>
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
              <BarChart data={revenueChart}>
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
                  dataKey="total"
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
              5 foto dengan penjualan tertinggi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPhotos.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada data penjualan.</p>
              ) : (
                topPhotos.map((photo, index) => (
                  <div
                    key={photo.photoId ?? index}
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
                        <p className="text-xs text-slate-500 mt-1">
                          {photo.photoId ? `ID #${photo.photoId.slice(0, 8)}` : `Ranking #${index + 1}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {photo.totalSales} terjual
                      </p>
                      {photo.totalRevenue !== undefined && (
                        <p className="text-xs text-slate-500">
                          Rp {photo.totalRevenue.toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
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

