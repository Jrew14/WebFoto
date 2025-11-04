# ✅ Drizzle ORM Setup Completed

## 📦 What Was Done

### 1. Dependencies Installed

```bash
✅ drizzle-orm@0.44.7 - TypeScript ORM runtime
✅ postgres@3.4.7 - PostgreSQL client for Node.js
✅ drizzle-kit@0.31.5 - CLI tools untuk migrations dan schema management
```

**Installation command:**
```bash
bun add drizzle-orm postgres
bun add -D drizzle-kit
```

---

### 2. Schema Created

**File:** `src/db/schema.ts`

**Tables:**
- ✅ `profiles` - User profiles (admin & buyer) dengan RLS
- ✅ `events` - Photography events dengan foreign key ke photographer
- ✅ `photos` - Photos dengan metadata, pricing, dan sold status
- ✅ `purchases` - Purchase transactions dengan payment tracking
- ✅ `bookmarks` - User bookmarked photos

**Features:**
- ✅ Type-safe schema dengan TypeScript
- ✅ Foreign key relationships dengan cascade deletes
- ✅ Indexes untuk performance optimization
- ✅ Enums untuk role ('admin' | 'buyer') dan payment_status
- ✅ Auto-generated TypeScript types (NewProfile, Profile, etc.)
- ✅ Relations untuk easy joins

---

### 3. Database Instance

**File:** `src/db/index.ts`

**Configuration:**
- ✅ PostgreSQL client dengan DATABASE_URL dari environment
- ✅ Drizzle instance dengan schema imported
- ✅ Max connections: 10
- ✅ Prepare mode disabled (for Supabase compatibility)
- ✅ Type-safe database export

---

### 4. Drizzle Kit Config

**File:** `drizzle.config.ts`

**Settings:**
- ✅ Schema path: `./src/db/schema.ts`
- ✅ Output directory: `./drizzle`
- ✅ Dialect: PostgreSQL
- ✅ Database credentials dari environment
- ✅ Tables filter untuk 5 tables
- ✅ Verbose dan strict mode enabled

---

### 5. Scripts & Commands

**Added to package.json:**

```json
{
  "db:generate": "bunx drizzle-kit generate",  // Generate migrations
  "db:migrate": "bunx drizzle-kit migrate",    // Run migrations
  "db:push": "bunx drizzle-kit push",          // Push schema to DB
  "db:studio": "bunx drizzle-kit studio",      // Open DB GUI
  "db:test": "bun scripts/test-db-connection.ts", // Test connection
  "seed:admin": "bun scripts/seed-admin.ts"    // Seed admin user
}
```

**New files:**
- ✅ `scripts/test-db-connection.ts` - Test database connectivity
- ✅ `scripts/seed-admin.ts` - Already exists, ready to use

---

### 6. Documentation Created

**Guides:**
- ✅ `docs/DRIZZLE_SETUP_GUIDE.md` - Complete Drizzle usage guide
- ✅ `docs/NEXT_STEPS.md` - Step-by-step implementation plan
- ✅ `docs/SUPABASE_SETUP_GUIDE.md` - Supabase project setup
- ✅ `docs/SUPABASE_MIGRATION_CHECKLIST.md` - 200+ migration tasks

**SQL Migrations:**
- ✅ `supabase/migrations/001_initial_schema.sql` - Database schema
- ✅ `supabase/migrations/002_storage_policies.sql` - Storage buckets

---

## 🎯 Current Status

### ✅ Completed
- [x] Install Drizzle dependencies
- [x] Create schema definition
- [x] Setup database instance
- [x] Configure Drizzle Kit
- [x] Create test scripts
- [x] Update package.json scripts
- [x] Write comprehensive documentation

### 🟡 Ready to Execute (Needs Supabase Project)
- [ ] Create Supabase project
- [ ] Setup `.env.local` with credentials
- [ ] Run SQL migrations in Supabase
- [ ] Test database connection
- [ ] Seed admin user

### 🔴 Not Started (Depends on Database)
- [ ] Implement service layer (5 services)
- [ ] Update UI to use real data
- [ ] Setup Google OAuth
- [ ] Payment integration
- [ ] Testing suite

---

## 🚀 Next Steps

### Step 1: Create Supabase Project

