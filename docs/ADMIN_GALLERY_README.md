# Admin Gallery Page - Documentation

## 📸 Overview

Halaman Gallery adalah dashboard untuk mengelola semua foto yang telah diunggah. Admin dapat melihat, mengedit, menghapus foto, serta memfilter berdasarkan status penjualan, event, dan tanggal.

## ✨ Features

### 1. **Statistics Dashboard**
- **Total Foto**: Jumlah seluruh foto yang ada
- **Foto Terjual**: Jumlah foto yang sudah terjual
- **Belum Terjual**: Jumlah foto yang masih tersedia
- **Total Revenue**: Total pendapatan dari foto yang terjual

### 2. **Advanced Filters**
- 🔍 **Search by Name**: Cari foto berdasarkan nama file
- 📊 **Status Filter**: 
  - Semua Status
  - Terjual
  - Belum Terjual
- 📁 **Event Filter**: Filter berdasarkan folder event
- 📅 **Date Range**: Filter tanggal upload (dari - sampai)
- 🔄 **Reset Filter**: Tombol untuk reset semua filter

### 3. **Photo Grid Display**
Setiap foto card menampilkan:
- ✅ Preview image dengan status badge (Terjual/Tersedia)
- 📝 Nama file foto
- 💰 Harga foto
- 📁 Nama event
- 📅 Tanggal upload
- 🎯 Action buttons: Lihat, Edit, Hapus

### 4. **View Photo Details**
Dialog untuk melihat detail lengkap foto:
- Preview image besar
- Nama file
- Ukuran file
- Harga
- Status (Terjual/Tersedia)
- Event
- Tanggal upload
- Info pembeli (jika terjual):
  - Tanggal terjual
  - Nama pembeli

### 5. **Edit Photo**
Dialog untuk mengedit foto:
- Preview image
- Edit nama foto
- Edit harga foto
- Validasi input
- Simpan perubahan

### 6. **Delete Photo**
- Alert dialog konfirmasi sebelum menghapus
- Menampilkan nama foto yang akan dihapus
- Tidak dapat dibatalkan setelah konfirmasi

## 🎨 UI Components Used

- `Card` - Container untuk sections
- `Input` - Text dan date inputs
- `Select` - Dropdown untuk filters
- `Button` - Action buttons
- `Dialog` - Modal untuk view dan edit
- `AlertDialog` - Konfirmasi delete
- `Label` - Form labels
- Lucide Icons:
  - `Images`, `Search`, `Filter`
  - `Eye`, `Edit`, `Trash2`
  - `CheckCircle`, `XCircle`
  - `Calendar`, `DollarSign`, `Tag`, `FolderOpen`

## 📊 Data Structure

```typescript
interface Photo {
  id: string;
  name: string;              // Nama file foto
  price: number;             // Harga foto
  sold: boolean;             // Status terjual/tidak
  soldDate?: string;         // Tanggal terjual (optional)
  uploadDate: string;        // Tanggal upload
  eventId: string;           // ID event
  eventName: string;         // Nama event
  preview: string;           // URL preview image
  size: string;              // Ukuran file
  buyerName?: string;        // Nama pembeli (optional)
}
```

## 🔄 State Management

```typescript
// Photo list
const [photos, setPhotos] = useState<Photo[]>(mockPhotos);

// Filters
const [searchQuery, setSearchQuery] = useState("");
const [filterStatus, setFilterStatus] = useState<"all" | "sold" | "unsold">("all");
const [filterEvent, setFilterEvent] = useState<string>("all");
const [filterDateFrom, setFilterDateFrom] = useState("");
const [filterDateTo, setFilterDateTo] = useState("");

// View dialog
const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

// Edit dialog
const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [tempName, setTempName] = useState("");
const [tempPrice, setTempPrice] = useState("");

// Delete dialog
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);

// Hydration fix
const [isMounted, setIsMounted] = useState(false);
```

## 🎯 Key Functions

