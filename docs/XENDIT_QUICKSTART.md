# 🚀 Quick Start - Xendit Payment Integration

## Yang Sudah Disiapkan:

✅ **Xendit SDK** - Sudah terinstall (`xendit-node`)
✅ **Database Schema** - Tabel `purchases` sudah update
✅ **Payment Service** - Logic untuk create & manage purchases
✅ **API Endpoints** - `/api/purchases/create` dan `/api/webhooks/xendit`
✅ **UI Pages** - Payment success & failed pages
✅ **Buy Flow** - Integrated di shop page

---

## Yang Harus Anda Lakukan:

### 1️⃣ Daftar Akun Xendit (5 menit)

```
📍 https://dashboard.xendit.co/register

Isi:
- Email bisnis
- Nama perusahaan: Soraroid
- Kategori: Digital Products
- Verifikasi email
```

### 2️⃣ Dapatkan API Keys (2 menit)

```
📍 https://dashboard.xendit.co/settings/developers

1. Aktifkan mode "Test"
2. Copy "Secret Key" (xnd_development_xxx)
3. Copy "Webhook Verification Token"
```

### 3️⃣ Update Environment Variables (1 menit)

Edit file `.env.local`:

```bash
# Tambahkan di baris paling bawah:
XENDIT_SECRET_KEY=xnd_development_paste_key_disini
XENDIT_WEBHOOK_TOKEN=paste_token_disini
NEXT_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_development_xxx
```

### 4️⃣ Run Database Migration (1 menit)

```bash
# Option 1: Via Supabase Dashboard
# - Buka SQL Editor
# - Copy isi file: supabase/migrations/003_add_xendit_fields.sql
# - Paste dan Execute

# Option 2: Via CLI (jika sudah setup)
supabase db push
```

### 5️⃣ Setup Webhook untuk Testing (3 menit)

```bash
# Install ngrok (download dari https://ngrok.com)
# Run ngrok
ngrok http 3000

# Copy HTTPS URL (contoh: https://abc123.ngrok.io)
```

Lalu di Xendit Dashboard:
```
📍 https://dashboard.xendit.co/settings/developers/webhooks

1. Add Webhook URL
2. URL: https://abc123.ngrok.io/api/webhooks/xendit
3. Select events: Invoice Paid, Invoice Expired
4. Save
```

### 6️⃣ Test Payment (2 menit)

```bash
# Start dev server
bun dev

# Buka browser:
# 1. Login sebagai buyer
# 2. Buka /shop
# 3. Klik Buy pada foto
# 4. Klik "Proceed to Payment"
# 5. Test dengan kartu kredit test:
#    - Card: 4000 0000 0000 0002
#    - CVV: 123
#    - Exp: any future date
```

---

## 🧪 Test Payment Methods

### Credit Card (Instant - Recommended for testing)
```
Card Number: 4000 0000 0000 0002
CVV: 123
Exp: 12/25
Name: Test User
```

### Virtual Account (Auto-paid after 3 min in test mode)
- BCA, Mandiri, BRI akan muncul nomor VA
- Tunggu 3 menit, payment auto-complete

### E-Wallet (Auto-approved in test mode)
- OVO: 08123456789
- Dana: 08123456789

---

## ✅ Verification Checklist

Setelah test payment:

- [ ] Browser redirect ke Xendit payment page
- [ ] Isi payment (credit card test)
- [ ] Redirect ke `/payment/success`
- [ ] Check terminal logs: "Purchase paid: xxx"
- [ ] Check database:
```sql
SELECT * FROM purchases WHERE payment_status = 'paid';
SELECT * FROM photos WHERE sold = true;
```
- [ ] Foto muncul di Gallery user
- [ ] Foto hilang dari Shop (sudah sold)

---

## 🎯 Total Time: ~15 menit

**Setelah selesai, payment system sudah siap!** 🎉

User bisa:
- ✅ Klik Buy pada foto
- ✅ Redirect ke payment page Xendit
- ✅ Bayar dengan berbagai metode
- ✅ Otomatis mendapat akses foto setelah bayar
- ✅ Download full resolution dari Gallery

---

## 📖 Need More Details?

Baca dokumentasi lengkap: `docs/XENDIT_INTEGRATION.md`

Ada masalah? Check section **Troubleshooting** di dokumentasi.
