# Dashboard Admin - WebFoto

## 🎯 Overview
Dashboard admin lengkap dengan analytics, grafik penjualan, dan sidebar navigation yang telah diimplementasikan.

## 📁 Struktur File yang Dibuat

### Layout & Components
- `src/app/admin/(dashboard)/layout.tsx` - Layout admin dengan sidebar dan auth guard
- `src/components/admin/Sidebar.tsx` - Sidebar navigation dengan menu
- `src/components/admin/StatCard.tsx` - Komponen card untuk menampilkan statistik

### Pages
- `src/app/admin/(dashboard)/dashboard/page.tsx` - Halaman dashboard utama dengan analytics
- `src/app/admin/(dashboard)/upload/page.tsx` - Placeholder halaman unggah foto
- `src/app/admin/(dashboard)/gallery/page.tsx` - Placeholder halaman gallery foto
- `src/app/admin/(dashboard)/profile/page.tsx` - Placeholder halaman profile admin

## 🎨 Fitur Dashboard

### 1. Sidebar Navigation
- ✅ **Dashboard** - Halaman utama dengan analytics (aktif)
- ⏳ **Unggah Foto** - Untuk bulk upload foto (coming soon)
- ⏳ **Gallery Foto** - Untuk mengelola foto yang sudah diunggah (coming soon)
- ⏳ **Profile Admin** - Untuk pengaturan profil admin (coming soon)
- ✅ **Logout** - Button untuk keluar dari dashboard

**Features:**
- Active state indicator pada menu yang sedang dibuka
- Disabled state untuk menu yang belum diimplementasi dengan badge "Soon"
- Responsive hover effects
- Icon untuk setiap menu item

### 2. Statistics Cards (4 Cards)
Menampilkan metrik penting dengan:
- ✅ **Total Foto Diunggah** - Jumlah total foto dalam gallery
- ✅ **Foto Terjual** - Jumlah foto yang sudah terjual dengan persentase
- ✅ **Total Revenue** - Pendapatan bulan ini
- ✅ **Total Pelanggan** - Jumlah pembeli aktif

**Features:**
- Trend indicator (↑/↓ dengan persentase perubahan)
- Icon yang relevan untuk setiap metrik
- Warna yang konsisten dengan design system

### 3. Grafik Analytics (2 Charts)

#### Grafik Penjualan (Line Chart)
- Menampilkan trend penjualan foto dalam 7 bulan terakhir
- Sumbu X: Bulan (Jan - Jul)
- Sumbu Y: Jumlah foto terjual
- Interactive tooltip saat hover
- Smooth line dengan data points

#### Grafik Revenue (Bar Chart)
- Menampilkan pendapatan dalam ribuan rupiah
- Sumbu X: Bulan (Jan - Jul)
- Sumbu Y: Revenue (dalam ribu)
- Interactive tooltip dengan format "Rp XXK"
- Rounded bar corners untuk estetika modern

### 4. Foto Terpopuler
Menampilkan 5 foto dengan performa terbaik:
- Ranking badge (1-5)
- Nama foto
- Jumlah views dengan icon eye
- Jumlah penjualan
- Hover effect untuk interaktivitas

### 5. Aktivitas Terakhir
Timeline aktivitas admin dengan:
- ✅ Penjualan baru (green badge)
- ✅ Upload foto berhasil (blue badge)
- ✅ Pelanggan baru (purple badge)
- ✅ Revenue milestone (yellow badge)

**Features:**
- Icon dan warna sesuai jenis aktivitas
- Timestamp relatif ("2 jam yang lalu")
- Detail informasi untuk setiap aktivitas

## 🚀 Cara Menggunakan

### Akses Dashboard
1. Login terlebih dahulu di `/admin/login`
2. Setelah login berhasil, otomatis redirect ke `/admin/dashboard`
3. Dashboard akan menampilkan semua analytics dan statistik

