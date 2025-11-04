# 🎯 Piksel Jual - Quick Reference

## 📦 Project Info

**Name:** Piksel Jual  
**Type:** Photo Marketplace Platform  
**Tech Stack:** Next.js 15 + Supabase + Drizzle ORM + TypeScript  
**Runtime:** Bun  
**Status:** Development (Phase 1 Complete)

---

## 🚀 Quick Commands

### Development
```bash
bun dev                # Start dev server (localhost:3000)
bun build              # Build for production
bun start              # Start production server
bun lint               # Run ESLint
```

### Database
```bash
bun run db:test        # Test database connection
bun run db:studio      # Open Drizzle Studio GUI
bun run db:push        # Push schema to database
bun run seed:admin     # Create admin user
```

---

## 📁 Important Files

### Configuration
- `drizzle.config.ts` - Drizzle ORM config
- `components.json` - shadcn/ui config
- `next.config.ts` - Next.js config
- `tsconfig.json` - TypeScript config
- `.env.local` - Environment variables (CREATE THIS!)

### Schema & Database
- `src/db/schema.ts` - Drizzle schema (5 tables)
- `src/db/index.ts` - Database instance
- `supabase/migrations/001_initial_schema.sql` - SQL schema
- `supabase/migrations/002_storage_policies.sql` - Storage setup

### Scripts
- `scripts/test-db-connection.ts` - Test DB
- `scripts/seed-admin.ts` - Seed admin user

### Documentation
- `docs/prd.md` - Product requirements
- `docs/plan.md` - Development plan
- `docs/NEXT_STEPS.md` - Implementation guide
- `docs/DRIZZLE_SETUP_GUIDE.md` - Drizzle usage
- `docs/SUPABASE_SETUP_GUIDE.md` - Supabase setup

---

## 🗄️ Database Schema

### Tables
1. **profiles** - User profiles (admin & buyer)
2. **events** - Photography events
3. **photos** - Photos with pricing
4. **purchases** - Transactions
5. **bookmarks** - User bookmarks

### Relationships
```
profiles (photographer) → events → photos
profiles (buyer) → purchases → photos
profiles (user) → bookmarks → photos
```

---

## 🌐 Routes

### Public
- `/` - Landing page
- `/home` - Main home page
- `/shop` - Browse photos (Get Your Photo)
- `/gallery` - User gallery (purchased + bookmarked)

### Auth
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/auth/verify-email` - Email verification
- `/auth/forgot-password` - Password reset

### Admin
- `/admin/login` - Admin login
- `/admin/dashboard` - Dashboard (stats)
- `/admin/event` - Manage events
- `/admin/upload` - Upload photos
- `/admin/gallery` - Manage photos
- `/admin/profile` - Admin profile

---

## 🔑 Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin (optional)
DEFAULT_ADMIN_EMAIL=admin@piksel-jual.com
DEFAULT_ADMIN_PASSWORD=Admin123!@#
```

---

## 📚 Code Snippets

### Import Database
```typescript
import { db } from '@/db';
import { profiles, events, photos, purchases, bookmarks } from '@/db/schema';
import { eq, and, or, desc, like } from 'drizzle-orm';
```

### Query Examples
```typescript
// Select all events
const events = await db.select().from(events);

// Select with condition
const event = await db
  .select()
  .from(events)
  .where(eq(events.id, eventId))
  .limit(1);

// Join tables
const photosWithEvent = await db
  .select({
    photo: photos,
    event: events,
  })
  .from(photos)
  .leftJoin(events, eq(photos.eventId, events.id));

// Insert
await db.insert(events).values({
  name: 'Wedding',
  eventDate: new Date(),
  photographerId: userId,
});

// Update
await db
  .update(events)
  .set({ name: 'New Name' })
  .where(eq(events.id, eventId));

// Delete
await db.delete(events).where(eq(events.id, eventId));
```

### Type Safety
```typescript
import type { NewEvent, Event, NewPhoto } from '@/db/schema';

const eventData: NewEvent = {
  name: 'Birthday Party',
  eventDate: new Date(),
  photographerId: userId,
};
```

