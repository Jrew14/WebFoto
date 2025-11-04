# Tasklist Migrasi dari DexieJS ke Supabase

## 📋 Overview
Migrasi dari DexieJS (IndexedDB local storage) ke Supabase (PostgreSQL cloud database) untuk aplikasi Piksel Jual.

---

## 🔧 1. Setup & Konfigurasi Supabase

### 1.1 Buat Project Supabase
- [ ] Buat akun di [supabase.com](https://supabase.com)
- [ ] Buat project baru "piksel-jual"
- [ ] Pilih region terdekat (Southeast Asia - Singapore)
- [ ] Simpan database password dengan aman

### 1.2 Environment Variables
- [ ] Buat file `.env.local` di root project
- [ ] Tambahkan variabel berikut:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```
- [ ] Tambahkan `.env.local` ke `.gitignore`
- [ ] Buat `.env.example` sebagai template tanpa value

### 1.3 Install Dependencies (Sudah ada, cek versi)
- [ ] Verifikasi `@supabase/supabase-js` sudah terinstall
- [ ] Verifikasi `@supabase/ssr` sudah terinstall
- [ ] Cek `package.json` untuk memastikan versi terbaru

---

## 🗄️ 2. Database Schema & Tables

### 2.1 Tabel Profiles (Users)
- [ ] Buat tabel `profiles`:
  ```sql
  CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('admin', 'buyer')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] Enable Row Level Security (RLS)
- [ ] Buat policy untuk read/update own profile
- [ ] Buat trigger untuk auto-update `updated_at`

### 2.2 Tabel Events
- [ ] Buat tabel `events`:
  ```sql
  CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    photographer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] Enable RLS
- [ ] Policy: Admin bisa CRUD, buyer bisa read
- [ ] Index pada `photographer_id` dan `event_date`
- [ ] Trigger untuk `updated_at`

### 2.3 Tabel Photos
- [ ] Buat tabel `photos`:
  ```sql
  CREATE TABLE photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    photographer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    preview_url TEXT NOT NULL,
    full_url TEXT NOT NULL,
    watermark_url TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    sold BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] Enable RLS
- [ ] Policy: Admin upload/delete, buyer read unsold
- [ ] Index pada `event_id`, `photographer_id`, `sold`
- [ ] Trigger untuk `updated_at`

### 2.4 Tabel Purchases
- [ ] Buat tabel `purchases`:
  ```sql
  CREATE TABLE purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed')),
    transaction_id TEXT UNIQUE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(buyer_id, photo_id)
  );
  ```
- [ ] Enable RLS
- [ ] Policy: User bisa read own purchases, admin read all
- [ ] Index pada `buyer_id`, `photo_id`, `payment_status`

### 2.5 Tabel Bookmarks
- [ ] Buat tabel `bookmarks`:
  ```sql
  CREATE TABLE bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, photo_id)
  );
  ```
- [ ] Enable RLS
- [ ] Policy: User bisa CRUD own bookmarks
- [ ] Index pada `user_id`, `photo_id`

---

## 📦 3. Storage Buckets

### 3.1 Bucket untuk Photos
- [ ] Buat bucket `photos` di Supabase Storage
- [ ] Set bucket sebagai public
- [ ] Buat folder structure: `{photographer_id}/{event_id}/`
- [ ] Buat policy upload untuk admin
- [ ] Buat policy read public

### 3.2 Bucket untuk Avatars
- [ ] Buat bucket `avatars` di Supabase Storage
- [ ] Set sebagai public
- [ ] Policy: User bisa upload own avatar
- [ ] Policy: Public read

---

## 🔐 4. Authentication Setup

### 4.1 Supabase Auth Configuration
- [ ] Enable Email/Password authentication
- [ ] Enable Google OAuth provider:
  - [ ] Buat Google Cloud Project
  - [ ] Setup OAuth consent screen
  - [ ] Buat OAuth 2.0 Client ID
  - [ ] Tambahkan credentials ke Supabase
- [ ] Konfigurasi redirect URLs
- [ ] Disable email confirmation untuk development (opsional)
- [ ] Setup email templates (welcome, reset password)

### 4.2 Auth Helper Functions
- [ ] Update `src/lib/supabase/client.ts`:
  ```typescript
  import { createBrowserClient } from '@supabase/ssr'
  
  export function createClient() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  ```
- [ ] Update `src/lib/supabase/server.ts` untuk server components
- [ ] Buat middleware untuk auth check

---

## 🔄 5. Migrasi Service Layer

