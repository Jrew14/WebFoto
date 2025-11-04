# ✅ Fix Sidebar User Data - Tampilkan Data Admin yang Login

## Masalah

Data di sidebar tidak sesuai dengan admin yang login. Nama dan email masih hardcoded:
- Nama: "Admin" (hardcoded)
- Email: "admin@webfoto.com" (hardcoded)

## Solusi

Mengubah `AppSidebar` untuk menerima props `user` dan `profile` dari layout, kemudian menampilkan data real dari database.

## Perubahan yang Dibuat

### 1. Admin Layout
**File**: `src/app/admin/(dashboard)/layout.tsx`

Sebelum:
```tsx
// Hanya load role
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

// Pass tanpa props
<AppSidebar />
```

Sesudah:
```tsx
// Load seluruh data profile
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();

// Pass user dan profile sebagai props
<AppSidebar user={user} profile={profile} />
```

### 2. AppSidebar Component
**File**: `src/components/admin/Sidebar.tsx`

Perubahan:
1. ✅ Tambah TypeScript interfaces untuk Profile dan AppSidebarProps
2. ✅ Terima props `user` dan `profile`
3. ✅ Tampilkan `profile.full_name` (fallback ke "Admin")
4. ✅ Tampilkan `profile.email`
5. ✅ Tampilkan avatar jika ada `profile.avatar_url`
6. ✅ Tampilkan initial huruf pertama nama jika avatar tidak ada

Sebelum:
```tsx
export function AppSidebar() {
  // Hardcoded data
  <span>Admin</span>
  <span>admin@webfoto.com</span>
}
```

Sesudah:
```tsx
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AppSidebarProps {
  user: SupabaseUser;
  profile: Profile;
}

export function AppSidebar({ user, profile }: AppSidebarProps) {
  // Dynamic data dari props
  {profile.avatar_url ? (
    <Avatar>
      <AvatarImage src={profile.avatar_url} />
      <AvatarFallback>
        {profile.full_name?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  ) : (
    <User icon />
  )}
  
  <span>{profile.full_name || "Admin"}</span>
  <span>{profile.email}</span>
}
```

## Fitur Sidebar User Info

### Data yang Ditampilkan:
1. **Avatar**
   - Jika ada `avatar_url`: Tampilkan foto profile
   - Jika tidak ada: Tampilkan icon User dengan background primary
   - Avatar Fallback: Huruf pertama nama

2. **Nama Admin**
   - Dari `profile.full_name`
   - Fallback: "Admin" jika belum diisi

3. **Email Admin**
   - Dari `profile.email` (linked to auth)

### Flow Data:
```
Server (layout.tsx)
  ↓ Load from Supabase
Database (profiles table)
  ↓ Pass as props
Client Component (AppSidebar)
  ↓ Display
UI (Sidebar Footer)
```

## Testing

1. **Admin dengan Full Name**
   - Login sebagai admin yang punya full_name
   - Sidebar akan tampilkan nama tersebut
   - Email dari database

2. **Admin tanpa Full Name**
   - Login sebagai admin yang belum set full_name
   - Sidebar akan tampilkan "Admin" (fallback)
   - Email tetap muncul

3. **Admin dengan Avatar**
   - Upload foto di `/admin/profile`
   - Avatar akan tampil di sidebar
   - Hover untuk dropdown menu

## Hasil

✅ Sidebar sekarang menampilkan data real admin yang login
✅ Nama diambil dari `profiles.full_name`
✅ Email diambil dari `profiles.email`
✅ Avatar tampil jika sudah upload
✅ Fallback UI untuk data yang belum lengkap

## Status

- [x] Load full profile data di layout
- [x] Pass props ke AppSidebar
- [x] Add TypeScript interfaces
- [x] Display dynamic name
- [x] Display dynamic email
- [x] Add avatar support
- [x] Add fallback UI
- [x] Test with real data

**Sidebar user data sudah sync dengan database! 🎉**