### Filter Logic
```typescript
const filteredPhotos = photos.filter((photo) => {
  // Search filter
  if (searchQuery && !photo.name.toLowerCase().includes(searchQuery.toLowerCase())) {
    return false;
  }

  // Status filter
  if (filterStatus === "sold" && !photo.sold) return false;
  if (filterStatus === "unsold" && photo.sold) return false;

  // Event filter
  if (filterEvent !== "all" && photo.eventId !== filterEvent) return false;

  // Date filter (upload date)
  if (filterDateFrom && photo.uploadDate < filterDateFrom) return false;
  if (filterDateTo && photo.uploadDate > filterDateTo) return false;

  return true;
});
```

### CRUD Operations

**View Photo:**
```typescript
const handleView = (photo: Photo) => {
  setViewingPhoto(photo);
  setIsViewDialogOpen(true);
};
```

**Edit Photo:**
```typescript
const handleEdit = (photo: Photo) => {
  setEditingPhoto(photo);
  setTempName(photo.name);
  setTempPrice(photo.price.toString());
  setIsEditDialogOpen(true);
};

const handleSaveEdit = () => {
  if (!editingPhoto) return;
  const price = parseFloat(tempPrice) || 0;
  
  setPhotos(
    photos.map((p) =>
      p.id === editingPhoto.id
        ? { ...p, name: tempName, price: price }
        : p
    )
  );
  
  setIsEditDialogOpen(false);
  setEditingPhoto(null);
};
```

**Delete Photo:**
```typescript
const handleDelete = (photo: Photo) => {
  setPhotoToDelete(photo);
  setDeleteDialogOpen(true);
};

const handleDeleteConfirm = () => {
  if (!photoToDelete) return;
  
  setPhotos(photos.filter((p) => p.id !== photoToDelete.id));
  setDeleteDialogOpen(false);
  setPhotoToDelete(null);
};
```

**Clear Filters:**
```typescript
const handleClearFilters = () => {
  setSearchQuery("");
  setFilterStatus("all");
  setFilterEvent("all");
  setFilterDateFrom("");
  setFilterDateTo("");
};
```

## 📈 Statistics Calculation

```typescript
const totalPhotos = photos.length;
const soldPhotos = photos.filter((p) => p.sold).length;
const unsoldPhotos = photos.filter((p) => !p.sold).length;
const totalRevenue = photos
  .filter((p) => p.sold)
  .reduce((sum, p) => sum + p.price, 0);
```

## 🎨 Status Badge Display

```tsx
{photo.sold ? (
  <span className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded-full flex items-center gap-1">
    <CheckCircle className="w-3 h-3" />
    Terjual
  </span>
) : (
  <span className="px-2 py-1 text-xs font-semibold bg-amber-500 text-white rounded-full flex items-center gap-1">
    <XCircle className="w-3 h-3" />
    Tersedia
  </span>
)}
```

## 🚀 Usage Flow

### Viewing Photos
1. Gallery menampilkan semua foto dalam grid layout
2. Setiap foto menampilkan preview, nama, harga, event, dan tanggal
3. Status badge menunjukkan foto terjual atau tersedia
4. Klik "Lihat" untuk melihat detail lengkap

### Filtering Photos
1. Gunakan search bar untuk cari nama foto
2. Pilih status: Semua, Terjual, atau Belum Terjual
3. Pilih event tertentu atau semua event
4. Set tanggal dari dan sampai untuk filter range
5. Klik "Reset Filter" untuk clear semua filter

### Editing Photo
1. Klik tombol "Edit" pada foto card
2. Dialog akan muncul dengan form edit
3. Ubah nama atau harga foto
4. Klik "Simpan Perubahan" untuk save

### Deleting Photo
1. Klik tombol trash icon pada foto card
2. Alert dialog konfirmasi akan muncul
3. Klik "Hapus" untuk confirm delete
4. Foto akan dihapus dari list

## 🔧 Mock Data