### 5.1 Auth Service
- [ ] Buat `src/services/auth.service.ts`:
  - [ ] `signUp(email, password, fullName)` - Register user
  - [ ] `signIn(email, password)` - Login
  - [ ] `signInWithGoogle()` - Google OAuth
  - [ ] `signOut()` - Logout
  - [ ] `getCurrentUser()` - Get session
  - [ ] `updateProfile(data)` - Update user profile
  - [ ] `resetPassword(email)` - Send reset email

### 5.2 Event Service (Update)
- [ ] Update `src/services/event.service.ts`:
  - [ ] Replace DexieJS dengan Supabase queries
  - [ ] `getAllEvents()` - Fetch dengan photos count
  - [ ] `getEventById(id)` - Fetch dengan photos
  - [ ] `createEvent(data)` - Admin only
  - [ ] `updateEvent(id, data)` - Admin only
  - [ ] `deleteEvent(id)` - Admin only dengan cascade
  - [ ] `getEventsByPhotographer(photographerId)`

### 5.3 Photo Service (Update)
- [ ] Update `src/services/photo.service.ts`:
  - [ ] `getAllPhotos()` - Fetch dengan event & photographer
  - [ ] `getPhotosByEvent(eventId)`
  - [ ] `uploadPhoto(file, eventId, metadata)` - Upload ke Storage + DB
  - [ ] `deletePhoto(id)` - Delete dari Storage + DB
  - [ ] `updatePhoto(id, data)`
  - [ ] `searchPhotos(query)` - Full-text search
  - [ ] `getPhotoWithDetails(id)` - Fetch dengan relasi

### 5.4 Purchase Service (Baru)
- [ ] Buat `src/services/purchase.service.ts`:
  - [ ] `createPurchase(photoId, amount, paymentMethod)`
  - [ ] `getUserPurchases(userId)` - Fetch purchased photos
  - [ ] `verifyPurchase(purchaseId)` - Update payment status
  - [ ] `getPhotoDownloadUrl(photoId)` - Check ownership + generate URL
  - [ ] `getPurchaseStats(userId)` - Analytics

### 5.5 Bookmark Service (Baru)
- [ ] Buat `src/services/bookmark.service.ts`:
  - [ ] `toggleBookmark(photoId)` - Add/remove bookmark
  - [ ] `getUserBookmarks(userId)` - Fetch bookmarked photos
  - [ ] `isPhotoBookmarked(photoId, userId)` - Check status
  - [ ] `removeBookmark(photoId, userId)`

---

## 🎨 6. Update UI Components

### 6.1 Auth Pages
- [ ] Update `/auth/signin/page.tsx`:
  - [ ] Ganti mock auth dengan `auth.service.signIn()`
  - [ ] Handle error dari Supabase
  - [ ] Redirect setelah login sukses
  - [ ] Tambahkan loading state

- [ ] Update `/auth/signup/page.tsx`:
  - [ ] Ganti mock dengan `auth.service.signUp()`
  - [ ] Auto-create profile di `profiles` table
  - [ ] Handle validation errors
  - [ ] Email verification flow (opsional)

- [ ] Implement Google OAuth:
  - [ ] Button call `auth.service.signInWithGoogle()`
  - [ ] Handle callback di `/auth/callback`

### 6.2 Shop Page
- [ ] Update `/shop/page.tsx`:
  - [ ] Replace mock data dengan `photo.service.getAllPhotos()`
  - [ ] Fetch photos dengan event info
  - [ ] Implement real-time bookmark toggle
  - [ ] Check user authentication untuk bookmark
  - [ ] Show login prompt jika belum login

### 6.3 Gallery Page
- [ ] Update `/gallery/page.tsx`:
  - [ ] Fetch user purchases: `purchase.service.getUserPurchases()`
  - [ ] Fetch user bookmarks: `bookmark.service.getUserBookmarks()`
  - [ ] Real-time updates dengan Supabase subscriptions
  - [ ] Implement download button untuk purchased photos
  - [ ] Protected route (require authentication)

### 6.4 Admin Pages
- [ ] Update `/admin/event/page.tsx`:
  - [ ] Fetch events dengan `event.service`
  - [ ] CRUD operations dengan real data
  - [ ] Handle image uploads

- [ ] Update `/admin/upload/page.tsx`:
  - [ ] Upload ke Supabase Storage
  - [ ] Create photo records di database
  - [ ] Batch upload support
  - [ ] Progress indicator

- [ ] Update `/admin/gallery/page.tsx`:
  - [ ] Fetch admin photos
  - [ ] Delete functionality
  - [ ] Edit metadata

### 6.5 Navbar & Session
- [ ] Update `PublicNavbar`:
  - [ ] Show user avatar jika logged in
  - [ ] Dropdown menu: Profile, Gallery, Logout
  - [ ] Dynamic menu berdasarkan auth state

- [ ] Create `AuthProvider` context:
  - [ ] Manage user session
  - [ ] Provide auth state ke semua components
  - [ ] Auto-refresh session

