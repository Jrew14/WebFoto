# Vercel Deployment Guide

## Masalah yang Ditemukan dan Solusi

### 1. Build Command Issue ✅ FIXED
**Masalah:** Build gagal karena `--turbopack` flag di production build
**Solusi:** Remove `--turbopack` dari build script, hanya gunakan di dev

```json
// ✅ CORRECT
"build": "next build"

// ❌ WRONG (untuk production)
"build": "next build --turbopack"
```

### 2. Cara Deploy ke Vercel

#### A. Otomatis (Recommended)
Setiap push ke branch `main` akan otomatis trigger deployment:
```bash
git add .
git commit -m "your message"
git push origin main
```

#### B. Manual Force Deploy
Jika otomatis tidak jalan, buat empty commit:
```bash
git commit --allow-empty -m "chore: trigger vercel deployment"
git push origin main
```

#### C. Dari Vercel Dashboard
1. Login ke https://vercel.com
2. Pilih project **WebFoto**
3. Tab **Deployments** → klik "Redeploy"

## Konfigurasi Vercel

### Build Settings
```
Framework Preset: Next.js
Build Command: npm run build (atau bun run build)
Output Directory: .next (default)
Install Command: npm install (atau bun install)
```

### Environment Variables (PENTING!)
Pastikan semua ENV vars sudah diset di Vercel Dashboard → Settings → Environment Variables:

#### Database & Supabase
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

#### Payment Gateway (Tripay)
```
TRIPAY_API_KEY=CZip...
TRIPAY_PRIVATE_KEY=yfSTh...
TRIPAY_MERCHANT_CODE=T46723
TRIPAY_MODE=production
```

#### WhatsApp Notification (Fonnte)
```
FONNTE_TOKEN=q8WPZXP9...
```

#### App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

**CATATAN:** Setelah update environment variables, harus **Redeploy** manual!

## Troubleshooting

### Website Tidak Terupdate Setelah Push

1. **Cek Deployment Status**
   - Buka https://vercel.com/dashboard
   - Lihat apakah ada deployment baru yang "Building" atau "Failed"

2. **Cek Build Logs**
   - Klik deployment yang gagal
   - Baca "Build Logs" untuk error details

3. **Clear Cache Browser**
   - Hard refresh: `Ctrl + F5` (Windows) atau `Cmd + Shift + R` (Mac)
   - Atau buka di Incognito/Private mode

4. **Force Redeploy**
   ```bash
   git commit --allow-empty -m "chore: force deploy"
   git push origin main
   ```

### Build Error: Module Not Found

**Penyebab:** Dependencies tidak terinstall di Vercel

**Solusi:**
1. Pastikan package ada di `dependencies` (bukan `devDependencies`)
2. Cek `package-lock.json` atau `bun.lockb` sudah di-commit
3. Delete dan recreate Vercel project jika perlu

### Runtime Error: Environment Variables

**Penyebab:** ENV vars tidak diset di Vercel

**Solusi:**
1. Vercel Dashboard → Settings → Environment Variables
2. Add semua variables dari `.env.local`
3. **PENTING:** Klik "Redeploy" setelah update ENV vars

### Database Connection Error

**Penyebab:** 
- DATABASE_URL salah atau tidak diset
- Supabase connection pooling limit

**Solusi:**
1. Cek DATABASE_URL di Vercel matches dengan Supabase
2. Gunakan connection pooling mode: `?pgbouncer=true`
3. Increase connection limit di Supabase dashboard

### Static Generation Error

**Penyebab:** Dynamic routes menggunakan data dari database saat build

**Solusi:**
Add to pages that need dynamic data:
```typescript
export const dynamic = 'force-dynamic';
// atau
export const revalidate = 0;
```

## Monitoring Deployment

### Cek Deployment Status
```bash
# Via Vercel CLI (optional)
vercel ls

# Via Web
https://vercel.com/[your-username]/webfoto/deployments
```

### Cek Production URL
Setelah deploy berhasil, akses:
```
https://[your-project-name].vercel.app
```

## Best Practices

1. ✅ **Selalu test build locally sebelum push:**
   ```bash
   bun run build
   bun run start
   ```

2. ✅ **Commit .env.example untuk dokumentasi:**
   ```bash
   # .env.example (tanpa values asli)
   DATABASE_URL=
   TRIPAY_API_KEY=
   # dst...
   ```

3. ✅ **Gunakan semantic commit messages:**
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "chore: update dependencies"
   ```

4. ✅ **Monitor deployment logs:**
   - Cek setiap deployment apakah berhasil
   - Read build logs jika ada warning/error

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| "Port already in use" | Change port atau kill process |
| "Module not found" | `bun install` dan commit lock file |
| "Environment variable undefined" | Set di Vercel Dashboard + Redeploy |
| "Database connection failed" | Cek DATABASE_URL dan Supabase status |
| "Build timeout" | Optimize build, reduce dependencies |
| "Memory limit exceeded" | Upgrade Vercel plan atau optimize code |

## Update History

- **2025-11-05:** Fixed build command (removed --turbopack flag)
- **2025-11-05:** Added comprehensive deployment guide
- **2025-11-05:** Documented all environment variables needed
