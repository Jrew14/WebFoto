# 🚀 Next Steps - Piksel Jual Development

## 📊 Current Status

### ✅ Completed
- Frontend pages (Home, Shop, Gallery) dengan mock data
- Navbar dan navigation structure
- Pinterest masonry layout dengan infinite scroll
- Bookmark functionality (UI only)
- Comprehensive Supabase migration plan (200+ checklist items)
- SQL migrations untuk database schema dan storage
- **Drizzle ORM schema dan configuration** ✨

### 🔄 Ready for Implementation
- Supabase project setup
- Drizzle ORM integration
- Service layer dengan real database queries
- Authentication system
- Admin dashboard

---

## 🎯 Immediate Next Steps (Priority 1)

### Step 1: Install Drizzle Dependencies ⚡

```bash
# Install ORM dan database client
bun add drizzle-orm postgres

# Install development tools
bun add -D drizzle-kit
```

**Why:** Drizzle ORM untuk type-safe database queries ke Supabase PostgreSQL.

**Validation:**
```bash
bun list | grep drizzle
# Should show: drizzle-orm, drizzle-kit
```

---

### Step 2: Create Supabase Project 🗄️

1. **Buka Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Click "New Project"

2. **Project Setup**
   - **Organization:** Pilih atau buat baru
   - **Name:** `piksel-jual` (atau nama lain)
   - **Database Password:** Simpan dengan aman! (needed for DATABASE_URL)
   - **Region:** Southeast Asia (Singapore) - untuk latency minimal
   - **Pricing Plan:** Free tier (cukup untuk development)

3. **Wait for Provisioning**
   - Tunggu ~2 menit sampai project ready
   - Status akan berubah dari "Setting up project" → "Ready"