---

## 🔒 7. Middleware & Protection

### 7.1 Auth Middleware
- [ ] Update `src/middleware.ts`:
  - [ ] Check Supabase session
  - [ ] Protect `/admin/*` routes (hanya admin)
  - [ ] Protect `/gallery` (require login)
  - [ ] Redirect ke `/auth/signin` jika tidak authenticated

### 7.2 API Routes Protection
- [ ] Buat `/api/admin/*` routes:
  - [ ] Verify admin role di setiap request
  - [ ] Return 401/403 jika unauthorized

---

## 🧪 8. Testing & Validation

### 8.1 Database Testing
- [ ] Test semua CRUD operations
- [ ] Test RLS policies dengan different users
- [ ] Test cascade deletes
- [ ] Test unique constraints
- [ ] Load testing dengan banyak data

### 8.2 Auth Testing
- [ ] Test sign up flow
- [ ] Test sign in (email/password)
- [ ] Test Google OAuth
- [ ] Test sign out
- [ ] Test session persistence
- [ ] Test password reset

### 8.3 Storage Testing
- [ ] Test photo upload (berbagai format)
- [ ] Test file size limits
- [ ] Test public access URLs
- [ ] Test deletion cascade

### 8.4 Integration Testing
- [ ] Test bookmark toggle
- [ ] Test purchase flow
- [ ] Test photo download setelah purchase
- [ ] Test filter & search
- [ ] Test pagination & infinite scroll

---

## 📊 9. Data Migration (Jika ada data existing)

### 9.1 Export dari DexieJS
- [ ] Buat script export data dari IndexedDB
- [ ] Save sebagai JSON files

### 9.2 Import ke Supabase
- [ ] Buat migration script
- [ ] Transform data format jika perlu
- [ ] Bulk insert ke Supabase
- [ ] Verify data integrity

---

## 🚀 10. Deployment & Production

### 10.1 Environment Setup
- [ ] Setup environment variables di Vercel/hosting:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

### 10.2 Database Production
- [ ] Enable connection pooling
- [ ] Setup backups otomatis
- [ ] Monitor database performance
- [ ] Set up alerts

### 10.3 Security Audit
- [ ] Review semua RLS policies
- [ ] Audit API routes
- [ ] Check environment variables tidak leak
- [ ] Test dengan different user roles

---

## 🎯 11. Optimization & Features

### 11.1 Performance
- [ ] Implement caching strategy
- [ ] Optimize image loading (lazy load)
- [ ] Implement CDN untuk images
- [ ] Database query optimization
- [ ] Add indexes untuk common queries

### 11.2 Real-time Features
- [ ] Setup Supabase Realtime subscriptions:
  - [ ] New photos notification
  - [ ] Bookmark updates
  - [ ] Purchase notifications untuk admin

### 11.3 Analytics
- [ ] Track popular photos
- [ ] Track purchase conversion
- [ ] User engagement metrics
- [ ] Admin dashboard dengan statistics

---

## 📝 12. Documentation

### 12.1 Code Documentation
- [ ] Document semua service functions
- [ ] Add JSDoc comments
- [ ] Create API documentation

### 12.2 User Documentation
- [ ] User guide untuk buyers
- [ ] Admin guide untuk photographers
- [ ] FAQ section

### 12.3 Developer Documentation
- [ ] Setup instructions di README
- [ ] Database schema diagram
- [ ] Architecture overview
- [ ] Deployment guide

---

## ✅ Checklist Summary

**Priority 1 - Critical (Harus selesai dulu):**
- [ ] Setup Supabase project & environment variables
- [ ] Create database schema & tables
- [ ] Setup authentication
- [ ] Migrate auth service
- [ ] Update auth pages (signin/signup)

**Priority 2 - Core Features:**
- [ ] Setup Storage buckets
- [ ] Migrate event & photo services
- [ ] Update shop page dengan real data
- [ ] Implement bookmark service
- [ ] Implement purchase service

**Priority 3 - Admin Features:**
- [ ] Update admin pages
- [ ] Photo upload functionality
- [ ] Event management

**Priority 4 - Enhancement:**
- [ ] Real-time features
- [ ] Analytics
- [ ] Optimization
- [ ] Documentation

---

## 🔗 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)
- [Realtime](https://supabase.com/docs/guides/realtime)

---

## 📞 Next Steps

1. **Setup Supabase Project** - Buat project dan dapatkan credentials
2. **Environment Variables** - Setup `.env.local`
3. **Database Schema** - Run SQL migrations
4. **Auth Implementation** - Start dengan signin/signup
5. **Iterative Migration** - Migrate service by service

**Estimasi Waktu Total: 2-3 minggu** (tergantung kompleksitas dan testing)
