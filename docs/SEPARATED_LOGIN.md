# Pemisahan Login Admin dan User (Cookie-Based Session)

## ✅ Perubahan yang Dilakukan

Sistem login telah dipisahkan antara **Admin** dan **User (Buyer)** menggunakan **custom cookie-based session** untuk mengatasi masalah single session Supabase Auth.

### 🎯 Masalah Sebelumnya:

**Issue**: Ketika admin login di `/admin/login`, mereka otomatis juga login di halaman user (`/gallery`, `/shop`) karena Supabase Auth menggunakan **single session** untuk satu browser.

### 🔧 Solusi:

Menggunakan **custom cookie `admin_session`** untuk membedakan admin session dari user session:

1. **Admin Login** → Set cookie `admin_session=true`
2. **Admin Access User Routes** → Middleware detect cookie, redirect ke `/admin/dashboard`
3. **Admin Logout** → Hapus cookie `admin_session`
4. **User Access** → Tidak ada cookie `admin_session`, bisa akses `/gallery` & `/shop`

---

## 📁 File yang Dimodifikasi:

### 1. **`src/app/api/admin/auth/login/route.ts`**
**Perubahan**: Menambahkan cookie `admin_session` saat admin berhasil login

```typescript
// Set admin session cookie (httpOnly untuk keamanan)
response.cookies.set("admin_session", "true", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24, // 24 hours
  path: "/",
});
```

### 2. **`src/app/api/admin/auth/logout/route.ts`**
**Perubahan**: Menghapus cookie `admin_session` saat logout

```typescript
// Hapus admin session cookie
response.cookies.delete("admin_session");
```

### 3. **`src/middleware.ts`**
**Perubahan**: Menggunakan cookie untuk validasi admin session

```typescript
// Check if user has admin session cookie
const hasAdminSession = request.cookies.get("admin_session")?.value === "true";

// Protect admin routes
if (request.nextUrl.pathname.startsWith("/admin")) {
  if (!user || !hasAdminSession) {
    // Redirect to admin login
  }
}

// Protect user routes - block if admin session is active
if (isUserRoute && hasAdminSession) {
  // Redirect admin to dashboard with info message
  const url = new URL("/admin/dashboard", request.url);
  url.searchParams.set("info", "admin_cannot_access_user_routes");
  return NextResponse.redirect(url);
}
```

### 4. **`src/components/admin/Sidebar.tsx`**
**Perubahan**: Update handleLogout untuk menggunakan fetch API

```typescript
const handleLogout = async () => {
  const response = await fetch("/api/admin/auth/logout", {
    method: "POST",
  });
  
  if (response.ok) {
    window.location.href = "/admin/login";
  }
};
```

### 5. **`src/app/admin/(dashboard)/dashboard/page.tsx`**
**Perubahan**: Menambahkan info message jika admin coba akses user routes

```typescript
// Show info if redirected from user routes
const infoParam = searchParams.get("info");
if (infoParam === "admin_cannot_access_user_routes") {
  setShowInfo(true);
}
```

---

## 🧪 Testing Guide

### ✅ Test Case 1: Admin Login & Access Admin Routes
1. Buka http://localhost:3002/admin/login
2. Login dengan akun admin
3. **Expected**: Cookie `admin_session=true` di-set
4. **Result**: Redirect ke `/admin/dashboard`
5. Coba akses `/admin/gallery`, `/admin/event`, dll
6. **Expected**: Semua admin routes bisa diakses

### ✅ Test Case 2: Admin Coba Akses User Routes
1. Login sebagai admin (masih dalam session)
2. Coba buka http://localhost:3002/gallery
3. **Expected**: Redirect ke `/admin/dashboard?info=admin_cannot_access_user_routes`
4. **Result**: Info message muncul: "Anda sedang login sebagai admin..."

### ✅ Test Case 3: Admin Logout
1. Klik tombol Logout di admin sidebar
2. **Expected**: Cookie `admin_session` dihapus
3. **Result**: Redirect ke `/admin/login`
4. Session Supabase Auth juga di-clear

### ✅ Test Case 4: User Login & Access User Routes
1. Logout dari admin (jika masih login)
2. Buka http://localhost:3002/auth/signin
3. Login dengan akun buyer
4. **Expected**: Tidak ada cookie `admin_session`
5. Buka `/gallery` dan `/shop`
6. **Expected**: Bisa akses semua user routes

### ✅ Test Case 5: User Coba Akses Admin Routes
1. Login sebagai buyer (tidak ada cookie `admin_session`)
2. Coba buka http://localhost:3002/admin/dashboard
3. **Expected**: Redirect ke `/admin/login`
4. **Result**: Tidak bisa akses admin routes

---

## 🔐 Security Flow

