# 🚀 Supabase Setup - Interactive Checklist

**Date Started:** 2025-10-27  
**Status:** In Progress  
**Estimated Time:** 1-2 hours

---

## ✅ Step-by-Step Progress

### 📋 Pre-Setup Checklist
- [x] Drizzle ORM installed
- [x] Schema files created
- [x] `.env.local` template created
- [x] SQL migrations ready
- [ ] Supabase account ready
- [ ] Credit card ready (optional, for removing limits)

---

## 🗄️ STEP 1: Create Supabase Project

**URL:** https://supabase.com/dashboard

### Actions:
1. [ ] Login/Signup ke Supabase
2. [ ] Click **"New Project"** button
3. [ ] Fill in project details:
   ```
   Organization: [Create new atau pilih existing]
   Name: piksel-jual
   Database Password: [GENERATE STRONG PASSWORD - SAVE THIS!]
   Region: Southeast Asia (Singapore)
   Pricing Plan: Free (untuk development)
   ```
4. [ ] Click **"Create new project"**
5. [ ] Wait ~2 minutes untuk provisioning
6. [ ] Verify project status shows "Active/Ready"

**⚠️ IMPORTANT:** Save database password secara aman! Anda akan memerlukannya untuk DATABASE_URL.

**Password saya:** `________________________________`

---

## 🔑 STEP 2: Get API Credentials

**Location:** Your Project → Settings → API

### A. Get Project URL & Keys

1. [ ] Navigate to: **Settings** → **API**
2. [ ] Copy credentials ke `.env.local`:

   **Project URL:**
   ```
   URL: https://xxxxxxxxxxxxx.supabase.co
   ```
   [ ] Copied to `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`

   **anon/public key:**
   ```
   Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   [ ] Copied to `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **service_role key (secret!):**
   ```
   Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   [ ] Copied to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

### B. Get Database Connection String

1. [ ] Navigate to: **Settings** → **Database**
2. [ ] Scroll to: **Connection String** section
3. [ ] Select: **URI** tab
4. [ ] Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. [ ] Replace `[YOUR-PASSWORD]` dengan password dari Step 1
6. [ ] Copied to `.env.local` as `DATABASE_URL`

**Example:**
```env
DATABASE_URL=postgresql://postgres:MyStr0ngP@ssw0rd!@db.abcdefghijk.supabase.co:5432/postgres
```

---

## 🏗️ STEP 3: Run SQL Migrations

**Location:** SQL Editor

### Migration 1: Database Schema

1. [ ] Navigate to: **SQL Editor** → Click **"New Query"**
2. [ ] Open file: `supabase/migrations/001_initial_schema.sql`
3. [ ] Copy **entire content** (Ctrl+A, Ctrl+C)
4. [ ] Paste into SQL Editor
5. [ ] Click **"Run"** button atau press **Ctrl+Enter**
6. [ ] Verify success message: ✅ "Success. No rows returned"

**If error:**
- Check syntax errors
- Ensure fresh project (no existing tables)
- Check SQL editor for error messages

### Migration 2: Storage & Policies

1. [ ] Click **"New Query"** again
2. [ ] Open file: `supabase/migrations/002_storage_policies.sql`
3. [ ] Copy entire content
4. [ ] Paste into SQL Editor
5. [ ] Click **"Run"**
6. [ ] Verify success message: ✅ "Success. No rows returned"

---

## ✅ STEP 4: Verify Database Setup

### A. Check Tables Created

1. [ ] Navigate to: **Table Editor**
2. [ ] Verify these 5 tables exist:
   - [ ] `profiles` (dengan columns: id, email, full_name, role, etc.)
   - [ ] `events` (dengan columns: id, name, event_date, photographer_id, etc.)
   - [ ] `photos` (dengan columns: id, name, price, sold, etc.)
   - [ ] `purchases` (dengan columns: id, buyer_id, photo_id, amount, etc.)
   - [ ] `bookmarks` (dengan columns: id, user_id, photo_id, etc.)

3. [ ] Click pada setiap table, verify columns sesuai schema

### B. Check Storage Buckets

1. [ ] Navigate to: **Storage**
2. [ ] Verify these 2 buckets exist:
   - [ ] `photos` (Public bucket)
   - [ ] `avatars` (Public bucket)

3. [ ] Click pada setiap bucket untuk verify it's accessible

### C. Check RLS Policies

1. [ ] Navigate to: **Authentication** → **Policies**
2. [ ] Verify RLS policies exist untuk setiap table
3. [ ] Should see policies like:
   - "Profiles are viewable by users who created them"
   - "Buyers can view their own purchases"
   - etc.

---

## 🧪 STEP 5: Test Database Connection

**Back to VS Code Terminal:**

1. [ ] Verify `.env.local` filled completely:
   ```bash
   cat .env.local
   ```

2. [ ] Run connection test:
   ```bash
   bun run db:test
   ```

3. [ ] Expected output:
   ```
   🔌 Testing database connection...
   
   Test 1: Basic SELECT query
   ✅ Database connection successful!
   📊 Found 0 profiles in database
   
   Test 2: Count query
   ✅ Total profiles in database: 0
   
   ✅ All tests passed!
   ```

**If connection fails:**
- [ ] Check DATABASE_URL format is correct
- [ ] Verify password doesn't have special characters yang perlu escape
- [ ] Check network connectivity
- [ ] Verify Supabase project is active

---

## 👤 STEP 6: Seed Admin User

1. [ ] Run seed script:
   ```bash
   bun run seed:admin
   ```

2. [ ] Expected output:
   ```
   Admin user ensured.
   Email: admin@piksel-jual.com
   Password: Admin123!@#
   ```

3. [ ] Verify in Supabase:
   - [ ] **Authentication** → **Users** → Should see 1 user
   - [ ] **Table Editor** → **profiles** → Should see 1 row dengan role='admin'

4. [ ] Test admin login:
   - [ ] Go to: http://localhost:3000/admin/login
   - [ ] Login dengan:
     - Email: `admin@piksel-jual.com`
     - Password: `Admin123!@#`
   - [ ] Should redirect to admin dashboard

