# Halaman Unggah Foto - WebFoto

## 🎯 Overview
Halaman upload foto yang fully functional dengan fitur pilih event, multi-upload, kelola harga per foto, dan simpan batch.

## 📁 File yang Dibuat/Diupdate

**Updated:**
- ✅ `src/components/admin/Sidebar.tsx` - Aktifkan menu "Unggah Foto" (remove disabled flag)
- ✅ `src/app/admin/(dashboard)/upload/page.tsx` - Complete upload page implementation

**New Components Used:**
- `Select` (shadcn) - Dropdown pilih event
- `Dialog` - Modal kelola foto
- `Card` - UI containers
- `Button`, `Input`, `Label` - Form components

## 🎨 Fitur Lengkap

### 1. **Form Pilih Folder Event** ✅

**Components:**
- Card dengan icon FolderOpen
- Dropdown Select dengan list events
- Placeholder: "Pilih event..."

**Data Events (Mock):**
```typescript
const mockEvents = [
  { id: "1", name: "Wedding John & Jane" },
  { id: "2", name: "Corporate Annual Meeting 2024" },
  { id: "3", name: "Birthday Party - Sarah" },
];
```

**Features:**
- ✅ Dropdown searchable
- ✅ Required untuk simpan foto
- ✅ Visual indicator jika belum dipilih

### 2. **Upload Foto (Multiple)** ✅

**Upload Methods:**
1. **Click to Browse**: Klik area upload → File dialog → Pilih satu/lebih foto
2. **Drag & Drop**: Drag files dari explorer → Drop ke area