**Go to:** https://supabase.com/dashboard

1. Click "New Project"
2. Fill in:
   - **Organization:** Choose or create
   - **Name:** `piksel-jual`
   - **Database Password:** ⚠️ SAVE THIS! (needed for DATABASE_URL)
   - **Region:** Southeast Asia (Singapore)
   - **Plan:** Free tier
3. Wait ~2 minutes for provisioning

---

### Step 2: Get Credentials

**In Supabase Dashboard:**

**A. API Settings** (Settings → API)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**B. Database URL** (Settings → Database → Connection String → URI)
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```
⚠️ Replace `[YOUR-PASSWORD]` dengan password dari Step 1

---

### Step 3: Create `.env.local`

**In project root:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URL for Drizzle
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Credentials (optional, for seed script)
DEFAULT_ADMIN_EMAIL=admin@piksel-jual.com
DEFAULT_ADMIN_PASSWORD=Admin123!@#
```

---

### Step 4: Run SQL Migrations

**In Supabase Dashboard:**

1. Go to: **SQL Editor** → **New Query**

2. **First Migration** (Schema):
   - Copy content from: `supabase/migrations/001_initial_schema.sql`
   - Paste into SQL Editor
   - Click **Run** atau Ctrl+Enter
   - Should see: ✅ "Success. No rows returned"

3. **Second Migration** (Storage):
   - Copy content from: `supabase/migrations/002_storage_policies.sql`
   - Paste into SQL Editor
   - Click **Run**
   - Should see: ✅ "Success. No rows returned"

4. **Verify Tables Created**:
   - Go to: **Table Editor**
   - Should see 5 tables:
     - ✅ profiles
     - ✅ events
     - ✅ photos
     - ✅ purchases
     - ✅ bookmarks

5. **Verify Storage Buckets**:
   - Go to: **Storage**
   - Should see 2 buckets:
     - ✅ photos (public)
     - ✅ avatars (public)

---

### Step 5: Test Database Connection

```bash
# Test connection
bun run db:test
```

**Expected output:**
```
🔌 Testing database connection...

Test 1: Basic SELECT query
✅ Database connection successful!
📊 Found 0 profiles in database

Test 2: Count query
✅ Total profiles in database: 0

✅ All tests passed!

📝 Next steps:
1. Run SQL migrations in Supabase SQL Editor
2. Run: bun run seed:admin
3. Check database connection again
```

**If error:**
- ❌ Check `.env.local` exists dengan correct credentials
- ❌ Verify Supabase project is active
- ❌ Ensure SQL migrations ran successfully
- ❌ Check network connectivity

---

### Step 6: Seed Admin User

```bash
# Create admin user
bun run seed:admin
```

**Expected output:**
```
Admin user ensured.
Email: admin@piksel-jual.com
Password: Admin123!@#
```

**Verify in Supabase:**
1. Go to: **Authentication** → **Users**
2. Should see 1 user with email `admin@piksel-jual.com`
3. Go to: **Table Editor** → **profiles**
4. Should see 1 profile dengan role = 'admin'

---

### Step 7: Open Drizzle Studio (Optional)

```bash
# Open database GUI
bun run db:studio
```

- Opens browser: https://local.drizzle.studio
- Visual interface untuk browse tables
- Run queries visually
- See schema relationships

---

## 📚 Usage Examples

### Basic Queries

```typescript
import { db } from '@/db';
import { events, photos } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// Get all events
const allEvents = await db.select().from(events);

// Get event by ID
const event = await db
  .select()
  .from(events)
  .where(eq(events.id, eventId))
  .limit(1);

// Get photos with event details
const photosWithEvent = await db
  .select({
    photo: photos,
    event: events,
  })
  .from(photos)
  .leftJoin(events, eq(photos.eventId, events.id))
  .orderBy(desc(photos.createdAt));
```

### Insert Data

```typescript
import type { NewEvent, NewPhoto } from '@/db/schema';

// Insert event
const newEvent: NewEvent = {
  name: 'Wedding Ceremony',
  description: 'Beautiful wedding',
  eventDate: new Date('2025-06-15'),
  photographerId: userId,
};

const [event] = await db
  .insert(events)
  .values(newEvent)
  .returning();

// Insert photo
const newPhoto: NewPhoto = {
  eventId: event.id,
  photographerId: userId,
  name: 'IMG_001.jpg',
  previewUrl: 'https://...',
  fullUrl: 'https://...',
  watermarkUrl: 'https://...',
  price: 50000,
};

await db.insert(photos).values(newPhoto);
```

