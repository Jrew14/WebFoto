# 🐉 Drizzle ORM Setup Guide

## Overview

Drizzle ORM adalah TypeScript ORM yang type-safe dan performant untuk PostgreSQL. Kita gunakan Drizzle untuk berinteraksi dengan Supabase PostgreSQL database.

---

## 📦 Installation

### 1. Install Dependencies

```bash
bun add drizzle-orm postgres
bun add -D drizzle-kit
```

**Packages:**
- `drizzle-orm` - ORM runtime
- `postgres` - PostgreSQL client (untuk Supabase)
- `drizzle-kit` - CLI tools untuk migrations dan schema management

---

## 🗄️ Database Schema

Schema sudah dibuat di: `src/db/schema.ts`

**Tables:**
- ✅ `profiles` - User profiles (admin & buyer)
- ✅ `events` - Photography events
- ✅ `photos` - Photos with metadata
- ✅ `purchases` - Purchase transactions
- ✅ `bookmarks` - User bookmarked photos

**Features:**
- Type-safe schema dengan TypeScript
- Foreign key relationships
- Indexes untuk performance
- Enums untuk role, payment_status
- Auto-generated types

---

## ⚙️ Configuration

### 1. Environment Variables

Tambahkan ke `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URL for Drizzle
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

**Cara mendapatkan DATABASE_URL:**
1. Buka Supabase Dashboard
2. Settings → Database
3. Connection String → URI
4. Copy dan ganti `[YOUR-PASSWORD]` dengan password database Anda

### 2. Drizzle Config

File: `drizzle.config.ts` sudah dibuat ✅

---

## 🚀 Usage

### Import Database Instance

```typescript
import { db } from '@/db';
import { profiles, events, photos, purchases, bookmarks } from '@/db/schema';
```

### Basic Queries

**Select:**
```typescript
// Get all events
const allEvents = await db.select().from(events);

// Get event by ID
const event = await db
  .select()
  .from(events)
  .where(eq(events.id, eventId))
  .limit(1);

// Get events with photographer info
const eventsWithPhotographer = await db
  .select()
  .from(events)
  .leftJoin(profiles, eq(events.photographerId, profiles.id));
```

**Insert:**
```typescript
// Insert new event
const newEvent = await db
  .insert(events)
  .values({
    name: 'Wedding Ceremony',
    description: 'Beautiful wedding',
    eventDate: new Date('2025-06-15'),
    photographerId: userId,
  })
  .returning();

// Insert with type safety
import { type NewEvent } from '@/db/schema';

const eventData: NewEvent = {
  name: 'Birthday Party',
  eventDate: new Date(),
  photographerId: userId,
};

await db.insert(events).values(eventData);
```

**Update:**
```typescript
// Update event
await db
  .update(events)
  .set({ 
    name: 'Updated Name',
    updatedAt: new Date(),
  })
  .where(eq(events.id, eventId));
```

**Delete:**
```typescript
// Delete event (cascade deletes photos)
await db
  .delete(events)
  .where(eq(events.id, eventId));
```

### Relations & Joins

**Get photos with event and photographer:**
```typescript
import { eq } from 'drizzle-orm';

const photosWithDetails = await db
  .select({
    photo: photos,
    event: events,
    photographer: profiles,
  })
  .from(photos)
  .leftJoin(events, eq(photos.eventId, events.id))
  .leftJoin(profiles, eq(photos.photographerId, profiles.id));
```

**Get user's purchases with photo details:**
```typescript
const userPurchases = await db
  .select({
    purchase: purchases,
    photo: photos,
    event: events,
  })
  .from(purchases)
  .leftJoin(photos, eq(purchases.photoId, photos.id))
  .leftJoin(events, eq(photos.eventId, events.id))
  .where(eq(purchases.buyerId, userId));
```

**Get user's bookmarks:**
```typescript
const userBookmarks = await db
  .select({
    bookmark: bookmarks,
    photo: photos,
    event: events,
  })
  .from(bookmarks)
  .leftJoin(photos, eq(bookmarks.photoId, photos.id))
  .leftJoin(events, eq(photos.eventId, events.id))
  .where(eq(bookmarks.userId, userId));