**Features:**
- ✅ Multi-file selection (bisa pilih banyak sekaligus)
- ✅ Drag & drop support
- ✅ File type validation (hanya image/*)
- ✅ Visual feedback (hover effect)
- ✅ Auto-generate preview URL
- ✅ File size calculation

**Validasi:**
- Hanya menerima file gambar (PNG, JPG, JPEG, GIF)
- Alert jika file bukan gambar
- Support hingga 10MB per file (dapat disesuaikan)

**Upload Area UI:**
```
┌─────────────────────────────────────┐
│      [Upload Icon]                  │
│                                     │
│  Klik untuk upload atau drag & drop│
│  PNG, JPG, JPEG, GIF hingga 10MB   │
└─────────────────────────────────────┘
```

### 3. **Statistik Upload** ✅

**Realtime Stats Card:**
- ✅ **Total Foto**: Counter jumlah foto yang di-upload
- ✅ **Dengan Harga**: Counter foto yang sudah diatur harga
- ✅ **Total Revenue**: Sum total harga semua foto (format Rupiah)

**Auto Update:**
- Update otomatis saat upload foto
- Update saat set harga foto
- Update saat hapus foto

### 4. **Daftar Foto** ✅

**List Layout:**
- Card container dengan scroll
- Title: "Daftar Foto (X)" dengan counter
- Grid/List items dengan spacing

**Setiap Foto Item:**

**Preview Thumbnail:**
- ✅ 80x80px preview image
- ✅ Rounded corners
- ✅ Object-cover untuk aspect ratio

**Info Section:**
- ✅ **Nama File**: Full filename (truncate jika panjang)
- ✅ **Ukuran**: Formatted file size (KB/MB)
- ✅ **Status Harga**:
  - Green: "Rp XX,XXX" jika sudah diatur
  - Amber: "Belum diatur harga" + warning icon jika belum

**Action Buttons:**
- ✅ **Kelola** (Settings icon): Opens modal set harga
- ✅ **Hapus** (X icon): Remove foto dari list

**Visual:**
```
┌───────────────────────────────────────────┐
│ [Thumbnail]  IMG_001.jpg              [⚙️] [❌]│
│              2.5 MB                           │
│              Rp 50,000 / ⚠️ Belum diatur      │
└───────────────────────────────────────────┘
```

### 5. **Modal Kelola Foto** ✅

**Trigger:** Klik button "Kelola" pada foto item

**Dialog Content:**

**Preview Foto:**
- ✅ Large preview (full width, 192px height)
- ✅ Object-contain untuk lihat full image
- ✅ Background slate-100

**File Info:**
- ✅ Nama File (read-only display)
- ✅ Ukuran File (read-only display)

**Form Harga:**
- ✅ **Label**: "Harga Foto (Rp)" dengan asterisk required
- ✅ **Input**: Number type dengan:
  - Placeholder: "Contoh: 50000"
  - Min: 0
  - Step: 1000 (increment Rp 1,000)
- ✅ **Helper Text**: "Tentukan harga jual untuk foto ini"

**Actions:**
- ✅ **Batal**: Close tanpa save
- ✅ **Simpan Harga**: Save price dan update list

**Pre-fill:**
- Jika foto sudah punya harga, input auto-fill dengan harga existing

### 6. **Button Hapus Foto** ✅

**Features:**
- ✅ Icon X (red)
- ✅ Hover effect: red background
- ✅ Instant remove dari list
- ✅ Clean up preview URL (no memory leak)
- ✅ Update stats counter

**Visual Feedback:**
- Foto langsung hilang dari list
- Stats auto-update
- No confirmation needed (undo masih bisa via re-upload)

### 7. **Button Simpan Semua Foto** ✅

**Location:** Card di top bar (sebelah stats)

**Validation Checks:**
1. ✅ Event sudah dipilih? (required)
2. ✅ Ada foto yang di-upload? (minimum 1)
3. ✅ Foto tanpa harga? (konfirmasi optional)

**Konfirmasi Flow:**
```
IF event not selected:
  → Alert: "Silakan pilih folder event terlebih dahulu!"

IF no photos:
  → Alert: "Tidak ada foto yang akan disimpan!"

IF photos without price:
  → Confirm: "Ada X foto yang belum diatur harganya. Lanjutkan?"
  → User choose: Cancel / OK

ELSE:
  → Proceed to save
```

**Saving Process:**
- ✅ Loading state: "Menyimpan..." dengan button disabled
- ✅ Simulate API call (2 detik)
- ✅ Success alert dengan counter foto
- ✅ Auto-reset form & clear photos
- ✅ Clean up preview URLs

**States:**
```typescript
Button disabled when:
- isSaving === true
- photos.length === 0
- !selectedEvent
```

## 🔄 Technical Implementation

### State Management

```typescript
// Main states
const [selectedEvent, setSelectedEvent] = useState("");
const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
const [editingPhoto, setEditingPhoto] = useState<UploadedPhoto | null>(null);
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [tempPrice, setTempPrice] = useState("");
const [isSaving, setIsSaving] = useState(false);

// Ref for file input
const fileInputRef = useRef<HTMLInputElement>(null);
```

### Type Definition

```typescript
interface UploadedPhoto {
  id: string;           // Unique ID (timestamp + random)
  file: File;           // Original File object
  preview: string;      // Object URL for preview
  name: string;         // File name
  price: number;        // Price in Rupiah
  size: string;         // Formatted size (KB/MB)
}
```

### Key Functions

#### 1. File Selection Handler
```typescript
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Get files from input
  // Validate image type
  // Create preview URL
  // Add to photos array
  // Reset input
}
```

#### 2. Drag & Drop Handler
```typescript
const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  // Prevent default
  // Get files from dataTransfer
  // Simulate file input change
  // Trigger handleFileSelect
}
```

#### 3. Manage Photo Price
```typescript
const handleManagePhoto = (photo: UploadedPhoto) => {
  // Set editing photo
  // Pre-fill price if exists
  // Open dialog
}

const handleSavePrice = () => {
  // Parse price input
  // Update photo in array
  // Close dialog
  // Reset form
}
```

#### 4. Remove Photo
```typescript
const handleRemovePhoto = (photoId: string) => {
  // Find photo
  // Revoke Object URL (cleanup)
  // Filter out from array
}
```

#### 5. Save All Photos
```typescript
const handleSaveAll = async () => {
  // Validate event selection
  // Validate photos exist
  // Check photos without price
  // Show loading state
  // Simulate API call
  // Show success message
  // Reset everything
  // Cleanup preview URLs
}
```

### Utility Functions

```typescript
// Format file size
const formatFileSize = (bytes: number): string => {
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

// Calculate stats
const totalPhotos = photos.length;
const totalWithPrice = photos.filter((p) => p.price > 0).length;
const totalRevenue = photos.reduce((sum, p) => sum + p.price, 0);
```

## 🎯 User Flow

### Upload & Manage Flow
```
1. Pilih Event dari dropdown
   ↓
2. Upload foto (click / drag&drop)
   ↓
3. Foto muncul di list dengan status "Belum diatur harga"
   ↓
4. Klik "Kelola" pada setiap foto
   ↓
5. Input harga di modal
   ↓
6. Klik "Simpan Harga"
   ↓
7. Status berubah jadi "Rp XX,XXX" (green)
   ↓
8. Ulangi untuk foto lainnya
   ↓
9. Klik "Simpan Semua Foto"
   ↓
10. Konfirmasi jika ada foto tanpa harga
    ↓
11. Loading... (2 detik)
    ↓
12. Success! Foto tersimpan, form ter-reset
```

### Quick Upload Flow (Without Price)
```
1. Pilih Event
2. Upload foto
3. Skip set harga
4. Klik "Simpan Semua Foto"
5. Confirm warning
6. Success!
```

## 🎨 Visual Design

### Color Scheme
- **Primary Action**: Slate-900 (save button)
- **Success**: Green-600 (price display, revenue)
- **Warning**: Amber-600 (no price warning)
- **Danger**: Red-600 (delete button)
- **Neutral**: Slate-600 (labels, descriptions)

### Icons Used
- `UploadIcon` - Upload area
- `FolderOpen` - Select event card
- `ImageIcon` - Stats card
- `Save` - Save button & card
- `Settings` - Kelola button
- `X` - Remove button
- `AlertCircle` - Warning indicators

### Spacing & Layout
- **Page Padding**: p-8
- **Grid Gap**: gap-6
- **Card Spacing**: space-y-3 for list
- **Button Gap**: gap-2 for icons

## 📱 Responsive Design

### Desktop (> 1024px)
- 3 columns grid untuk top cards
- Full width upload area
- List items dengan preview kiri, info tengah, actions kanan

### Tablet (768px - 1024px)
- 2-3 columns for cards
- Adjusted spacing

### Mobile (< 768px)
- 1 column stack
- Compressed photo list items
- Smaller preview thumbnails

## 🚀 Cara Menggunakan

### Upload Foto dengan Harga

**Step by step:**
```bash
# 1. Pilih Event
Click dropdown → Select "Wedding John & Jane"

# 2. Upload Foto
Method A: Click area upload → Browse → Select multiple files
Method B: Drag files dari folder → Drop ke area

# 3. Set Harga per Foto
For each photo:
  - Click "Kelola"
  - Input: 50000
  - Click "Simpan Harga"

# 4. Review
Check stats card:
  - Total Foto: 5
  - Dengan Harga: 5
  - Total Revenue: Rp 250,000

# 5. Simpan
Click "Simpan Semua Foto"
Wait 2 seconds...
Success! ✅
```

### Quick Upload (Bulk Without Price)

```bash
# 1. Pilih Event
Select event from dropdown

# 2. Bulk Upload
Upload 10+ photos at once

# 3. Skip Price Setting
Don't set individual prices

# 4. Bulk Save
Click "Simpan Semua Foto"
Confirm: "Ada 10 foto yang belum diatur harganya. Lanjutkan?"
Click OK

Success! All photos saved without prices
```

## 🔧 Integration Notes

### Backend Integration (TODO)

**API Endpoints to Create:**
```typescript
// Fetch events
GET /api/admin/events
Response: Event[]

// Upload photos
POST /api/admin/photos/upload
Body: {
  eventId: string
  photos: File[]
  prices: number[]
}
Response: { success: boolean, count: number }
```

**Current State:**
- Uses mock events data
- Simulates API call with setTimeout
- Logs data to console

**To Implement:**
1. Replace mock events with API fetch
2. Implement actual upload to storage (Supabase Storage)
3. Save photo metadata to database
4. Handle upload progress
5. Error handling & retry logic

### File Storage Strategy

**Recommended Flow:**
```
1. User uploads → Frontend validates
2. Create preview (client-side)
3. On save:
   a. Upload originals to Supabase Storage
   b. Generate watermarked versions (server-side worker)
   c. Save metadata to database
   d. Return success/error
```

## ⚡ Performance Notes

### Memory Management
- ✅ Object URLs are revoked on remove
- ✅ Cleanup on successful save
- ✅ No memory leaks from preview URLs

### File Handling
- ✅ Validation before processing
- ✅ Chunked processing for large batches
- ✅ Preview generation is non-blocking

## 🐛 Edge Cases Handled

1. **Upload non-image files**: Alert + skip file
2. **Save without event**: Alert required
3. **Save without photos**: Alert minimum 1
4. **Photos without price**: Confirmation dialog
5. **Remove while editing**: Dialog closes safely
6. **Multiple uploads**: Append to existing list
7. **Reset after save**: Clean up all URLs

## 🧪 Testing Checklist

### Upload ✅
- [x] Click upload works
- [x] Drag & drop works
- [x] Multiple selection works
- [x] Preview generates correctly
- [x] File size displays correctly
- [x] Non-image files rejected

### Manage Price ✅
- [x] Modal opens with correct photo
- [x] Preview shows in modal
- [x] Price input accepts numbers
- [x] Save updates photo price
- [x] Cancel doesn't save
- [x] Pre-fill works for edit

### Remove ✅
- [x] Remove button deletes photo
- [x] Stats update after remove
- [x] Preview URL cleaned up

### Save All ✅
- [x] Validation works (event, photos)
- [x] Confirmation shows for no-price photos
- [x] Loading state during save
- [x] Success message shows
- [x] Form resets after save
- [x] All URLs cleaned up

## 📸 Preview

**Server running at:**
```
http://localhost:3001/admin/upload
```

**Test Scenarios:**
1. Upload single photo → Set price → Save
2. Upload multiple photos → Set prices → Save
3. Upload photos → Don't set prices → Confirm save
4. Remove photo from list → Verify stats update
5. Drag & drop files → Verify upload

## ✅ Summary

Halaman Unggah Foto **fully functional** dengan:

✅ **Form Pilih Event** - Dropdown dengan validasi
✅ **Multi-Upload** - Click + Drag & Drop support
✅ **Preview Thumbnails** - Auto-generated untuk semua foto
✅ **List Foto** - Nama, size, harga status
✅ **Kelola Harga** - Modal dengan form harga per foto
✅ **Button Hapus** - Remove foto dari list
✅ **Statistik Real-time** - Total, dengan harga, revenue
✅ **Button Simpan** - Validation + batch save

**Ready to use!** 🎉

Next steps: Integrate dengan backend API dan storage.