---

## 🎨 STEP 7: Optional - Drizzle Studio

**Visual Database Browser:**

1. [ ] Run Drizzle Studio:
   ```bash
   bun run db:studio
   ```

2. [ ] Open browser: https://local.drizzle.studio

3. [ ] Explore:
   - [ ] View all tables
   - [ ] Check schema structure
   - [ ] Run test queries
   - [ ] Verify relationships

---

## 📊 Setup Completion Checklist

### Environment Variables ✅
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] `DATABASE_URL` set with correct password
- [ ] `DEFAULT_ADMIN_EMAIL` set
- [ ] `DEFAULT_ADMIN_PASSWORD` set

### Database Setup ✅
- [ ] 5 tables created (profiles, events, photos, purchases, bookmarks)
- [ ] 2 storage buckets created (photos, avatars)
- [ ] RLS policies active
- [ ] Indexes created
- [ ] Triggers active

### Testing ✅
- [ ] Database connection successful
- [ ] Admin user created
- [ ] Can query database
- [ ] Drizzle Studio works (optional)

---

## 🚨 Common Issues & Solutions

### Issue 1: "Connection refused" error
**Solution:**
- Check DATABASE_URL format
- Verify Supabase project is active
- Check network/firewall settings

### Issue 2: "Invalid password" in DATABASE_URL
**Solution:**
- URL encode special characters in password
- Or use simpler password without special chars
- Example: `MyPassword123` instead of `My@P#ssw0rd!`

### Issue 3: "Table already exists" error
**Solution:**
- Drop existing tables in SQL Editor
- Or create new Supabase project
- Run migrations again

### Issue 4: Seed script fails
**Solution:**
- Check SUPABASE_SERVICE_ROLE_KEY is correct
- Verify profiles table exists
- Check admin email format is valid

---

## ✅ Success Criteria

All these should be TRUE before proceeding:

- ✅ Supabase project created dan active
- ✅ All environment variables set in `.env.local`
- ✅ All SQL migrations executed successfully
- ✅ 5 tables visible in Table Editor
- ✅ 2 storage buckets visible in Storage
- ✅ `bun run db:test` passes
- ✅ Admin user created
- ✅ Can login to admin panel

---

## 🎯 What's Next (Phase 3)

After completing Phase 2, kita akan lanjut ke:

1. **Service Layer Implementation:**
   - Auth Service (signup, signin, signout)
   - Event Service (CRUD operations)
   - Photo Service (upload, search, filter)
   - Purchase Service (transactions)
   - Bookmark Service (toggle, list)

2. **UI Integration:**
   - Connect `/shop` to real data
   - Connect `/gallery` to purchases & bookmarks
   - Connect auth pages to Supabase Auth
   - Update admin pages dengan real data

---

## 📝 Notes & Observations

**Issues encountered:**
- 

**Solutions applied:**
- 

**Time taken:**
- 

**Ready for Phase 3?** [ ] Yes / [ ] No

---

**Last Updated:** 2025-10-27  
**Completed By:** _______________  
**Status:** ⏳ In Progress
