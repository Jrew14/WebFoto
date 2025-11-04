# Admin Settings Guide - Tripay & Fonnte Configuration

## 🎯 Overview
Halaman Admin Settings (`/admin/settings`) adalah tempat untuk mengkonfigurasi:
1. **Tripay Payment Gateway** - untuk pembayaran otomatis
2. **Fonnte WhatsApp** - untuk notifikasi ke customer

## 📍 Cara Mengakses Settings

### Via Sidebar
1. Login sebagai admin di `/admin/login`
2. Klik menu **Settings** di sidebar (icon ⚙️)
3. Anda akan diarahkan ke `/admin/settings`

### Via Dashboard Alert
Jika Tripay/Fonnte belum dikonfigurasi:
1. Alert kuning akan muncul di dashboard
2. Klik link **"Buka Settings →"**
3. Langsung ke halaman settings

## 🔧 Konfigurasi Tripay

### Langkah 1: Dapatkan Credentials
1. Login ke https://tripay.co.id
2. Go to **Settings** → **API Credentials**
3. Copy credentials berikut:
   - Merchant Code (contoh: T46723)
   - API Key
   - Private Key

### Langkah 2: Isi di Settings Page
1. **Environment Mode:** Pilih **Production**
2. **Merchant Code:** T46723
3. **API Key:** Paste dari dashboard
4. **Private Key:** Paste dari dashboard

### Langkah 3: Save & Restart
1. Klik tombol **Save Settings**
2. Tunggu pesan sukses
3. **PENTING:** Restart dev server:
   ```bash
   # Stop server (Ctrl+C)
   bun dev
   ```

### Verifikasi Tripay
Setelah restart, cek terminal log:
```
[Tripay] Using PRODUCTION mode with merchant code: T46723
[Tripay] API URL: https://tripay.co.id/api-merchant
```

Buka `/shop` - payment channels seharusnya muncul tanpa error.

## 💬 Konfigurasi Fonnte (WhatsApp)

### Langkah 1: Dapatkan Token
1. Login ke https://fonnte.com
2. Go to **API Settings** atau **Dashboard**
3. Copy **API Token**

### Langkah 2: Isi di Settings Page
1. Scroll ke section **WhatsApp Notification (Fonnte)**
2. **Fonnte API Token:** Paste token dari Fonnte
3. Klik **Save Settings**

### Langkah 3: Restart Server
```bash
# Stop server (Ctrl+C)
bun dev
```

### Verifikasi Fonnte
Test dengan melakukan purchase manual:
1. User beli foto via manual payment
2. Check WhatsApp user - seharusnya dapat invoice
3. Admin approve payment
4. Check WhatsApp user - seharusnya dapat notifikasi approval

## 🔍 Troubleshooting

### Error: "Tripay credentials not configured"
**Penyebab:** Server belum load credentials dari .env.local

**Solusi:**
1. Cek apakah sudah save di settings page
2. Restart server: `bun dev`
3. Check log terminal untuk konfirmasi

### Error: "Invalid API Key"
**Penyebab:** API Key salah atau tidak match dengan merchant code

**Solusi:**
1. Login ke Tripay dashboard
2. Copy ulang API Key yang benar
3. Paste di settings page
4. Save dan restart

### Error: "Sandbox API but with Production credential"
**Penyebab:** Mode di settings salah

**Solusi:**
1. Buka `/admin/settings`
2. Set mode ke **Production** (T46723 adalah production)
3. Save dan restart

### Payment channels tidak muncul
**Solusi:**
1. Cek terminal log untuk error details
2. Pastikan semua 3 credentials terisi
3. Pastikan mode sesuai (Production untuk T46723)
4. Restart server after save
5. Clear browser cache

### WhatsApp tidak terkirim
**Penyebab:** Fonnte token salah atau tidak aktif

**Solusi:**
1. Cek saldo Fonnte
2. Pastikan device WhatsApp connected
3. Test kirim via Fonnte dashboard
4. Copy ulang token yang aktif
5. Save dan restart

## 📂 File yang Dimodifikasi

### .env.local
Ketika save settings, file ini otomatis diupdate:
```bash
TRIPAY_MODE=production
TRIPAY_MERCHANT_CODE=T46723
TRIPAY_API_KEY=your_key_here
TRIPAY_PRIVATE_KEY=your_private_key_here
FONNTE_TOKEN=your_token_here
```

**JANGAN edit file ini manual!** Gunakan settings page.

## 🚀 Quick Start Checklist

- [ ] Login admin (`/admin/login`)
- [ ] Buka Settings (`/admin/settings`)
- [ ] Isi Tripay credentials (Mode: Production)
- [ ] Isi Fonnte token
- [ ] Klik Save
- [ ] Restart server (`bun dev`)
- [ ] Verify di terminal log
- [ ] Test di `/shop` page
- [ ] Test purchase manual
- [ ] Check WhatsApp notification

## 🎓 Video Tutorial (Coming Soon)
<!-- Add video embed atau link ke tutorial -->

## 📞 Support

Jika masalah persist:
1. Check terminal logs untuk error detail
2. Review `/docs/TRIPAY_CONFIGURATION.md`
3. Contact Tripay/Fonnte support
4. Check their service status

## 🔗 Related Documentation
- [Tripay Configuration](./TRIPAY_CONFIGURATION.md)
- [WhatsApp Notifications](./WHATSAPP_NOTIFICATION.md)
- [Admin Dashboard](./ADMIN_DASHBOARD_README.md)
- [Shop Page](./SHOP_README.md)

---

**Last Updated:** 2025-11-04  
**Version:** 1.0.0
