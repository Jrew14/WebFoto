# 🚀 Supabase Setup - Quick Start Guide

## Langkah 1: Buat Project Supabase

1. **Buka [Supabase](https://app.supabase.com/)**
   - Buat akun atau login
   
2. **Buat Project Baru**
   - Klik "New Project"
   - Organization: Pilih atau buat baru
   - Name: `piksel-jual`
   - Database Password: **Simpan password ini dengan aman!**
   - Region: `Southeast Asia (Singapore)` atau terdekat
   - Pricing Plan: `Free` untuk development
   - Klik "Create new project"

3. **Tunggu Setup Selesai** (~2 menit)

---

## Langkah 2: Dapatkan API Keys

1. **Buka Project Settings**
   - Sidebar → ⚙️ Settings → API

2. **Copy Credentials**
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (panjang)
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (panjang)

---

## Langkah 3: Setup Environment Variables

1. **Buat file `.env.local`** di root project:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** dengan credentials Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Restart development server**:
   ```bash
   bun dev
   ```

---

## Langkah 4: Run Database Migrations

### Via SQL Editor (Recommended untuk pertama kali)

1. **Buka SQL Editor**
   - Sidebar → 🔨 SQL Editor

2. **Run Migration 1 - Database Schema**
   - Buat "New Query"
   - Copy paste seluruh isi file: `supabase/migrations/001_initial_schema.sql`
   - Klik "Run" atau `Ctrl+Enter`
   - ✅ Pastikan sukses tanpa error

3. **Run Migration 2 - Storage Policies**
   - Buat "New Query" baru
   - Copy paste seluruh isi file: `supabase/migrations/002_storage_policies.sql`
   - Klik "Run"
   - ✅ Pastikan sukses

4. **Verify Tables Created**
   - Sidebar → 🗄️ Table Editor
   - Anda harus melihat tables: `profiles`, `events`, `photos`, `purchases`, `bookmarks`

### Via Supabase CLI (Alternative)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref xxxxx

# Push migrations
supabase db push
```

---

## Langkah 5: Setup Authentication

1. **Buka Authentication Settings**
   - Sidebar → 🔐 Authentication → Providers

2. **Email Auth (Sudah enabled by default)**
   - ✅ Enable Email provider
   - Confirm email: `Disabled` (untuk development)
   
3. **Google OAuth (Optional)**
   
   **A. Setup Google Cloud Console:**
   - Buka [Google Cloud Console](https://console.cloud.google.com/)
   - Buat project baru: "Piksel Jual"
   - APIs & Services → OAuth consent screen:
     - User Type: External
     - App name: Piksel Jual
     - User support email: your-email@gmail.com
     - Developer contact: your-email@gmail.com
     - Save
   
   - APIs & Services → Credentials → Create Credentials → OAuth client ID:
     - Application type: Web application
     - Name: Piksel Jual Web
     - Authorized JavaScript origins:
       - `http://localhost:3000`
       - `https://your-domain.com` (production)
     - Authorized redirect URIs:
       - `https://xxxxx.supabase.co/auth/v1/callback`
     - Create
     - **Copy Client ID dan Client Secret**
   
   **B. Configure di Supabase:**
   - Sidebar → Authentication → Providers → Google
   - Enable Google provider
   - Client ID: paste dari Google Cloud Console
   - Client Secret: paste dari Google Cloud Console
   - Save

4. **URL Configuration**
   - Sidebar → Authentication → URL Configuration
   - Site URL: `http://localhost:3000` (development)
   - Redirect URLs: `http://localhost:3000/**`

---

## Langkah 6: Setup Storage Buckets

Storage buckets sudah dibuat via migration, tapi perlu verify:

1. **Buka Storage**
   - Sidebar → 💾 Storage

2. **Verify Buckets Exist**
   - ✅ `photos` (public)
   - ✅ `avatars` (public)

3. **Jika Buckets Belum Ada, Buat Manual:**
   - Click "New bucket"
   - Name: `photos`, Public: ✅, File size limit: 50MB
   - Click "New bucket"
   - Name: `avatars`, Public: ✅, File size limit: 5MB

---

## Langkah 7: Create First Admin User

### Via Supabase Dashboard:

1. **Buka Authentication**
   - Sidebar → 🔐 Authentication → Users
   - Click "Add user" → "Create new user"
   - Email: `admin@pikseljual.com`
   - Password: `admin123456` (ganti dengan password kuat)
   - Auto Confirm User: ✅
   - Click "Create user"
   - **Copy User ID** (UUID)

2. **Insert Profile**
   - Sidebar → Table Editor → `profiles`
   - Click "Insert row"
   - id: paste User ID dari step 1
   - email: `admin@pikseljual.com`
   - full_name: `Admin Photographer`
   - role: `admin`
   - Click "Save"

### Via SQL:

```sql
-- Ganti 'xxx-xxx-xxx' dengan User ID dari Auth Users
INSERT INTO profiles (id, email, full_name, role)
VALUES (
    'xxx-xxx-xxx-xxx-xxx',  -- User ID dari auth.users
    'admin@pikseljual.com',
    'Admin Photographer',
    'admin'
);
```

---

## Langkah 8: Test Connection

1. **Test di App**
   - Jalankan: `bun dev`
   - Buka: `http://localhost:3000`
   - Coba sign in dengan admin credentials

2. **Test via SQL Editor**
   ```sql
   -- Check tables
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   
   -- Check profiles
   SELECT * FROM profiles;
   
   -- Check RLS enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

---

## Langkah 9: Seed Sample Data (Optional)

Untuk testing, Anda bisa insert sample data:

```sql
-- Insert sample event
INSERT INTO events (name, description, event_date, photographer_id)
VALUES (
    'Sample Wedding',
    'John & Jane Wedding Ceremony',
    '2025-06-15',
    'your-admin-user-id'
);

-- Insert sample photos (setelah upload ke storage)
INSERT INTO photos (
    event_id, 
    photographer_id, 
    name, 
    preview_url, 
    full_url, 
    price
)
VALUES (
    'event-id-from-above',
    'your-admin-user-id',
    'wedding_001.jpg',
    'https://xxxxx.supabase.co/storage/v1/object/public/photos/...',
    'https://xxxxx.supabase.co/storage/v1/object/public/photos/...',
    50000
);
```

---

## Langkah 10: Security Checklist

- [ ] `.env.local` ada di `.gitignore`
- [ ] RLS enabled di semua tables
- [ ] Service role key tidak di-commit ke Git
- [ ] Test policies dengan user biasa (bukan admin)
- [ ] Test Google OAuth flow
- [ ] Verify email confirmation setting (disabled untuk dev)

---

## 🎯 Next Steps

Setelah setup selesai, lanjut ke development:

1. **Implement Auth Service** (`src/services/auth.service.ts`)
2. **Update Auth Pages** (signin/signup)
3. **Migrate Event Service**
4. **Migrate Photo Service**
5. **Test end-to-end**

Refer to: `docs/SUPABASE_MIGRATION_CHECKLIST.md` untuk detail tasks.

---

## 🆘 Troubleshooting

### "Invalid API key"
- Check `.env.local` credentials
- Restart dev server after changing env

### "Row Level Security policy violation"
- Check RLS policies di SQL Editor
- Verify user role (admin vs buyer)
- Check `auth.uid()` matches user id

### "Storage upload failed"
- Check bucket exists dan public
- Verify storage policies
- Check file size limits

### "Migration failed"
- Run migrations satu per satu
- Check for existing tables (drop if needed)
- Read error messages di SQL Editor

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Auth](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## ✅ Setup Complete!

Jika semua langkah selesai tanpa error, Supabase Anda sudah siap untuk development! 🎉

**Test dengan:**
```bash
bun dev
# Buka http://localhost:3000
# Try login dengan admin credentials
```