---

## 🎨 UI Components (shadcn/ui)

### Installed Components
- `alert-dialog` - Confirmation dialogs
- `avatar` - User avatars
- `breadcrumb` - Navigation breadcrumbs
- `button` - Buttons
- `card` - Card containers
- `dialog` - Modal dialogs
- `dropdown-menu` - Dropdown menus
- `input` - Text inputs
- `label` - Form labels
- `select` - Select dropdowns
- `separator` - Dividers
- `sheet` - Side sheets
- `sidebar` - Navigation sidebar
- `skeleton` - Loading skeletons
- `textarea` - Text areas
- `tooltip` - Tooltips

### Add New Component
```bash
bunx shadcn@latest add <component-name>
```

---

## 🔧 Development Workflow

### Adding New Feature
1. Check `docs/plan.md` for task
2. Create feature branch from `dev`
3. Implement feature
4. Test locally
5. Get author approval
6. Merge to `dev`
7. Check task in plan.md

### Database Changes
1. Update `src/db/schema.ts`
2. Create migration SQL in `supabase/migrations/`
3. Run in Supabase SQL Editor
4. Test with `bun run db:test`

### Creating Service
```typescript
// src/services/example.service.ts
import { db } from '@/db';
import { tableName } from '@/db/schema';
import { eq } from 'drizzle-orm';

export class ExampleService {
  async getAll() {
    return await db.select().from(tableName);
  }
  
  async getById(id: string) {
    const result = await db
      .select()
      .from(tableName)
      .where(eq(tableName.id, id))
      .limit(1);
    return result[0] || null;
  }
}

export const exampleService = new ExampleService();
```

---

## 📋 Current Progress

### ✅ Done
- [x] Next.js project setup
- [x] shadcn/ui components
- [x] Frontend pages (Home, Shop, Gallery, Auth, Admin)
- [x] Navigation structure
- [x] Supabase migration planning
- [x] SQL migrations created
- [x] **Drizzle ORM setup** ⭐

### 🔄 Next Up
- [ ] Create Supabase project
- [ ] Setup environment variables
- [ ] Run SQL migrations
- [ ] Test database connection
- [ ] Implement service layer
- [ ] Connect UI to database
- [ ] Google OAuth
- [ ] Payment integration

---

## 📞 Key Contacts & Resources

### Supabase
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Storage: Used for photos & avatars

### Drizzle ORM
- Docs: https://orm.drizzle.team
- Studio: `bun run db:studio`
- PostgreSQL Guide: https://orm.drizzle.team/docs/get-started-postgresql

### shadcn/ui
- Components: https://ui.shadcn.com/docs/components
- Installation: `bunx shadcn@latest add <name>`

---

## 🚨 Important Notes

### Workflow Rules
- ✅ Always read `prd.md` before starting
- ✅ Check `plan.md` for task status
- ✅ Use `bun` for all commands
- ✅ Follow SOLID principles
- ✅ Work on `dev` branch
- ✅ Get author approval before checking tasks
- ✅ Only merge to main when feature complete

### Security
- ⚠️ Never commit `.env.local`
- ⚠️ Never expose service role key client-side
- ⚠️ Always use RLS policies
- ⚠️ Use signed URLs for file downloads

### Database
- ⚠️ Always use Drizzle for queries (type-safe)
- ⚠️ Use transactions for related operations
- ⚠️ Test queries before deploying
- ⚠️ Keep schema.ts synced with SQL migrations

---

## 🎯 Next Immediate Action

**Status:** Drizzle setup complete ✅

**Next Step:** Create Supabase project

**URL:** https://supabase.com/dashboard

**After that:**
1. Get credentials
2. Create `.env.local`
3. Run migrations
4. Test: `bun run db:test`
5. Seed: `bun run seed:admin`

**See:** `docs/NEXT_STEPS.md` for detailed guide

---

**Last Updated:** 2025-01-20  
**Phase:** 1 of 5 (Setup Complete)  
**Overall Progress:** 20%