### Navigasi Menu
- Klik menu di sidebar untuk navigasi antar halaman
- Menu yang disabled (Upload, Gallery, Profile) akan menampilkan halaman "Coming Soon"
- Active menu akan highlight dengan background hitam

### Logout
- Klik tombol "Logout" di bagian bawah sidebar
- Akan otomatis redirect ke halaman login

## 📊 Data Mock

Saat ini dashboard menggunakan data mock untuk demo:

```typescript
// Data penjualan 7 bulan
const salesData = [
  { name: "Jan", penjualan: 12, revenue: 4200 },
  { name: "Feb", penjualan: 19, revenue: 6800 },
  // ... dst
];

// Top 5 foto populer
const topPhotos = [
  { name: "Wedding - Couple Shot", views: 245, sales: 15 },
  // ... dst
];
```

**Untuk implementasi real data:**
1. Buat API endpoints untuk fetch statistics
2. Replace mock data dengan data dari database
3. Tambahkan loading states saat fetch data
4. Implement error handling

## 🎯 Routes Structure

```
/admin
├── /login (public)
└── /(dashboard) [protected layout dengan sidebar]
    ├── /dashboard (analytics & charts)
    ├── /upload (coming soon)
    ├── /gallery (coming soon)
    └── /profile (coming soon)
```

## 🎨 Design System

### Colors
- **Primary**: Slate-900 (#0f172a) - untuk buttons, active states
- **Background**: Slate-50 (#f8fafc) - untuk main content area
- **Card**: White - untuk cards dan sidebar
- **Text**: Slate-900 (primary), Slate-600 (secondary), Slate-400 (disabled)
- **Success**: Green-600
- **Error**: Red-600
- **Info**: Blue-600
- **Warning**: Yellow-600

### Typography
- **Heading 1**: text-3xl font-bold (Dashboard title)
- **Heading 2**: text-xl font-semibold (Card titles)
- **Body**: text-sm, text-base
- **Small**: text-xs (descriptions, timestamps)

### Spacing
- **Page padding**: p-8
- **Card gap**: gap-6
- **Internal spacing**: space-y-4, gap-3

## 📱 Responsive Design

Dashboard sudah responsive dengan breakpoints:
- **Mobile** (< 768px): Cards stack vertically, sidebar bisa di-toggle
- **Tablet** (768px - 1024px): 2 columns grid untuk stats cards
- **Desktop** (> 1024px): 4 columns grid untuk stats cards, 2 columns untuk charts

## 🔧 Tech Stack

- **Next.js 15** - Framework
- **React 19** - UI Library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI Components
- **Recharts** - Charts & Graphs
- **Lucide React** - Icons
- **Supabase** - Authentication & Database

## 🚧 Next Steps

Sesuai instruksi, halaman berikut akan dibuat kemudian:
1. **Upload Foto** - Bulk upload dengan drag & drop
2. **Gallery Foto** - Grid view dengan filter & search
3. **Profile Admin** - Edit profile dan settings

Tunggu instruksi untuk implementasi fitur-fitur tersebut.

## 🐛 Troubleshooting

### Dashboard tidak muncul setelah login
- Pastikan sudah login sebagai admin
- Cek console browser untuk error
- Pastikan route `/admin/dashboard` accessible

### Grafik tidak muncul
- Pastikan recharts sudah terinstall: `bun add recharts`
- Clear cache dan restart dev server
- Cek console untuk error dari recharts

### Sidebar menu tidak klik
- Menu dengan badge "Soon" memang disabled
- Hanya menu "Dashboard" yang aktif saat ini

## 📸 Preview Routes

- **Dashboard**: `http://localhost:3000/admin/dashboard`
- **Upload** (placeholder): `http://localhost:3000/admin/upload`
- **Gallery** (placeholder): `http://localhost:3000/admin/gallery`
- **Profile** (placeholder): `http://localhost:3000/admin/profile`