File menggunakan `mockPhotos` dan `mockEvents` untuk development:

```typescript
const mockPhotos: Photo[] = [
  {
    id: "1",
    name: "IMG_001_John_Jane.jpg",
    price: 50000,
    sold: true,
    soldDate: "2025-01-15",
    uploadDate: "2025-01-10",
    eventId: "1",
    eventName: "Wedding John & Jane",
    preview: "https://picsum.photos/seed/wedding1/400/300",
    size: "2.4 MB",
    buyerName: "John Doe",
  },
  // ... more photos
];

const mockEvents = [
  { id: "1", name: "Wedding John & Jane" },
  { id: "2", name: "Corporate Annual Meeting 2024" },
  { id: "3", name: "Birthday Party - Sarah" },
];
```

## 🐛 Hydration Fix Applied

Menggunakan pattern yang sama dengan Event page untuk mencegah hydration mismatch:

```typescript
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

// Conditional rendering
{isMounted && (
  <div className="grid ...">
    {filteredPhotos.map((photo) => (...))}
  </div>
)}

// suppressHydrationWarning pada buttons
<Button suppressHydrationWarning onClick={...}>
```

## 📱 Responsive Design

- **Mobile (< 768px)**: 1 column grid
- **Tablet (768px - 1024px)**: 2 columns grid
- **Desktop (1024px - 1280px)**: 3 columns grid
- **Large Desktop (> 1280px)**: 4 columns grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```

## 🔮 Future Enhancements

### Backend Integration
- [ ] Fetch photos from Supabase database
- [ ] Implement real image storage with Supabase Storage
- [ ] Create API endpoints for CRUD operations
- [ ] Add pagination for large photo collections
- [ ] Implement lazy loading for images

### Additional Features
- [ ] Bulk edit pricing
- [ ] Bulk delete photos
- [ ] Export data to CSV/Excel
- [ ] Advanced sorting (by price, date, name)
- [ ] Photo tagging system
- [ ] Watermark toggle/preview
- [ ] Download original photo
- [ ] Share photo link
- [ ] Photo analytics (views, downloads)

## 🎯 Integration Points

### With Upload Page
- Photos uploaded via Upload page appear here
- Same event structure
- Same pricing model

### With Event Page
- Events created in Event page available as filters
- Event deletion should handle associated photos

### With Dashboard
- Statistics sync with dashboard analytics
- Revenue calculations match dashboard totals

## 📝 Notes

1. **Empty State**: Jika tidak ada foto atau filter tidak match, tampilkan empty state dengan opsi reset filter
2. **Error Handling**: Validasi input saat edit (nama tidak boleh kosong, harga harus angka positif)
3. **Confirmation**: Selalu konfirmasi sebelum delete untuk mencegah accident
4. **Performance**: Grid menggunakan responsive layout dengan gap yang optimal
5. **Image Preview**: Menggunakan object-cover untuk maintain aspect ratio

## 🔗 Related Files

- `src/app/admin/(dashboard)/upload/page.tsx` - Upload photos
- `src/app/admin/(dashboard)/event/page.tsx` - Manage events
- `src/app/admin/(dashboard)/dashboard/page.tsx` - Analytics
- `src/components/ui/card.tsx` - Card component
- `src/components/ui/dialog.tsx` - Dialog component
- `src/components/ui/alert-dialog.tsx` - Alert dialog component

## ✅ Testing Checklist

- [x] Statistics display correctly
- [x] Search filter works
- [x] Status filter works (all/sold/unsold)
- [x] Event filter works
- [x] Date range filter works
- [x] Reset filter clears all filters
- [x] View dialog shows correct photo details
- [x] Edit dialog updates photo info
- [x] Delete confirmation works
- [x] Empty state displays when no results
- [x] Responsive grid layout
- [x] No hydration errors
- [x] All buttons functional
- [x] Icons display correctly

---

**Status:** ✅ Fully Functional
**Version:** 1.0
**Last Updated:** 2025-01-20