```mermaid
graph TD
    A[User Login] --> B{Login di mana?}
    B -->|Admin Login| C[/api/admin/auth/login]
    B -->|User Login| D[AuthService.signIn]
    
    C --> E{Validate Admin Role}
    E -->|Valid Admin| F[Set admin_session=true Cookie]
    E -->|Not Admin| G[Logout + Error]
    
    F --> H[Admin Routes Accessible]
    
    D --> I{Validate Buyer Role}
    I -->|Valid Buyer| J[User Routes Accessible]
    I -->|Is Admin| K[Logout + Error]
    
    H --> L{Try Access User Route?}
    L -->|Yes + Has Cookie| M[Redirect to Admin Dashboard]
    L -->|No| H
    
    J --> N{Try Access Admin Route?}
    N -->|Yes + No Cookie| O[Redirect to Admin Login]
    N -->|No| J
```

---

## 📊 Cookie & Session Matrix

| State | admin_session Cookie | Supabase Auth Session | Can Access Admin | Can Access User |
|-------|---------------------|----------------------|------------------|-----------------|
| Admin Logged In | ✅ `true` | ✅ Active | ✅ Yes | ❌ No (Redirect) |
| User Logged In | ❌ Not Set | ✅ Active | ❌ No (Redirect) | ✅ Yes |
| Not Logged In | ❌ Not Set | ❌ None | ❌ No (Login) | ❌ No (Login) |
| Admin Logout | ❌ Deleted | ❌ Cleared | ❌ No (Login) | ✅ Yes (If relogin) |

---

## 🎨 User Experience

### Admin Experience:
1. Login di `/admin/login` → Dashboard
2. Akses semua `/admin/*` routes tanpa masalah
3. Jika coba akses `/gallery` atau `/shop` → Redirect dengan pesan info
4. Info message: "Anda sedang login sebagai admin. Halaman Gallery dan Shop hanya dapat diakses oleh user biasa."
5. Logout → Cookie dihapus, session di-clear

### User Experience:
1. Login di `/auth/signin` → User routes
2. Akses `/gallery` dan `/shop` tanpa masalah
3. Jika coba akses `/admin/*` → Redirect ke admin login
4. Tidak terpengaruh oleh admin session sama sekali

---

## 🚀 Technical Implementation

### Cookie Configuration:
```typescript
{
  httpOnly: true,          // Tidak bisa diakses via JavaScript (XSS protection)
  secure: true,            // HTTPS only di production
  sameSite: "lax",        // CSRF protection
  maxAge: 60 * 60 * 24,   // 24 hours
  path: "/",              // Available di semua routes
}
```

### Middleware Logic:
1. **Check Cookie First**: `hasAdminSession = cookie.get("admin_session")`
2. **Validate with DB**: Query `profiles` table untuk confirm role
3. **Route Protection**: Block access berdasarkan cookie + role
4. **Clean Redirect**: Hapus cookie jika role tidak match

---

## 🔧 Troubleshooting

### Issue: Admin masih bisa akses user routes
**Check**: 
- Apakah cookie `admin_session` ter-set? (Check di DevTools → Application → Cookies)
- Apakah middleware config matcher sudah include user routes?

**Solution**: Clear cookies dan login ulang

### Issue: Cookie tidak ter-set setelah login
**Check**: 
- Response dari `/api/admin/auth/login` di Network tab
- Apakah ada error di console?

**Solution**: Pastikan API route return response dengan `response.cookies.set()`

### Issue: User bisa akses admin routes
**Check**: 
- Apakah user memiliki cookie `admin_session`?
- Apakah middleware jalan untuk `/admin/*` routes?

**Solution**: Pastikan middleware matcher config benar

---

## ✅ Checklist Implementasi

- [x] Set cookie `admin_session` saat admin login
- [x] Hapus cookie `admin_session` saat admin logout
- [x] Update middleware untuk check cookie
- [x] Block admin dari user routes dengan redirect
- [x] Tambah info message di dashboard
- [x] Update logout handler di Sidebar
- [x] Test admin login & access admin routes
- [x] Test admin blocked dari user routes
- [x] Test user login & access user routes
- [x] Test user blocked dari admin routes
- [x] Documentation

---

## 📝 Key Differences dari Implementasi Sebelumnya

### ❌ Implementasi Lama (Auto Logout):
- Admin login → Coba akses `/gallery` → **Auto logout** → Redirect
- **Problem**: Admin kehilangan session, harus login ulang
- User experience: **Buruk**, confusing

### ✅ Implementasi Baru (Cookie-Based):
- Admin login → Cookie `admin_session=true` di-set
- Coba akses `/gallery` → **Redirect dengan info** → Tetap login
- **Benefit**: Admin tetap login, hanya diarahkan kembali
- User experience: **Baik**, clear & informative

---

## 🎯 Kesimpulan

Implementasi cookie-based session ini memecahkan masalah **single session** Supabase Auth dengan cara:

1. ✅ **Tidak mengganggu Supabase Auth** (tetap menggunakan session asli)
2. ✅ **Menambah layer validasi** via custom cookie
3. ✅ **Better UX** - admin tidak auto logout
4. ✅ **Clear separation** - admin & user routes terpisah jelas
5. ✅ **Secure** - httpOnly cookie, role validation di server-side

**Result**: Admin dan User sekarang benar-benar terpisah! 🎉
