# ✅ Watermark Feature Implementation

## Overview

Implementasi fitur watermark yang memungkinkan admin untuk upload watermark PNG dan otomatis diterapkan pada preview foto yang ditampilkan di halaman user.

## Alur Kerja Watermark

```
Admin → Upload Watermark PNG → Supabase Storage
                                      ↓
                                 Save URL to DB
                                      ↓
Upload Foto → Resize API → Get Watermark URL → Composite Watermark
                                      ↓
                              Preview dengan Watermark
```

## Perubahan yang Dibuat

### 1. Database Schema
**File**: `src/db/schema.ts`

Tambah kolom `watermarkUrl` ke tabel profiles:
```typescript
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: text('role', { enum: ['admin', 'buyer'] }).notNull().default('buyer'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  watermarkUrl: text('watermark_url'),  // ← NEW
  // ...
});
```

### 2. Profile Service
**File**: `src/services/profile.service.ts`

Update `updateProfile` untuk support watermarkUrl:
```typescript
async updateProfile(userId: string, updates: {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  watermarkUrl?: string;  // ← NEW
})
```

### 3. Profile Actions
**File**: `src/actions/user.actions.ts`

Update type untuk include watermarkUrl:
```typescript
export async function updateProfileAction(userId: string, updates: {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  watermarkUrl?: string;  // ← NEW
})
```

### 4. Admin Profile Page
**File**: `src/app/admin/(dashboard)/profile/page.tsx`

**Load Watermark dari Database:**
```typescript
useEffect(() => {
  if (profile.watermarkUrl) {
    setWatermark(profile.watermarkUrl);
  }
}, [user]);
```

**Upload Watermark ke Storage:**
```typescript
if (watermarkFile) {
  const fileName = `${user.id}-watermark-${Date.now()}.png`;
  const filePath = `watermarks/${fileName}`;
  
  await supabase.storage
    .from('photos')
    .upload(filePath, watermarkFile);
  
  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(filePath);
  
  watermarkUrl = publicUrl;
}
```

### 5. Get Watermark API
**File**: `src/app/api/admin/watermark/route.ts` (NEW)

API endpoint untuk get watermark URL admin:
```typescript
GET /api/admin/watermark

Response:
{
  watermarkUrl: string | null
}
```

### 6. Resize API Update
**File**: `src/app/api/photos/resize/route.ts`

**Accept watermarkUrl parameter:**
```typescript
const watermarkUrl = formData.get('watermarkUrl') as string | null;
```

**Composite watermark image:**
```typescript
if (watermarkUrl) {
  // Fetch watermark
  const watermarkBuffer = await fetch(watermarkUrl);
  
  // Resize watermark (20% of image width)
  const watermarkWidth = Math.round(newWidth * 0.2);
  
  // Composite onto image
  resizedBuffer = await sharp(imageBuffer)
    .composite([{
      input: resizedWatermark,
      gravity: 'center',
    }])
    .toBuffer();
} else {
  // Fallback to text watermark
  // "PREVIEW - LOW RES"
}
```

### 7. Upload Page Update
**File**: `src/app/admin/(dashboard)/upload/page.tsx`

**Get watermark before upload:**
```typescript
const watermarkResponse = await fetch('/api/admin/watermark');
const { watermarkUrl } = await watermarkResponse.json();
```

**Pass to resize API:**
```typescript
const formData = new FormData();
formData.append('file', photo.file);
formData.append('quality', '25');

if (watermarkUrl) {
  formData.append('watermarkUrl', watermarkUrl);
}

await fetch('/api/photos/resize', { 
  method: 'POST', 
  body: formData 
});
```

### 8. Migration Script
**File**: `scripts/add-watermark-column.ts` (NEW)

Script untuk add column watermark_url:
```bash
bun scripts/add-watermark-column.ts
```

## Storage Structure

```
photos/
├── avatars/              # Profile photos
│   └── {userId}-{timestamp}.jpg
├── watermarks/           # Admin watermarks (NEW)
│   └── {userId}-watermark-{timestamp}.png
├── originals/            # Full resolution photos
│   └── {eventId}/
│       └── {timestamp}-{random}.jpg
└── previews/             # Low-res with watermark
    └── {eventId}/
        └── preview_{timestamp}-{random}.jpg
```

