# Google OAuth Setup Guide

## Setup Google OAuth di Supabase

### 1. Buat Google OAuth Credentials

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih atau buat project baru
3. Buka **APIs & Services** → **Credentials**
4. Klik **Create Credentials** → **OAuth client ID**
5. Pilih **Web application**
6. Isi konfigurasi:
   - **Name**: Soraroid Web App
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - `https://your-production-domain.com` (production)
   - **Authorized redirect URIs**:
     - `https://your-supabase-project.supabase.co/auth/v1/callback`
7. Klik **Create**
8. Copy **Client ID** dan **Client Secret**

### 2. Konfigurasi di Supabase Dashboard

1. Buka [Supabase Dashboard](https://app.supabase.com/)
2. Pilih project Anda
3. Buka **Authentication** → **Providers**
4. Cari **Google** dan aktifkan
5. Paste **Client ID** dan **Client Secret** dari Google Console
6. Klik **Save**

### 3. Update Environment Variables (Optional)

Jika perlu custom redirect URL, tambahkan ke `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Cara Kerja

1. User klik "Continue with Google"
2. Redirect ke Google OAuth consent screen
3. User pilih akun Google
4. Google redirect kembali ke `/auth/callback`
5. Callback handler:
   - Exchange code untuk session
   - Cek/buat profile di database
   - Redirect ke `/shop` (buyer) atau `/admin/dashboard` (admin)

## Testing

1. Jalankan development server: `bun dev`
2. Buka `http://localhost:3000/auth/signin`
3. Klik "Continue with Google"
4. Pilih akun Google
5. Harus redirect ke `/shop` setelah berhasil

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Pastikan redirect URI di Google Console sama persis dengan:
  `https://your-supabase-project.supabase.co/auth/v1/callback`

### Error: "oauth_failed"
- Cek Supabase logs di Dashboard → Authentication → Logs
- Pastikan Google Provider sudah diaktifkan
- Pastikan Client ID dan Secret benar

### Profile tidak terbuat
- Cek `/auth/callback/route.ts` 
- Cek database trigger atau RLS policies
- Cek Supabase logs

## File yang Terlibat

- `/src/app/auth/signin/page.tsx` - Sign in page dengan Google button
- `/src/app/auth/signup/page.tsx` - Sign up page dengan Google button
- `/src/app/auth/callback/route.ts` - OAuth callback handler
- `/src/services/auth.client.ts` - Auth service dengan `signInWithGoogle()`

## Security Notes

- Google OAuth users default role: `buyer`
- Profile otomatis dibuat saat first login
- Avatar diambil dari Google profile picture
- Email sudah terverifikasi otomatis (tidak perlu email confirmation)
