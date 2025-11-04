# 🎯 Service Layer - Quick Usage Guide

## 📦 Import Services

```typescript
// Import all services
import { 
  authService, 
  eventService, 
  photoService, 
  purchaseService, 
  bookmarkService 
} from '@/services';

// Or import individually
import { authService } from '@/services/auth.service';
```

---

## 🔐 Auth Service

### Sign Up
```typescript
const { user, error } = await authService.signUp({
  email: 'buyer@example.com',
  password: 'SecurePass123',
  fullName: 'John Doe',
  phone: '081234567890', // optional
});
```

### Sign In
```typescript
const { user, error } = await authService.signIn({
  email: 'admin@piksel-jual.com',
  password: 'Admin123!@#',
});
```

### Sign Out
```typescript
await authService.signOut();
```

### Get Current User
```typescript
const { user, error } = await authService.getCurrentUser();
if (user) {
  console.log(user.email, user.role);
}
```

### Check Authentication
```typescript
const isAuth = await authService.isAuthenticated();
const isAdmin = await authService.isAdmin();
```

---

## 📅 Event Service

### Create Event (Admin)
```typescript
const event = await eventService.createEvent({
  name: 'Wedding Ceremony',
  description: 'Beautiful wedding',
  eventDate: '2025-12-25',
  photographerId: adminUserId,
});
```

### Get All Events
```typescript
const events = await eventService.getEvents();

// With filters
const filtered = await eventService.getEvents({
  photographerId: userId,
  startDate: '2025-01-01',
  endDate: '2025-12-31',
});
```

### Get Event with Photos
```typescript
const eventWithPhotos = await eventService.getEventWithPhotos(eventId);
console.log(eventWithPhotos.photos.length);
```

### Update Event
```typescript
await eventService.updateEvent(eventId, {
  name: 'Updated Name',
  description: 'New description',
});
```

### Delete Event
```typescript
await eventService.deleteEvent(eventId); // Cascade deletes photos
```

---

## 📸 Photo Service

### Create Photo
```typescript
const photo = await photoService.createPhoto({
  name: 'IMG_001.jpg',
  price: 50000,
  eventId: eventId,
  photographerId: photographerId,
  previewUrl: 'https://storage/preview.jpg',
  fullUrl: 'https://storage/full.jpg',
  watermarkUrl: 'https://storage/watermark.jpg', // optional
});
```

### Get Photos
```typescript
const photos = await photoService.getPhotos();

// With filters
const filtered = await photoService.getPhotos({
  eventId: eventId,
  photographerId: photographerId,
  sold: false,
  searchQuery: 'wedding',
});
```

### Search Photos
```typescript
const results = await photoService.searchPhotos('birthday');
```

### Update Photo
```typescript
await photoService.updatePhoto(photoId, {
  name: 'New name',
  price: 75000,
});
```

### Mark as Sold
```typescript
await photoService.markPhotoAsSold(photoId);
```

---

## 💳 Purchase Service

### Create Purchase
```typescript
const purchase = await purchaseService.createPurchase({
  buyerId: userId,
  photoId: photoId,
  amount: 50000,
  paymentMethod: 'midtrans',
  transactionId: 'TRX123456',
});
```

### Get User Purchases
```typescript
const purchases = await purchaseService.getUserPurchases(userId);
purchases.forEach(p => {
  console.log(p.photo.name, p.event.name, p.amount);
});
```

### Update Payment Status
```typescript
// After payment webhook
await purchaseService.updatePaymentStatus(purchaseId, 'success');
// Automatically marks photo as sold

// If failed
await purchaseService.updatePaymentStatus(purchaseId, 'failed');
// Marks photo as available
```

### Check if Purchased
```typescript
const hasBought = await purchaseService.hasPurchased(userId, photoId);
if (hasBought) {
  // Show download button
}
```

### Get Revenue
```typescript
const { totalRevenue, totalSales } = await purchaseService.getTotalRevenue();
console.log(`Total: Rp ${totalRevenue} from ${totalSales} sales`);

// For specific photographer
const stats = await purchaseService.getTotalRevenue(photographerId);
```

---

## ⭐ Bookmark Service

### Toggle Bookmark
```typescript
const { bookmarked, bookmark } = await bookmarkService.toggleBookmark(userId, photoId);
console.log(bookmarked ? 'Added' : 'Removed');
```

### Add Bookmark
```typescript
const bookmark = await bookmarkService.addBookmark(userId, photoId);
```

### Remove Bookmark
```typescript
await bookmarkService.removeBookmark(userId, photoId);
```

### Get User Bookmarks
```typescript
const bookmarks = await bookmarkService.getUserBookmarks(userId);
bookmarks.forEach(b => {
  console.log(b.photo.name, b.event.name);
});
```

### Check if Bookmarked
```typescript
const isBookmarked = await bookmarkService.isBookmarked(userId, photoId);
```

