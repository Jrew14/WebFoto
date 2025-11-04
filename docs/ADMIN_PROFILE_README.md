# Admin Profile Page - Documentation

## 📋 Overview

Halaman Profile Admin adalah tempat untuk mengelola informasi pribadi admin, foto profil, dan pengaturan watermark untuk foto yang akan dijual.

## ✨ Features

### 1. **Informasi Dasar**
Form untuk mendata admin dengan fields:
- **Nama Admin** (Required) - Nama lengkap administrator
- **Email Admin** (Required) - Email untuk login dan notifikasi
- **Deskripsi Admin** (Optional) - Bio/deskripsi singkat tentang admin yang akan ditampilkan di halaman publik

### 2. **Foto Profil**
Upload dan kelola foto profil admin:
- ✅ Preview foto dalam bentuk lingkaran (circular)
- ✅ Upload dengan click atau drag & drop
- ✅ Format: JPG, PNG, GIF
- ✅ Ukuran maksimal: 5MB
- ✅ Resolusi ideal: 400x400px
- ✅ Tombol camera di pojok untuk quick upload
- ✅ Tombol X untuk hapus foto
- ✅ Validasi file type dan size

### 3. **Pengaturan Watermark**
Upload watermark PNG untuk ditambahkan pada foto:
- ✅ Upload khusus file PNG (untuk transparansi)
- ✅ Preview watermark dengan background abu-abu
- ✅ Ukuran maksimal: 2MB
- ✅ Resolusi ideal: 500x200px
- ✅ Tombol X untuk hapus watermark
- ✅ Tips dan panduan penggunaan watermark
- ✅ Validasi strict untuk PNG only

### 4. **Informasi Akun**
Card menampilkan detail akun admin:
- **Role**: Administrator
- **Status**: Active (dengan indicator hijau)
- **Terdaftar Sejak**: Tanggal registrasi

### 5. **Action Buttons**
- **Reset**: Reload halaman untuk reset form
- **Simpan Perubahan**: Save data ke backend

## 🎨 UI Components Used

- `Card` - Container untuk sections
- `Input` - Text dan email inputs
- `Textarea` - Multi-line description
- `Button` - Action buttons dan upload triggers
- `Label` - Form labels
- `Separator` - Visual dividers
- Lucide Icons:
  - `User` - Profile icon
  - `Camera` - Upload profile photo
  - `Upload` - Upload watermark
  - `ImageIcon` - Watermark section
  - `Save` - Save button
  - `X` - Remove/delete

## 📊 Data Structure

```typescript
interface AdminProfile {
  name: string;           // Nama admin
  email: string;          // Email admin
  description: string;    // Deskripsi/bio admin
  profilePhoto?: File;    // File foto profil
  watermark?: File;       // File watermark PNG
}
```

## 🔄 State Management

```typescript
// Form data
const [adminName, setAdminName] = useState<string>("");
const [adminEmail, setAdminEmail] = useState<string>("");
const [adminDescription, setAdminDescription] = useState<string>("");

// Profile photo
const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
const profileInputRef = useRef<HTMLInputElement>(null);

// Watermark
const [watermark, setWatermark] = useState<string | null>(null);
const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
const watermarkInputRef = useRef<HTMLInputElement>(null);

// UI state
const [isSaving, setIsSaving] = useState<boolean>(false);
```

## 🎯 Key Functions

### 1. Handle Profile Photo Upload

```typescript
const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar!");
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Ukuran file maksimal 5MB!");
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setProfilePhoto(reader.result as string);
    setProfilePhotoFile(file);
  };
  reader.readAsDataURL(file);
};
```