### Update & Delete

```typescript
// Update event
await db
  .update(events)
  .set({ 
    name: 'Updated Name',
    updatedAt: new Date(),
  })
  .where(eq(events.id, eventId));

// Delete event (cascade delete photos)
await db
  .delete(events)
  .where(eq(events.id, eventId));
```

### Transactions

```typescript
await db.transaction(async (tx) => {
  // Create purchase
  await tx.insert(purchases).values({
    buyerId: userId,
    photoId: photoId,
    amount: 50000,
    paymentStatus: 'success',
  });

  // Mark photo as sold
  await tx
    .update(photos)
    .set({ sold: true })
    .where(eq(photos.id, photoId));
});
```

---

## 🎓 Learning Resources

**Drizzle ORM:**
- Docs: https://orm.drizzle.team
- Queries: https://orm.drizzle.team/docs/select
- Relations: https://orm.drizzle.team/docs/rqb
- PostgreSQL: https://orm.drizzle.team/docs/get-started-postgresql

**Supabase + Drizzle:**
- Guide: https://orm.drizzle.team/docs/get-started-postgresql#supabase
- Best Practices: https://supabase.com/docs/guides/database

---

## ⏭️ After Setup Complete

Once Supabase project is ready and database connected:

### Priority 1: Service Layer
1. **Auth Service** (`src/services/auth.service.ts`)
   - Sign up, sign in, sign out
   - Google OAuth
   - Password reset

2. **Event Service** (`src/services/event.service.ts`)
   - CRUD operations
   - Get events with photos
   - Filter by photographer

3. **Photo Service** (`src/services/photo.service.ts`)
   - Upload with Supabase Storage
   - Search and filter
   - Mark as sold

4. **Purchase Service** (`src/services/purchase.service.ts`)
   - Create purchase
   - Payment webhook
   - Get user purchases

5. **Bookmark Service** (`src/services/bookmark.service.ts`)
   - Toggle bookmark
   - Get user bookmarks
   - Check bookmark status

### Priority 2: UI Integration
- Update `/shop` page dengan real data
- Update `/gallery` page dengan purchases & bookmarks
- Connect auth pages to Supabase Auth
- Admin dashboard dengan real statistics

### Priority 3: Advanced Features
- Google OAuth integration
- Payment gateway (Midtrans/Xendit)
- File upload dengan watermark generation
- Email notifications
- Testing suite

---

## 📊 Progress Summary

```
Phase 1: Drizzle Setup ........................... ✅ 100% DONE
├─ Install dependencies ......................... ✅
├─ Create schema ................................ ✅
├─ Setup database instance ...................... ✅
├─ Configure Drizzle Kit ........................ ✅
├─ Create scripts ............................... ✅
└─ Write documentation .......................... ✅

Phase 2: Supabase Setup .......................... ⏳ 0% WAITING
├─ Create project ............................... ⏳
├─ Get credentials .............................. ⏳
├─ Setup .env.local ............................. ⏳
├─ Run migrations ............................... ⏳
├─ Test connection .............................. ⏳
└─ Seed admin ................................... ⏳

Phase 3: Service Layer ........................... ⏳ 0% NOT STARTED
Phase 4: UI Integration .......................... ⏳ 0% NOT STARTED
Phase 5: Advanced Features ....................... ⏳ 0% NOT STARTED
```

**Overall Progress:** 20% (1/5 phases complete)

---

## 🎯 YOU ARE HERE 📍

**Just completed:**
- ✅ Drizzle ORM installation
- ✅ Schema and configuration setup
- ✅ Scripts and documentation

**Next action:**
1. Create Supabase project at https://supabase.com/dashboard
2. Get credentials (URL, keys, DATABASE_URL)
3. Create `.env.local` file
4. Run SQL migrations
5. Test connection: `bun run db:test`
6. Seed admin: `bun run seed:admin`

**Ready to proceed!** 🚀

See detailed steps in: `docs/NEXT_STEPS.md`