4. **Get Credentials**
   
   **A. API Keys** (Settings → API)
   - `NEXT_PUBLIC_SUPABASE_URL`: https://xxxxx.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - `SUPABASE_SERVICE_ROLE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   **B. Database URL** (Settings → Database → Connection String → URI)
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`
   - Ganti `[YOUR-PASSWORD]` dengan database password dari step 2

---

### Step 3: Setup Environment Variables 🔐

Create `.env.local` di root project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URL for Drizzle
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Security:**
- Add `.env.local` to `.gitignore` ✅ (already done)
- Never commit API keys ke git

---

### Step 4: Run SQL Migrations in Supabase 🏗️

1. **Open SQL Editor**
   - Supabase Dashboard → SQL Editor → "New Query"

2. **Run Schema Migration**
   ```sql
   -- Copy-paste entire content dari:
   -- supabase/migrations/001_initial_schema.sql
   ```
   - Click "Run" atau Ctrl+Enter
   - Should see: "Success. No rows returned"

3. **Run Storage Migration**
   ```sql
   -- Copy-paste entire content dari:
   -- supabase/migrations/002_storage_policies.sql
   ```
   - Click "Run" atau Ctrl+Enter

4. **Verify Tables Created**
   - Table Editor → Should see:
     - ✅ profiles
     - ✅ events
     - ✅ photos
     - ✅ purchases
     - ✅ bookmarks

5. **Verify Storage Buckets**
   - Storage → Should see:
     - ✅ photos (public)
     - ✅ avatars (public)

---

### Step 5: Test Drizzle Connection 🧪

Create test file: `scripts/test-db-connection.ts`

```typescript
import { db } from '@/db';
import { profiles } from '@/db/schema';

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Simple query
    const result = await db.select().from(profiles).limit(1);
    
    console.log('✅ Database connection successful!');
    console.log('📊 Query result:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
```

**Run test:**
```bash
bun run scripts/test-db-connection.ts
```

**Expected output:**
```
🔌 Testing database connection...
✅ Database connection successful!
📊 Query result: []
```

---

### Step 6: Create Admin User (Seed Data) 👤

File: `scripts/seed-admin.ts` already exists, update with Drizzle:

```typescript
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...');

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@piksel-jual.com',
      password: 'Admin123!@#',
      email_confirm: true,
    });

    if (authError) throw authError;

    // Create profile
    await db.insert(profiles).values({
      id: authData.user.id,
      email: 'admin@piksel-jual.com',
      fullName: 'Admin Piksel Jual',
      role: 'admin',
      phone: '081234567890',
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@piksel-jual.com');
    console.log('🔑 Password: Admin123!@#');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedAdmin();
```

**Run seed:**
```bash
bun run scripts/seed-admin.ts
```

---

## 🛠️ Phase 2: Service Layer Implementation (Priority 2)

### 1. Auth Service

**File:** `src/services/auth.service.ts`

**Features:**
- Sign up (buyer registration)
- Sign in (email + password)
- Sign in with Google OAuth
- Sign out
- Get current user
- Password reset

**Status:** 🔴 Not started

---

### 2. Event Service

**File:** `src/services/event.service.ts`

**Features:**
- Create event (admin only)
- Get all events
- Get event by ID
- Get event with photos
- Update event
- Delete event

**Status:** 🔴 Not started

---

### 3. Photo Service

**File:** `src/services/photo.service.ts`

**Features:**
- Upload photo (admin)
- Get all photos (for shop)
- Get photos by event
- Search photos
- Delete photo
- Mark photo as sold

**Status:** 🔴 Not started

---

### 4. Purchase Service

**File:** `src/services/purchase.service.ts`

**Features:**
- Create purchase
- Get user purchases
- Get purchase details
- Payment webhook handler

**Status:** 🔴 Not started

---

### 5. Bookmark Service

**File:** `src/services/bookmark.service.ts`

**Features:**
- Toggle bookmark
- Get user bookmarks
- Check if photo bookmarked

**Status:** 🔴 Not started

---

## 📱 Phase 3: UI Integration (Priority 3)

### Update Pages to Use Real Data

1. **Shop Page** (`src/app/shop/page.tsx`)
   - Replace mock data dengan `photoService.getAllPhotos()`
   - Implement real search dengan `photoService.searchPhotos()`
   - Filter by event dengan `photoService.getPhotosByEvent()`
   - Bookmark toggle dengan `bookmarkService.toggleBookmark()`

2. **Gallery Page** (`src/app/gallery/page.tsx`)
   - Get purchases dengan `purchaseService.getUserPurchases()`
   - Get bookmarks dengan `bookmarkService.getUserBookmarks()`
   - Download button generates signed URL

3. **Auth Pages**
   - Signin → `authService.signIn()`
   - Signup → `authService.signUp()`
   - Verify Email → Handle email verification
   - Forgot Password → `authService.resetPassword()`

4. **Admin Pages**
   - Login → `authService.signIn()` with role check
   - Dashboard → Statistics from database
   - Upload → `photoService.uploadPhoto()` with storage
   - Event → `eventService` CRUD operations
   - Gallery → `photoService` with filters

---

## 🔒 Phase 4: Google OAuth Setup (Priority 4)

### Step 1: Create Google OAuth Credentials

1. Go to: https://console.cloud.google.com
2. Create new project atau pilih existing
3. Enable Google+ API
4. Credentials → Create OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs:
   - Development: `https://xxxxx.supabase.co/auth/v1/callback`
   - Production: `https://your-domain.com/auth/v1/callback`

### Step 2: Configure Supabase

1. Supabase Dashboard → Authentication → Providers
2. Enable Google
3. Add Client ID dan Client Secret
4. Save

### Step 3: Update Auth Pages

Add Google sign-in button:
```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

---

## 📊 Progress Tracking

### Completed Tasks
- [x] Frontend structure (Home, Shop, Gallery)
- [x] Navigation and routing
- [x] UI components dengan shadcn/ui
- [x] Supabase migration planning
- [x] SQL schema creation
- [x] Drizzle ORM schema
- [x] Configuration files

### In Progress
- [ ] Install Drizzle dependencies
- [ ] Create Supabase project
- [ ] Setup environment variables
- [ ] Run SQL migrations
- [ ] Test database connection

### Not Started
- [ ] Service layer implementation (5 services)
- [ ] UI integration dengan real data
- [ ] Google OAuth setup
- [ ] Admin functionality
- [ ] Payment integration
- [ ] Testing suite

---

## ⏱️ Time Estimates

| Phase | Task | Estimated Time |
|-------|------|----------------|
| **Phase 1** | Supabase Setup | 1-2 hours |
| | Drizzle Installation & Testing | 30 minutes |
| **Phase 2** | Auth Service | 3-4 hours |
| | Event Service | 2-3 hours |
| | Photo Service | 3-4 hours |
| | Purchase Service | 2-3 hours |
| | Bookmark Service | 1-2 hours |
| **Phase 3** | Shop Page Integration | 2-3 hours |
| | Gallery Page Integration | 2-3 hours |
| | Auth Pages Integration | 2-3 hours |
| | Admin Pages Integration | 4-6 hours |
| **Phase 4** | Google OAuth | 1-2 hours |
| | Payment Integration | 4-6 hours |
| **Testing** | Unit Tests | 4-6 hours |
| | Integration Tests | 3-4 hours |

**Total Estimated Time:** 35-50 hours (~1-2 weeks untuk 1 developer)

---

## 🚦 Decision Points

### Before Starting Phase 2
- ✅ Drizzle connection working?
- ✅ Admin user dapat login?
- ✅ Database tables correct?

### Before Starting Phase 3
- ✅ All services tested dan working?
- ✅ Authentication flow working?
- ✅ Can create/read data from database?

### Before Production
- ✅ All features tested end-to-end?
- ✅ Payment integration working?
- ✅ Google OAuth working?
- ✅ Error handling comprehensive?
- ✅ Security review completed?

---

## 📚 Reference Documents

- **Setup Guides:**
  - `docs/SUPABASE_SETUP_GUIDE.md` - Supabase project setup
  - `docs/DRIZZLE_SETUP_GUIDE.md` - Drizzle ORM usage
  - `docs/SUPABASE_MIGRATION_CHECKLIST.md` - Complete migration checklist

- **SQL Migrations:**
  - `supabase/migrations/001_initial_schema.sql` - Database schema
  - `supabase/migrations/002_storage_policies.sql` - Storage buckets

- **Schema:**
  - `src/db/schema.ts` - Drizzle ORM schema
  - `src/db/index.ts` - Database instance

- **PRD & Planning:**
  - `docs/prd.md` - Product requirements
  - `docs/plan.md` - Development phases

---

## 🎯 Current Focus

**YOU ARE HERE:** 📍
- Step 1: Install Drizzle dependencies
- Step 2: Create Supabase project
- Step 3: Setup environment variables

**NEXT ACTION:**
```bash
# Install Drizzle
bun add drizzle-orm postgres
bun add -D drizzle-kit

# Then create Supabase project
# https://supabase.com/dashboard
```

Let's build Piksel Jual! 🚀