## Fitur Watermark

### Upload Watermark (Admin Profile)
1. **Format**: PNG only (untuk transparency)
2. **Max Size**: 2MB
3. **Recommended**: 500x200px
4. **Storage**: `photos/watermarks/{userId}-watermark-{timestamp}.png`
5. **Database**: URL disimpan di `profiles.watermark_url`

### Apply Watermark (Photo Upload)
1. Admin upload foto di `/admin/upload`
2. System fetch watermark URL dari database
3. Original foto disimpan full resolution
4. Preview dibuat 25% resolution
5. Watermark di-composite ke center preview
6. Watermark size: 20% dari lebar preview
7. Maintain aspect ratio watermark

### Fallback Behavior
- Jika watermark tidak ada → Text watermark "PREVIEW - LOW RES"
- Jika watermark URL invalid → Text watermark
- Jika composite fail → Text watermark

## Testing Watermark

### 1. Upload Watermark
```bash
1. Login admin → /admin/login
2. Buka profile → /admin/profile
3. Scroll ke "Pengaturan Watermark"
4. Upload PNG (max 2MB)
5. Klik "Simpan Perubahan"
6. ✅ Watermark tersimpan ke database
```

### 2. Test di Upload Foto
```bash
1. Buka /admin/upload
2. Pilih event
3. Upload foto (JPG/PNG)
4. Submit upload
5. ✅ Preview foto punya watermark image
6. Check console log "💧 Using watermark: [URL]"
```

### 3. Verify di User Page
```bash
1. Logout admin
2. Buka /shop atau /gallery
3. ✅ Foto preview tampil dengan watermark
4. Foto original tetap tanpa watermark
```

## API Flow

### Upload Flow
```
Admin Upload Foto
    ↓
GET /api/admin/watermark
    ↓ (returns watermarkUrl)
POST /api/photos/resize
    ├── file
    ├── quality: 25
    └── watermarkUrl
    ↓
Sharp Processing:
    1. Resize to 25%
    2. Fetch watermark image
    3. Resize watermark (20% width)
    4. Composite watermark
    5. Return JPEG
    ↓
Upload to Supabase Storage
    ├── photos/originals/ (full)
    └── photos/previews/ (watermarked)
```

## Keunggulan Implementasi

✅ **Custom Branding**: Admin bisa pakai logo sendiri
✅ **Transparent PNG**: Support transparency untuk watermark
✅ **Auto Sizing**: Watermark auto-resize 20% dari preview width
✅ **Center Placement**: Watermark di center foto
✅ **Fallback Ready**: Jika gagal, pakai text watermark
✅ **Database Stored**: URL tersimpan, tidak perlu re-upload
✅ **One-time Setup**: Upload sekali, apply ke semua foto

## Files Modified

1. ✅ `src/db/schema.ts` - Add watermarkUrl column
2. ✅ `src/services/profile.service.ts` - Support watermarkUrl
3. ✅ `src/actions/user.actions.ts` - Update types
4. ✅ `src/app/admin/(dashboard)/profile/page.tsx` - Upload & save watermark
5. ✅ `src/app/api/admin/watermark/route.ts` - NEW API
6. ✅ `src/app/api/photos/resize/route.ts` - Composite watermark image
7. ✅ `src/app/admin/(dashboard)/upload/page.tsx` - Pass watermark URL
8. ✅ `scripts/add-watermark-column.ts` - Migration script
9. ✅ `supabase/migrations/003_add_watermark_to_profiles.sql` - SQL migration

## Migration Status

```bash
✅ Column added: profiles.watermark_url (TEXT)
✅ Type: text
✅ Nullable: true (optional)
✅ Storage folder: photos/watermarks/
```

## Next Steps (Optional)

- [ ] Watermark position settings (corner, center, bottom)
- [ ] Watermark opacity slider
- [ ] Watermark size slider
- [ ] Multiple watermark templates
- [ ] Preview watermark before apply
- [ ] Watermark rotation angle

---

**Status:** ✅ Fully Implemented
**Tested:** ✅ Database, Upload, Resize API
**Ready:** ✅ Production Ready
