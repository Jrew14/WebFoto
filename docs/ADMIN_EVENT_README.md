# Event Management - WebFoto

## 🎯 Overview
Halaman Event Management untuk membuat dan mengelola folder event yang mengorganisir foto-foto berdasarkan acara/event tertentu.

## 📁 File yang Dibuat

### Components & Pages
- `src/components/admin/Sidebar.tsx` - **Updated**: Tambah menu "Event" dengan icon FolderOpen
- `src/app/admin/(dashboard)/event/page.tsx` - Halaman Event Management lengkap

### shadcn Components Used
- `Dialog` - Modal untuk form tambah event
- `Textarea` - Input multi-line untuk deskripsi
- `Card` - Display event cards
- `Button`, `Input`, `Label` - Form components

## 🎨 Fitur Halaman Event

### 1. Sidebar Menu - Event (NEW)
- ✅ Menu "Event" ditambahkan setelah Dashboard
- ✅ Icon FolderOpen untuk represent folder management
- ✅ Active state ketika berada di halaman event
- ✅ Route: `/admin/event`

### 2. Header Section
- **Title**: Event Management
- **Description**: "Kelola folder event untuk mengorganisir foto-foto"

### 3. Actions Bar

#### Button Tambah Folder Baru
- ✅ Memunculkan modal dialog form
- ✅ Icon Plus dengan text "Tambah Folder Baru"
- ✅ Primary button styling (hitam)

#### Filter Tanggal
- ✅ **Dari Tanggal**: Input date picker untuk start date
- ✅ **Sampai Tanggal**: Input date picker untuk end date
- ✅ **Clear Button**: Muncul ketika ada filter aktif
- ✅ Filter otomatis apply saat tanggal dipilih
- ✅ Responsive layout (stack di mobile)

### 4. Form Tambah Event (Dialog Modal)

**Fields:**
1. **Nama Event*** (required)
   - Input text
   - Placeholder: "Contoh: Wedding John & Jane"
   - Validasi: Wajib diisi

2. **Deskripsi** (optional)
   - Textarea (3 rows)
   - Placeholder: "Deskripsi singkat tentang event"
   - Untuk informasi tambahan event

3. **Tanggal Event*** (required)
   - Date picker
   - Validasi: Wajib diisi
   - Format: YYYY-MM-DD

**Actions:**
- ✅ **Batal**: Close dialog tanpa save
- ✅ **Simpan Event**: Validate & create event

**Features:**
- Form validation (nama & tanggal wajib diisi)
- Auto close dialog setelah submit
- Reset form setelah save
- Error alert jika validasi gagal

### 5. Event List (Grid Cards)

**Layout:**
- Grid responsive: 1 kolom (mobile), 2 kolom (tablet), 3 kolom (desktop)
- Card design dengan hover shadow effect
- Cursor pointer untuk indicate clickable

**Setiap Card Menampilkan:**
- ✅ **Icon Folder**: Visual indicator sebagai folder
- ✅ **Nama Event**: Bold title
- ✅ **Deskripsi**: Gray subtitle (atau "Tidak ada deskripsi")
- ✅ **Tanggal Event**: Icon calendar + formatted date (Indonesia)
- ✅ **Jumlah Foto**: Counter "X foto"
- ✅ **Action Buttons**:
  - Edit (Pencil icon) - Blue hover
  - Delete (Trash2 icon) - Red hover
- ✅ **More Options**: Three dots menu (top right)

**Empty State:**
- Icon folder besar (gray)
- Heading: "Tidak ada event ditemukan"
- Description context-aware:
  - Jika ada filter: "Coba ubah filter tanggal atau buat event baru"
  - Jika tidak ada filter: "Mulai dengan membuat folder event pertama Anda"
- Button "Tambah Event" (hanya muncul jika tidak ada filter)

### 6. Summary Footer
- Menampilkan: "Menampilkan X dari Y total event"
- Background slate-50 dengan border
- Hanya muncul jika ada events

## 📊 Mock Data (Demo)

Saat ini menggunakan 3 event dummy:
```typescript
[
  {
    id: "1",
    name: "Wedding John & Jane",
    description: "Pernikahan di Ballroom Hotel Grand",
    eventDate: "2024-12-25",
    photoCount: 245,
  },
  {
    id: "2",
    name: "Corporate Annual Meeting 2024",
    description: "Meeting tahunan perusahaan PT XYZ",
    eventDate: "2024-11-10",
    photoCount: 89,
  },
  {
    id: "3",
    name: "Birthday Party - Sarah",
    description: "Pesta ulang tahun ke-25",
    eventDate: "2024-10-30",
    photoCount: 156,
  },
]
```

## 🔄 Functionality

### Create Event
1. Klik "Tambah Folder Baru"
2. Modal form muncul
3. Isi nama event dan tanggal (wajib)
4. Isi deskripsi (optional)
5. Klik "Simpan Event"
6. Event baru muncul di list (paling atas)