```

### Transactions

```typescript
await db.transaction(async (tx) => {
  // Create purchase
  const purchase = await tx
    .insert(purchases)
    .values({
      buyerId: userId,
      photoId: photoId,
      amount: 50000,
      paymentStatus: 'success',
    })
    .returning();

  // Mark photo as sold
  await tx
    .update(photos)
    .set({ sold: true })
    .where(eq(photos.id, photoId));
});
```

### Aggregations

```typescript
import { count, sum } from 'drizzle-orm';

// Count photos per event
const photoCount = await db
  .select({
    eventId: photos.eventId,
    count: count(photos.id),
  })
  .from(photos)
  .groupBy(photos.eventId);

// Total revenue
const revenue = await db
  .select({
    total: sum(purchases.amount),
  })
  .from(purchases)
  .where(eq(purchases.paymentStatus, 'success'));
```

---

## 🔧 Drizzle Kit Commands

### Generate Migrations (Not needed for Supabase)

Karena kita sudah punya SQL migrations untuk Supabase, kita tidak perlu generate migrations dari Drizzle.

### Pull Schema from Database

```bash
# Pull existing schema dari Supabase
bunx drizzle-kit pull
```

### Introspect Database

```bash
# Lihat schema yang ada
bunx drizzle-kit introspect
```

### Drizzle Studio (Database GUI)

```bash
# Buka Drizzle Studio untuk manage database
bunx drizzle-kit studio
```

Buka: `https://local.drizzle.studio`

---

## 📝 Service Layer Examples

### Event Service with Drizzle

```typescript
// src/services/event.service.ts
import { db } from '@/db';
import { events, photos } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { NewEvent, Event } from '@/db/schema';

export class EventService {
  async getAllEvents() {
    return await db
      .select()
      .from(events)
      .orderBy(desc(events.eventDate));
  }

  async getEventById(id: string) {
    const result = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async createEvent(data: NewEvent) {
    const result = await db
      .insert(events)
      .values(data)
      .returning();
    
    return result[0];
  }

  async updateEvent(id: string, data: Partial<NewEvent>) {
    const result = await db
      .update(events)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    
    return result[0];
  }

  async deleteEvent(id: string) {
    await db
      .delete(events)
      .where(eq(events.id, id));
  }

  async getEventWithPhotos(id: string) {
    const eventPhotos = await db
      .select({
        event: events,
        photo: photos,
      })
      .from(events)
      .leftJoin(photos, eq(events.id, photos.eventId))
      .where(eq(events.id, id));
    
    if (eventPhotos.length === 0) return null;

    const event = eventPhotos[0].event;
    const photosList = eventPhotos
      .filter(ep => ep.photo !== null)
      .map(ep => ep.photo);

    return {
      ...event,
      photos: photosList,
    };
  }
}

export const eventService = new EventService();
```

### Photo Service with Drizzle

```typescript
// src/services/photo.service.ts
import { db } from '@/db';
import { photos, events, profiles } from '@/db/schema';
import { eq, and, desc, like, or } from 'drizzle-orm';
import type { NewPhoto, Photo } from '@/db/schema';

export class PhotoService {
  async getAllPhotos() {
    return await db
      .select({
        photo: photos,
        event: events,
        photographer: profiles,
      })
      .from(photos)
      .leftJoin(events, eq(photos.eventId, events.id))
      .leftJoin(profiles, eq(photos.photographerId, profiles.id))
      .orderBy(desc(photos.createdAt));
  }

  async getPhotosByEvent(eventId: string) {
    return await db
      .select()
      .from(photos)
      .where(eq(photos.eventId, eventId));
  }

  async searchPhotos(query: string) {
    return await db
      .select({
        photo: photos,
        event: events,
      })
      .from(photos)
      .leftJoin(events, eq(photos.eventId, events.id))
      .where(
        or(
          like(photos.name, `%${query}%`),
          like(events.name, `%${query}%`)
        )
      );
  }

  async createPhoto(data: NewPhoto) {
    const result = await db
      .insert(photos)
      .values(data)
      .returning();
    
    return result[0];
  }

  async deletePhoto(id: string) {
    await db
      .delete(photos)
      .where(eq(photos.id, id));
  }
}

export const photoService = new PhotoService();
```

