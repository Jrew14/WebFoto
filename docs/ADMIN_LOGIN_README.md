# Halaman Login Admin - WebFoto

## 🎯 Overview
Halaman login admin yang telah dibuat dengan form username/password untuk autentikasi admin menggunakan Supabase Auth.

## 📁 File yang Dibuat

### Frontend
- `src/app/admin/login/page.tsx` - Halaman login admin dengan form
- `src/app/admin/dashboard/page.tsx` - Dashboard admin (protected route)
- `src/app/admin/page.tsx` - Redirect ke login

### Backend & Auth
- `src/app/api/admin/auth/login/route.ts` - API endpoint untuk login
- `src/app/api/admin/auth/logout/route.ts` - API endpoint untuk logout
- `src/lib/supabase/server.ts` - Supabase server client
- `src/lib/supabase/client.ts` - Supabase browser client
- `src/middleware.ts` - Middleware untuk proteksi route admin

### Components (dari shadcn)
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/card.tsx`

## 🚀 Setup

### 1. Install Dependencies
```bash
bun install
```

### 2. Setup Environment Variables
Buat file `.env.local` dan isi dengan credentials Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

DEFAULT_ADMIN_EMAIL=admin@gmail.com
DEFAULT_ADMIN_PASSWORD=admin123
```

### 3. Setup Database
Buat table `profiles` di Supabase dengan SQL berikut:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy untuk admin bisa baca semua profiles
CREATE POLICY "Admin can read all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy untuk user bisa baca profile sendiri
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);
```

### 4. Seed Admin User
Jalankan script untuk membuat user admin:

```bash
bun run seed:admin
```

### 5. Jalankan Development Server
```bash
bun dev
```

Server akan berjalan di `http://localhost:3000`

## 🔐 Cara Menggunakan

### Login sebagai Admin
1. Buka browser dan kunjungi: `http://localhost:3000/admin/login`
2. Masukkan credentials:
   - **Username/Email**: `admin@gmail.com` (atau email yang Anda set di .env)
   - **Password**: `admin123` (atau password yang Anda set di .env)
3. Klik tombol "Login"
4. Jika berhasil, akan redirect ke `/admin/dashboard`

### Flow Authentication
- ✅ Route `/admin/login` - Halaman login (redirect ke dashboard jika sudah login)
- ✅ Route `/admin/dashboard` - Protected route, perlu login sebagai admin
- ✅ Middleware otomatis redirect user yang belum login ke halaman login
- ✅ Middleware otomatis redirect admin yang sudah login dari halaman login ke dashboard

## 🎨 Features

### Halaman Login
- ✅ Form dengan username/email dan password
- ✅ Validasi client-side (required fields)
- ✅ Loading state saat submit
- ✅ Error handling dengan pesan error yang jelas
- ✅ UI modern dengan shadcn components
- ✅ Responsive design

### Security
- ✅ Menggunakan Supabase Auth untuk autentikasi
- ✅ Role-based access control (hanya admin yang bisa akses dashboard)
- ✅ Protected routes dengan middleware
- ✅ Session management otomatis
- ✅ Logout functionality

## 📝 Next Steps

Untuk implementasi fitur selanjutnya sesuai plan:
1. ADM-002: Seller onboarding
2. ADM-003: Bulk photo upload pipeline
3. ADM-004: Media management dashboard
4. Dan seterusnya...

## 🐛 Troubleshooting

### Error: "Supabase environment variables are incomplete"
- Pastikan file `.env.local` sudah dibuat dan berisi semua environment variables

### Error: "Username atau password salah"
- Pastikan sudah menjalankan `bun run seed:admin`
- Cek credentials di file `.env.local`

### Error: "Akses ditolak. Anda bukan admin"
- Pastikan user memiliki role `admin` di table `profiles`
- Jalankan ulang seed script

## 🔗 Routes

| Route | Akses | Deskripsi |
|-------|-------|-----------|
| `/admin` | Public | Auto redirect ke `/admin/login` |
| `/admin/login` | Public | Halaman login admin |
| `/admin/dashboard` | Protected (Admin) | Dashboard admin |
| `/api/admin/auth/login` | API | Endpoint login |
| `/api/admin/auth/logout` | API | Endpoint logout |