### Filter Events
1. Pilih "Dari Tanggal" untuk start date
2. Pilih "Sampai Tanggal" untuk end date
3. List otomatis ter-filter
4. Klik "Clear" untuk reset filter

**Filter Logic:**
- Jika hanya start date: Show events >= start date
- Jika hanya end date: Show events <= end date
- Jika keduanya: Show events dalam range
- Jika tidak ada: Show semua events

### Edit Event (Placeholder)
- Button edit tersedia dengan icon Pencil
- Hover effect blue
- Belum diimplementasikan (tunggu instruksi)

### Delete Event (Placeholder)
- Button delete tersedia dengan icon Trash2
- Hover effect red
- Belum diimplementasikan (tunggu instruksi)

## 🎨 Design System

### Colors
- **Primary Action**: Slate-900 (button, active menu)
- **Card Background**: White
- **Hover**: Shadow-lg transition
- **Icons**: Slate-600 (normal), Blue-600 (edit hover), Red-600 (delete hover)
- **Empty State**: Slate-300 (icon), Slate-500 (text)

### Typography
- **Page Title**: text-3xl font-bold
- **Card Title**: text-lg
- **Description**: CardDescription (gray)
- **Body Text**: text-sm

### Spacing
- **Page Padding**: p-8
- **Grid Gap**: gap-6
- **Card Gap**: space-y-2

## 🚀 Cara Menggunakan

### Akses Halaman Event
1. Login ke admin dashboard
2. Klik menu "Event" di sidebar
3. Akan redirect ke `/admin/event`

### Membuat Event Baru
```
1. Klik "Tambah Folder Baru"
2. Isi form:
   - Nama Event: "Wedding Sarah & Tom"
   - Deskripsi: "Pernikahan di Garden"
   - Tanggal: 2024-12-15
3. Klik "Simpan Event"
4. Event muncul di list
```

### Filter Event by Date
```
Scenario 1: Event bulan November
- Dari: 2024-11-01
- Sampai: 2024-11-30
- Result: Hanya event di November

Scenario 2: Event setelah hari ini
- Dari: 2024-10-20
- Sampai: (kosong)
- Result: Semua event dari 20 Oct keatas
```

## 📱 Responsive Design

### Mobile (< 768px)
- 1 kolom grid untuk event cards
- Filter dates stack vertically
- Full width buttons

### Tablet (768px - 1024px)
- 2 kolom grid untuk event cards
- Filter dates inline

### Desktop (> 1024px)
- 3 kolom grid untuk event cards
- All elements inline

## 🔧 Tech Stack

- **Next.js 15** - App Router dengan (dashboard) route group
- **React 19** - Client components dengan useState
- **TypeScript** - Type safety untuk Event interface
- **shadcn/ui** - Dialog, Card, Form components
- **Lucide React** - Icons (FolderOpen, Calendar, Plus, dll)
- **Tailwind CSS** - Styling & responsive

## 🎯 Type Definition

```typescript
interface Event {
  id: string;
  name: string;
  description: string;
  eventDate: string; // ISO format YYYY-MM-DD
  createdAt: string;
  photoCount?: number;
}
```

## 🚧 Next Steps (Not Implemented Yet)

Fitur yang belum diimplementasi dan menunggu instruksi:
1. **Edit Event** - Form edit dengan pre-filled data
2. **Delete Event** - Confirmation dialog & hapus dari list
3. **More Options Menu** - Dropdown dengan actions tambahan
4. **Click Event Card** - Navigate ke detail/gallery event
5. **Backend Integration** - Save ke database (Supabase)
6. **API Routes** - CRUD endpoints untuk events
7. **Photo Upload to Event** - Link upload dengan event folder

## 📸 Preview Routes

- **Event Management**: `http://localhost:3001/admin/event`

## 🐛 Troubleshooting

### Modal tidak muncul
- Pastikan Dialog component dari shadcn sudah terinstall
- Check console untuk error

### Filter tidak bekerja
- Pastikan format date dalam ISO (YYYY-MM-DD)
- Check browser console untuk error

### Event tidak tersimpan
- Saat ini hanya tersimpan di state (tidak persist)
- Refresh page akan reset ke mock data
- Tunggu implementasi backend integration

## 📝 Menu Sidebar Update

Urutan menu terbaru:
1. ✅ **Dashboard** - Analytics & statistics
2. ✅ **Event** - Folder management ← **NEW**
3. ⏳ **Unggah Foto** - Bulk upload (coming soon)
4. ⏳ **Gallery Foto** - Photo management (coming soon)
5. ⏳ **Profile Admin** - Admin settings (coming soon)
6. 🔴 **Logout** - Sign out

## ✅ Summary

Halaman Event Management sudah siap dengan:
- ✅ Menu di sidebar
- ✅ Form tambah event dengan validation
- ✅ Filter tanggal (dari - sampai)
- ✅ List event cards dengan responsive grid
- ✅ Empty state dengan context-aware message
- ✅ Mock data untuk demo
- ⏳ Edit & delete (placeholder - tunggu instruksi)

Server running di: **http://localhost:3001/admin/event** 🎉