### Get Bookmark IDs (Quick Check)
```typescript
const bookmarkIds = await bookmarkService.getUserBookmarkIds(userId);
// Returns: ['photo-id-1', 'photo-id-2', ...]

// Use with Set for O(1) lookup
const bookmarkSet = new Set(bookmarkIds);
const isBookmarked = bookmarkSet.has(photoId);
```

---

## 🔄 Common Patterns

### Server Component (App Router)
```typescript
// app/shop/page.tsx
import { photoService } from '@/services';

export default async function ShopPage() {
  const photos = await photoService.getPhotos({ sold: false });
  
  return (
    <div>
      {photos.map(photo => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
```

### Client Component with State
```typescript
'use client';

import { useState, useEffect } from 'react';
import { photoService } from '@/services';

export function PhotoList() {
  const [photos, setPhotos] = useState([]);
  
  useEffect(() => {
    async function loadPhotos() {
      const data = await photoService.getPhotos();
      setPhotos(data);
    }
    loadPhotos();
  }, []);
  
  return (
    <div>
      {photos.map(photo => (
        <div key={photo.id}>{photo.name}</div>
      ))}
    </div>
  );
}
```

### Server Action
```typescript
'use server';

import { authService } from '@/services';
import { redirect } from 'next/navigation';

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  const { user, error } = await authService.signIn({ email, password });
  
  if (error) {
    return { error: error.message };
  }
  
  redirect('/dashboard');
}
```

### API Route
```typescript
// app/api/photos/route.ts
import { NextRequest } from 'next/server';
import { photoService } from '@/services';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get('eventId');
  
  const photos = await photoService.getPhotos({ 
    eventId: eventId || undefined 
  });
  
  return Response.json(photos);
}
```

---

## 🎨 React Hooks (Custom)

### useAuth Hook
```typescript
// hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { authService, type User } from '@/services';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function checkAuth() {
      const { user } = await authService.getCurrentUser();
      setUser(user);
      setLoading(false);
    }
    checkAuth();
  }, []);
  
  return { user, loading, isAuthenticated: !!user };
}
```

### usePhotos Hook
```typescript
// hooks/usePhotos.ts
'use client';

import { useState, useEffect } from 'react';
import { photoService } from '@/services';

export function usePhotos(filters?) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadPhotos() {
      setLoading(true);
      const data = await photoService.getPhotos(filters);
      setPhotos(data);
      setLoading(false);
    }
    loadPhotos();
  }, [filters]);
  
  return { photos, loading };
}
```

---

## 🚀 Best Practices

### 1. Error Handling
```typescript
try {
  const { user, error } = await authService.signIn(data);
  if (error) throw error;
  
  // Success logic
} catch (error) {
  console.error('Sign in failed:', error);
  toast.error('Invalid credentials');
}
```

### 2. Loading States
```typescript
const [loading, setLoading] = useState(false);

async function handleSubmit() {
  setLoading(true);
  try {
    await eventService.createEvent(data);
    toast.success('Event created!');
  } catch (error) {
    toast.error('Failed to create event');
  } finally {
    setLoading(false);
  }
}
```

### 3. Optimistic Updates
```typescript
const [bookmarked, setBookmarked] = useState(false);

async function toggleBookmark() {
  // Optimistic update
  setBookmarked(!bookmarked);
  
  try {
    await bookmarkService.toggleBookmark(userId, photoId);
  } catch (error) {
    // Revert on error
    setBookmarked(bookmarked);
    toast.error('Failed to bookmark');
  }
}
```

---

## ⚡ Performance Tips

### 1. Cache User Session
```typescript
// Avoid multiple getCurrentUser() calls
const { user } = await authService.getCurrentUser();
// Cache in context or state
```

### 2. Pagination (Future)
```typescript
// TODO: Add pagination to services
const photos = await photoService.getPhotos({ 
  limit: 20, 
  offset: page * 20 
});
```

### 3. Parallel Requests
```typescript
const [events, photos, bookmarks] = await Promise.all([
  eventService.getEvents(),
  photoService.getPhotos(),
  bookmarkService.getUserBookmarks(userId),
]);
```

---

## 🔒 Security Notes

### 1. Server-Side Only
```typescript
// ❌ Don't expose service keys in client
'use client';
import { authService } from '@/services'; // OK, but user can see data

// ✅ Use server actions or API routes for sensitive operations
'use server';
import { purchaseService } from '@/services'; // Better
```

### 2. Authorization Checks
```typescript
const isAdmin = await authService.isAdmin();
if (!isAdmin) {
  throw new Error('Unauthorized');
}

// Proceed with admin operation
await eventService.deleteEvent(eventId);
```

---

**Need more examples? Check:**
- `docs/PHASE_3_COMPLETE.md` - Full service documentation
- `scripts/test-services.ts` - Service test examples