### Bookmark Service with Drizzle

```typescript
// src/services/bookmark.service.ts
import { db } from '@/db';
import { bookmarks, photos, events } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export class BookmarkService {
  async toggleBookmark(userId: string, photoId: string) {
    // Check if already bookmarked
    const existing = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.photoId, photoId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Remove bookmark
      await db
        .delete(bookmarks)
        .where(eq(bookmarks.id, existing[0].id));
      return { bookmarked: false };
    } else {
      // Add bookmark
      await db
        .insert(bookmarks)
        .values({ userId, photoId });
      return { bookmarked: true };
    }
  }

  async getUserBookmarks(userId: string) {
    return await db
      .select({
        bookmark: bookmarks,
        photo: photos,
        event: events,
      })
      .from(bookmarks)
      .leftJoin(photos, eq(bookmarks.photoId, photos.id))
      .leftJoin(events, eq(photos.eventId, events.id))
      .where(eq(bookmarks.userId, userId));
  }

  async isBookmarked(userId: string, photoId: string) {
    const result = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.photoId, photoId)
        )
      )
      .limit(1);

    return result.length > 0;
  }
}

export const bookmarkService = new BookmarkService();
```

---

## 🎯 Best Practices

### 1. Type Safety
```typescript
// ✅ Good - Type-safe
import { type NewEvent, type Event } from '@/db/schema';

const eventData: NewEvent = {
  name: 'Wedding',
  eventDate: new Date(),
  photographerId: userId,
};

// ❌ Bad - No type safety
const eventData = {
  name: 'Wedding',
  // TypeScript won't catch missing required fields
};
```

### 2. Query Builders
```typescript
// ✅ Good - Use query builder
import { eq, and, or } from 'drizzle-orm';

await db
  .select()
  .from(photos)
  .where(
    and(
      eq(photos.eventId, eventId),
      eq(photos.sold, false)
    )
  );

// ❌ Bad - Raw SQL (lose type safety)
await db.execute(sql`SELECT * FROM photos WHERE event_id = ${eventId}`);
```

### 3. Transactions
```typescript
// ✅ Good - Use transactions for related operations
await db.transaction(async (tx) => {
  await tx.insert(purchases).values(purchaseData);
  await tx.update(photos).set({ sold: true }).where(eq(photos.id, photoId));
});

// ❌ Bad - Separate queries (can cause inconsistency)
await db.insert(purchases).values(purchaseData);
await db.update(photos).set({ sold: true }).where(eq(photos.id, photoId));
```

### 4. Returning Data
```typescript
// ✅ Good - Use returning() to get inserted data
const newEvent = await db
  .insert(events)
  .values(data)
  .returning();

// ❌ Bad - Separate query to get data
await db.insert(events).values(data);
const newEvent = await db.select().from(events).where(eq(events.id, data.id));
```

---

## 🔗 Resources

- [Drizzle Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle + Supabase](https://orm.drizzle.team/docs/get-started-postgresql#supabase)
- [Query Examples](https://orm.drizzle.team/docs/select)
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview)

---

## ✅ Setup Checklist

- [x] Install dependencies (drizzle-orm, postgres, drizzle-kit)
- [x] Create schema (`src/db/schema.ts`)
- [x] Create db instance (`src/db/index.ts`)
- [x] Create config (`drizzle.config.ts`)
- [x] Add DATABASE_URL to `.env.local`
- [ ] Test connection dengan simple query
- [ ] Migrate services to use Drizzle
- [ ] Test all CRUD operations

**Next Step:** Mulai migrate service layer untuk menggunakan Drizzle ORM! 🚀
