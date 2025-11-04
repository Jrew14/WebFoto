# 🚀 Quick Start - Phase 2: Supabase Setup

**Current Status:** Ready to create Supabase project  
**Estimated Time:** 30-60 minutes  
**Date:** 2025-10-27

---

## 📋 What You Need

- [ ] Supabase account (free) - https://supabase.com
- [ ] Email untuk verifikasi
- [ ] `.env.local` file (✅ already created)
- [ ] SQL migrations (✅ already ready)

---

## 🎯 Quick Steps

### 1️⃣ **Create Supabase Project** (5-10 min)

```bash
# Open Supabase Dashboard
Start → https://supabase.com/dashboard
```

**Fill in:**
- **Name:** `piksel-jual`
- **Database Password:** [GENERATE & SAVE!] 🔐
- **Region:** Southeast Asia (Singapore)
- **Plan:** Free

⏰ Wait ~2 minutes for setup...

---

### 2️⃣ **Get Credentials** (5 min)

**In Supabase Dashboard:**

```
Settings → API
```

**Copy 3 values:**
1. ✅ Project URL → `NEXT_PUBLIC_SUPABASE_URL`
2. ✅ anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. ✅ service_role → `SUPABASE_SERVICE_ROLE_KEY`

```
Settings → Database → Connection String → URI
```

4. ✅ Database URI → `DATABASE_URL` (replace [YOUR-PASSWORD])

---

### 3️⃣ **Update .env.local** (5 min)

File sudah dibuat di: `d:\ProjectSoramula\webfoto\.env.local`

**Fill in the empty values:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
DATABASE_URL=postgresql://postgres:YourPassword@db.xxxxx.supabase.co:5432/postgres
```

**Validate:**
```bash
bun run validate:env
```

Should show: ✅ All environment variables are valid!

---

### 4️⃣ **Run SQL Migrations** (5-10 min)

**In Supabase Dashboard:**

```
SQL Editor → New Query
```

**Migration 1 - Database Schema:**
1. Open: `supabase/migrations/001_initial_schema.sql`
2. Copy all content (Ctrl+A, Ctrl+C)
3. Paste into SQL Editor
4. Click **Run** (Ctrl+Enter)
5. Verify: ✅ Success

**Migration 2 - Storage:**
1. Click **New Query**
2. Open: `supabase/migrations/002_storage_policies.sql`
3. Copy all content
4. Paste and **Run**
5. Verify: ✅ Success

---

### 5️⃣ **Verify Setup** (5 min)

**Check Tables:**
```
Table Editor → Should see 5 tables:
✅ profiles
✅ events
✅ photos
✅ purchases
✅ bookmarks
```

**Check Storage:**
```
Storage → Should see 2 buckets:
✅ photos
✅ avatars
```

---

### 6️⃣ **Test Connection** (2 min)

**In VS Code Terminal:**

```bash
bun run db:test
```

**Expected:**
```
✅ Database connection successful!
```

---

### 7️⃣ **Seed Admin User** (2 min)

```bash
bun run seed:admin
```

**Expected:**
```
Admin user ensured.
Email: admin@piksel-jual.com
Password: Admin123!@#
```

**Verify in Supabase:**
- Authentication → Users → 1 user ✅
- Table Editor → profiles → 1 row (role='admin') ✅

---

## ✅ Success Checklist

Before proceeding to Phase 3:

- [ ] Supabase project created
- [ ] All env variables in `.env.local`
- [ ] `bun run validate:env` passes
- [ ] SQL migrations executed
- [ ] 5 tables visible in Table Editor
- [ ] 2 buckets visible in Storage
- [ ] `bun run db:test` passes
- [ ] Admin user created
- [ ] Can see admin in Supabase Auth

---

## 🆘 Need Help?

### If validation fails:
```bash
bun run validate:env
```
Follow the error messages to fix.

### If connection fails:
1. Check DATABASE_URL password
2. Check network connectivity
3. Verify Supabase project is active
4. See: `docs/SUPABASE_SETUP_PROGRESS.md` for troubleshooting

### If migrations fail:
1. Check for syntax errors
2. Ensure fresh project (no existing tables)
3. Try dropping tables and re-run
4. See error message in SQL Editor

---

## 📚 Helpful Commands

```bash
# Validate environment
bun run validate:env

# Test database connection
bun run db:test

# Seed admin user
bun run seed:admin

# Open Drizzle Studio (optional)
bun run db:studio
```

---

## 📖 Documentation

**Detailed guides:**
- `docs/SUPABASE_SETUP_PROGRESS.md` - Step-by-step checklist
- `docs/SUPABASE_SETUP_GUIDE.md` - Complete guide
- `docs/DRIZZLE_SETUP_GUIDE.md` - Drizzle usage
- `docs/NEXT_STEPS.md` - What comes next

---

## ⏭️ What's Next?

**Phase 3:** Service Layer Implementation

After completing Phase 2, kita akan:
1. Create Auth Service (signup, signin, OAuth)
2. Create Event Service (CRUD)
3. Create Photo Service (upload, search)
4. Create Purchase Service (transactions)
5. Create Bookmark Service (toggle, list)

Then connect real data to UI!

---

**Start here:** https://supabase.com/dashboard

**Good luck! 🚀**