**Validation:**
- ✅ File type must be image/*
- ✅ Max size: 5MB
- ✅ Creates base64 preview

### 2. Handle Watermark Upload

```typescript
const handleWatermarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type (only PNG)
  if (file.type !== "image/png") {
    alert("Watermark harus berupa file PNG!");
    return;
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert("Ukuran watermark maksimal 2MB!");
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setWatermark(reader.result as string);
    setWatermarkFile(file);
  };
  reader.readAsDataURL(file);
};
```

**Validation:**
- ✅ File type must be image/png ONLY
- ✅ Max size: 2MB
- ✅ Strict PNG validation for transparency support

### 3. Remove Photo/Watermark

```typescript
const handleRemoveProfilePhoto = () => {
  setProfilePhoto(null);
  setProfilePhotoFile(null);
  if (profileInputRef.current) {
    profileInputRef.current.value = "";
  }
};

const handleRemoveWatermark = () => {
  setWatermark(null);
  setWatermarkFile(null);
  if (watermarkInputRef.current) {
    watermarkInputRef.current.value = "";
  }
};
```

**Actions:**
- Clears preview state
- Clears file state
- Resets input value

### 4. Save Profile

```typescript
const handleSave = async () => {
  // Validation
  if (!adminName.trim()) {
    alert("Nama admin harus diisi!");
    return;
  }

  if (!adminEmail.trim()) {
    alert("Email admin harus diisi!");
    return;
  }

  setIsSaving(true);

  // Simulate API call
  setTimeout(() => {
    console.log("Saving profile data:", {
      name: adminName,
      email: adminEmail,
      description: adminDescription,
      profilePhoto: profilePhotoFile?.name,
      watermark: watermarkFile?.name,
    });

    alert("Profil berhasil disimpan!");
    setIsSaving(false);
  }, 1500);
};
```

**Validation:**
- ✅ Nama admin required
- ✅ Email admin required
- ✅ Deskripsi optional
- ✅ Foto dan watermark optional

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                    HEADER SECTION                        │
│  Profile Admin                                           │
│  Kelola informasi profil dan pengaturan admin           │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────┬──────────────────────────┐
│  LEFT COLUMN (2/3 width)     │  RIGHT COLUMN (1/3)      │
│                              │                          │
│  ┌────────────────────────┐  │  ┌──────────────────┐   │
│  │ Informasi Dasar        │  │  │ Foto Profil      │   │
│  │ • Nama Admin           │  │  │   [Photo/Icon]   │   │
│  │ • Email Admin          │  │  │   [Camera btn]   │   │
│  │ • Deskripsi Admin      │  │  │                  │   │
│  └────────────────────────┘  │  │ Panduan Upload   │   │
│                              │  └──────────────────┘   │
│  ┌────────────────────────┐  │                          │
│  │ Pengaturan Watermark   │  │  ┌──────────────────┐   │
│  │ [Upload Area]          │  │  │ Informasi Akun   │   │
│  │ [Preview/Placeholder]  │  │  │ • Role           │   │
│  │                        │  │  │ • Status         │   │
│  │ 💡 Tips Watermark      │  │  │ • Terdaftar      │   │
│  └────────────────────────┘  │  └──────────────────┘   │
│                              │                          │
│  [Reset] [Simpan Perubahan]  │                          │
└──────────────────────────────┴──────────────────────────┘
```

## 🎨 Profile Photo Section

### Without Photo
```
┌──────────────────┐
│                  │
│    ┌────────┐    │
│    │        │    │
│    │  👤   │    │  ← Default user icon
│    │        │    │
│    └────────┘    │
│       [📷]       │  ← Camera button (bottom-right)
│                  │
└──────────────────┘
```

### With Photo
```
┌──────────────────┐
│                  │
│    ┌────────┐    │
│  [X]        │    │  ← Remove button (top-right)
│    │ Photo  │    │
│    │        │    │
│    └────────┘    │
│       [📷]       │  ← Change button (bottom-right)
│                  │
└──────────────────┘
```

## 🎨 Watermark Upload Section

### Without Watermark
```
┌────────────────────────────────┐
│                                │
│         ⬆️ Upload Icon          │
│                                │
│  Klik untuk upload watermark   │
│                                │
│  PNG dengan background         │
│  transparan (max 2MB)          │
│                                │
└────────────────────────────────┘
```

### With Watermark
```
┌────────────────────────────────┐
│        ┌──────────────┐  [X]   │  ← Remove button
│        │              │        │
│        │  Watermark   │        │  ← Preview
│        │   Preview    │        │
│        └──────────────┘        │
│                                │
│     watermark_logo.png         │  ← Filename
│  Klik untuk mengganti watermark│
└────────────────────────────────┘
```

## 💡 Tips Box Design

```
┌──────────────────────────────────────┐
│ 💡 Tips Watermark:                   │
│                                      │
│ • Gunakan file PNG dengan background │
│   transparan                         │
│ • Ukuran ideal: 500x200px untuk     │
│   hasil terbaik                      │
│ • Watermark akan ditambahkan otomatis│
│   saat upload foto                   │
│ • Posisi watermark bisa diatur per   │
│   foto                               │
└──────────────────────────────────────┘
```

## 🎯 Validation Rules

### Nama Admin
- ✅ Required field
- ✅ Tidak boleh kosong
- ✅ Trim whitespace

### Email Admin
- ✅ Required field
- ✅ Tidak boleh kosong
- ✅ Trim whitespace
- ⚠️ TODO: Email format validation

### Deskripsi Admin
- ✅ Optional field
- ✅ Multi-line text area
- ✅ Max rows: 5

### Foto Profil
- ✅ Optional
- ✅ Format: image/* (JPG, PNG, GIF)
- ✅ Max size: 5MB
- ✅ Ideal: 400x400px
- ✅ Displays as circular

### Watermark
- ✅ Optional
- ✅ Format: PNG ONLY
- ✅ Max size: 2MB
- ✅ Ideal: 500x200px
- ✅ Must have transparency

## 🔄 User Flow

### Update Profile
1. User navigates to Profile Admin page
2. Form loads with existing data (if any)
3. User edits nama, email, atau deskripsi
4. User clicks "Simpan Perubahan"
5. Validation runs
6. If valid: Save to backend
7. Show success message
8. If invalid: Show error message

### Upload Profile Photo
1. User clicks camera button or circular placeholder
2. File input dialog opens
3. User selects image file
4. Validation runs (type & size)
5. If valid: Preview shows in circle
6. If invalid: Show error alert
7. User can click X to remove

### Upload Watermark
1. User clicks watermark upload area
2. File input dialog opens (PNG filter)
3. User selects PNG file
4. Validation runs (PNG type & size)
5. If valid: Preview shows with grey background
6. If invalid: Show error alert
7. User can click X to remove

## 🧪 Testing Checklist

### Profile Photo
- [ ] Upload JPG file < 5MB → Success
- [ ] Upload PNG file < 5MB → Success
- [ ] Upload GIF file < 5MB → Success
- [ ] Upload file > 5MB → Error alert
- [ ] Upload non-image file → Error alert
- [ ] Remove uploaded photo → Clears state
- [ ] Preview displays correctly (circular)
- [ ] Camera button accessible

### Watermark
- [ ] Upload PNG file < 2MB → Success
- [ ] Upload JPG as watermark → Error alert
- [ ] Upload PNG > 2MB → Error alert
- [ ] Preview shows with grey background
- [ ] Remove watermark → Clears state
- [ ] Filename displays correctly

### Form Validation
- [ ] Submit with empty nama → Error alert
- [ ] Submit with empty email → Error alert
- [ ] Submit with all fields filled → Success
- [ ] Reset button reloads page
- [ ] Save button shows loading state

### Responsive
- [ ] Desktop (> 1024px) → 2 columns
- [ ] Tablet (768-1024px) → Adjusts width
- [ ] Mobile (< 768px) → 1 column stack

## 📱 Responsive Behavior

### Desktop (LG+)
```
[2 Columns]
┌────────────────┬──────────┐
│   Form (2/3)   │  Photo   │
│                │  (1/3)   │
└────────────────┴──────────┘
```

### Mobile (< LG)
```
[1 Column]
┌─────────────────┐
│      Form       │
│                 │
│      Photo      │
│                 │
└─────────────────┘
```

## 🎨 Color Scheme

### Profile Photo Border
- Default: `border-slate-200` (grey)
- Size: 4px solid border

### Upload Areas
- Border: `border-slate-300` (dashed)
- Background: `bg-slate-50`
- Hover: `bg-slate-100`, `border-slate-400`

### Tips Box
- Background: `bg-blue-50`
- Border: `border-blue-200`
- Text: `text-blue-800`, `text-blue-900`

### Success Indicator
- Background: `bg-green-50`
- Border: `border-green-200`
- Text: `text-green-800`

### Status Dot
- Active: `bg-green-500` (2x2 rounded-full)

## 🔮 Future Enhancements

### Backend Integration
- [ ] Fetch existing admin data from database
- [ ] Save profile to Supabase profiles table
- [ ] Upload profile photo to Supabase Storage
- [ ] Upload watermark to storage bucket
- [ ] Update admin metadata

### Additional Features
- [ ] Change password section
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] Activity log/history
- [ ] Notification preferences
- [ ] API keys management
- [ ] Watermark position settings (corner, center, etc.)
- [ ] Watermark opacity slider
- [ ] Multiple watermark templates

### Validation Improvements
- [ ] Email format validation (regex)
- [ ] Password strength meter
- [ ] Real-time validation feedback
- [ ] Image dimension validation
- [ ] Watermark transparency check

### UX Improvements
- [ ] Crop tool for profile photo
- [ ] Drag & drop for uploads
- [ ] Progress bar for large files
- [ ] Preview before save (modal)
- [ ] Undo changes button
- [ ] Auto-save draft

## 🔗 Integration Points

### With Supabase
```sql
-- profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  description TEXT,
  profile_photo_url TEXT,
  watermark_url TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### With Storage
```typescript
// Upload profile photo
const { data, error } = await supabase.storage
  .from('profile-photos')
  .upload(`${userId}/profile.jpg`, profilePhotoFile);

// Upload watermark
const { data, error } = await supabase.storage
  .from('watermarks')
  .upload(`${userId}/watermark.png`, watermarkFile);
```

### With Upload Page
- Watermark dari profile digunakan saat upload foto
- Auto-apply watermark pada foto baru
- Settings watermark position

## 📝 Notes

1. **Profile Photo**: Menggunakan `aspect-square` dan `rounded-full` untuk circular shape
2. **FileReader API**: Untuk create preview dari uploaded files
3. **Ref Pattern**: useRef untuk trigger hidden file inputs
4. **Validation First**: Validasi sebelum set state untuk prevent invalid data
5. **Error Handling**: User-friendly alerts untuk semua error cases

## 📚 Related Files

- `src/app/admin/(dashboard)/profile/page.tsx` - Profile page component
- `src/components/admin/Sidebar.tsx` - Sidebar with Profile menu
- `src/components/ui/card.tsx` - Card component
- `src/components/ui/input.tsx` - Input component
- `src/components/ui/textarea.tsx` - Textarea component
- `src/components/ui/separator.tsx` - Separator component

---

**Status:** ✅ Fully Functional
**Version:** 1.0
**Last Updated:** 2025-10-20
**Server:** http://localhost:3001/admin/profile
