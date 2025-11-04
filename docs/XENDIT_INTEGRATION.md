# 💳 Xendit Payment Integration - Setup Guide

## 📋 Ringkasan

Integrasi Xendit telah diimplementasikan untuk sistem pembayaran foto. User bisa membeli foto dengan berbagai metode pembayaran yang disediakan Xendit.

---

## 🔑 Persiapan Akun Xendit

### 1. Daftar Akun Xendit
1. Buka https://dashboard.xendit.co/register
2. Pilih **Business Account**
3. Isi data:
   - Email bisnis
   - Nama perusahaan: **Soraroid**
   - Kategori bisnis: **Digital Products/Services**
   - Nomor telepon
4. Verifikasi email
5. Lengkapi data perusahaan (KTP, NPWP untuk Indonesia)
6. Tunggu approval (1-3 hari kerja)

### 2. Dapatkan API Keys

#### Mode Development (Testing)
1. Login ke https://dashboard.xendit.co/
2. Pastikan mode **Test** aktif (toggle di pojok kanan atas)
3. Buka **Settings** → **Developers** → **API Keys**
4. Copy **Secret Key** (prefix: `xnd_development_`)
5. Generate **Public Key** jika belum ada
6. Copy **Webhook Verification Token**

#### Mode Production (Live)
1. Toggle ke mode **Live**
2. Ulangi langkah 3-6 di atas
3. Keys akan berbeda (prefix: `xnd_production_`)

### 3. Setup Environment Variables

Edit file `.env.local`:

```bash
# Xendit Payment Gateway
XENDIT_SECRET_KEY=xnd_development_your_secret_key_here
XENDIT_WEBHOOK_TOKEN=your_webhook_verification_token_here
NEXT_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_development_your_public_key_here
```

**Untuk Production**, ganti dengan:
```bash
XENDIT_SECRET_KEY=xnd_production_your_live_secret_key
XENDIT_WEBHOOK_TOKEN=your_live_webhook_token
NEXT_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_production_your_live_public_key
```

---

## 🗄️ Setup Database

### 1. Run Migration

Jalankan migration untuk update tabel `purchases`:

```bash
# Via Supabase CLI
supabase db push

# Atau via SQL Editor di Supabase Dashboard
# Copy isi file: supabase/migrations/003_add_xendit_fields.sql
# Paste dan execute di SQL Editor
```

### 2. Verify Tables

Pastikan tabel `purchases` memiliki kolom:
- ✅ `xendit_invoice_id` (TEXT, UNIQUE)
- ✅ `xendit_invoice_url` (TEXT)
- ✅ `paid_at` (TIMESTAMP WITH TIME ZONE)
- ✅ `expires_at` (TIMESTAMP WITH TIME ZONE)
- ✅ `payment_status` enum: 'pending', 'paid', 'expired', 'failed'

---

## 🔗 Setup Webhook

### 1. Expose Local Development (Untuk Testing)

**Option A: Using ngrok**
```bash
# Install ngrok
# Download dari https://ngrok.com/download

# Run ngrok
ngrok http 3000

# Copy HTTPS URL (contoh: https://abc123.ngrok.io)
```

**Option B: Using localhost.run**
```bash
ssh -R 80:localhost:3000 localhost.run
```

### 2. Configure Webhook di Xendit Dashboard

1. Buka https://dashboard.xendit.co/
2. Mode **Test** untuk development
3. Buka **Settings** → **Developers** → **Webhooks**
4. Klik **Add Webhook URL**
5. Isi:
   - **URL**: `https://your-domain.com/api/webhooks/xendit`
     - Development: `https://abc123.ngrok.io/api/webhooks/xendit`
     - Production: `https://soraroid.com/api/webhooks/xendit`
   - **Environment**: Test / Live
6. Pilih events:
   - ✅ **Invoice Paid** (`invoice.paid`)
   - ✅ **Invoice Expired** (`invoice.expired`)
7. Klik **Test Webhook** untuk verifikasi
8. Klik **Save**

---

## 🧪 Testing Payment Flow

### 1. Test di Development

```bash
# Start development server
bun dev
```

### 2. Test Purchase Flow

1. Login sebagai buyer
2. Buka `/shop`
3. Klik **Buy** pada foto
4. Klik **Proceed to Payment**
5. Akan redirect ke Xendit payment page

### 3. Test Payment Methods

Di **Test Mode**, gunakan credentials ini:

#### Virtual Account
- **BCA VA**: Nomor VA akan muncul di payment page
- Auto-paid setelah 3 menit (development only)

#### Credit Card (Test)
```
Card Number: 4000 0000 0000 0002
CVV: 123
Exp Date: any future date
```

#### E-Wallet
- **OVO**: 08123456789 (auto-approved)
- **Dana**: 08123456789 (auto-approved)

### 4. Verify Webhook

1. Setelah payment success, check logs:
```bash
# Terminal akan show:
# Xendit webhook received: {...}
# Purchase paid: xnd_invoice_id_xxx
```

2. Check database:
```sql
SELECT * FROM purchases WHERE payment_status = 'paid';
```

3. Check photo status:
```sql
SELECT * FROM photos WHERE sold = true;
```

---

## 🚀 Production Deployment

### 1. Update Environment Variables

Di hosting platform (Vercel/Netlify/dll):

```bash
XENDIT_SECRET_KEY=xnd_production_xxx
XENDIT_WEBHOOK_TOKEN=production_token_xxx
NEXT_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_production_xxx
NEXT_PUBLIC_APP_URL=https://soraroid.com
```

### 2. Update Webhook URL

1. Buka Xendit Dashboard (Live mode)
2. Update webhook URL ke production URL
3. Test webhook dengan **Test Webhook** button

### 3. Aktifkan Payment Methods

Di Dashboard Xendit → **Business Settings** → **Payment Methods**, aktifkan:
- 💳 Credit/Debit Card
- 🏦 Virtual Account (BCA, Mandiri, BRI, BNI, Permata)
- 🛒 E-Wallet (OVO, Dana, LinkAja, ShopeePay)
- 🏪 Retail (Alfamart, Indomaret)
- 📱 QRIS

---

## 📂 File Structure

```
src/
├── services/
│   ├── xendit.service.ts        # Xendit API client
│   ├── payment.service.ts       # Payment business logic
│   └── purchase.service.ts      # Purchase CRUD (existing)
├── app/
│   ├── api/
│   │   ├── purchases/
│   │   │   └── create/route.ts  # Create purchase endpoint
│   │   └── webhooks/
│   │       └── xendit/route.ts  # Xendit webhook handler
│   └── payment/
│       ├── success/page.tsx     # Payment success page
│       └── failed/page.tsx      # Payment failed page
└── db/
    └── schema.ts                # Updated purchases table

supabase/
└── migrations/
    └── 003_add_xendit_fields.sql
```

---

## 🔄 Payment Flow Diagram

```
User clicks "Buy" on photo
         ↓
   Check if authenticated
         ↓ (yes)
   Show purchase dialog
         ↓
  "Proceed to Payment"
         ↓
POST /api/purchases/create
  - Create purchase record (status: pending)
  - Generate Xendit invoice
  - Store invoice_id & invoice_url
         ↓
   Redirect to Xendit payment page
         ↓
   User completes payment
         ↓
Xendit sends webhook to /api/webhooks/xendit
  - Verify webhook token
  - Update purchase status to 'paid'
  - Mark photo as sold
         ↓
Redirect user to /payment/success
         ↓
   Photo available in Gallery
```

---

## 🛠️ API Endpoints

### POST `/api/purchases/create`
**Request:**
```json
{
  "photoId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "purchase": {
    "id": "uuid",
    "transactionId": "TXN-1234567890-abc123",
    "amount": 50000,
    "paymentStatus": "pending"
  },
  "invoiceUrl": "https://checkout.xendit.co/web/xxx"
}
```

### POST `/api/webhooks/xendit`
**Headers:**
```
x-callback-token: your_webhook_token
```

**Payload (Invoice Paid):**
```json
{
  "id": "xnd_invoice_id",
  "status": "PAID",
  "payment_method": "CREDIT_CARD",
  "paid_at": "2025-01-01T10:00:00.000Z",
  "external_id": "TXN-1234567890-abc123"
}
```

---

## 🐛 Troubleshooting

### Error: "provider is not enabled"
- Pastikan Xendit credentials sudah diisi di `.env.local`
- Restart development server setelah update env

### Webhook tidak diterima
- Check ngrok masih running
- Check webhook URL di Xendit Dashboard benar
- Check logs di terminal: `Xendit webhook received`

### Payment stuck di "Processing"
- Check webhook token match dengan env variable
- Check Xendit logs di Dashboard → Webhooks → Logs
- Manual update status di database jika perlu:
```sql
UPDATE purchases 
SET payment_status = 'paid', paid_at = NOW()
WHERE transaction_id = 'TXN-xxx';

UPDATE photos 
SET sold = true 
WHERE id = (SELECT photo_id FROM purchases WHERE transaction_id = 'TXN-xxx');
```

### Test payment tidak auto-complete
- Di test mode, beberapa payment method auto-complete setelah 3-5 menit
- Atau gunakan Xendit Dashboard → Test Mode → Simulate Payment

---

## 📊 Monitoring

### Check Transactions

```sql
-- Recent purchases
SELECT 
  p.transaction_id,
  p.amount,
  p.payment_status,
  p.payment_method,
  p.purchased_at,
  p.paid_at,
  ph.name as photo_name,
  pr.full_name as buyer_name
FROM purchases p
JOIN photos ph ON p.photo_id = ph.id
JOIN profiles pr ON p.buyer_id = pr.id
ORDER BY p.purchased_at DESC
LIMIT 20;
```

### Xendit Dashboard
- **Home** → Transaction summary
- **Reports** → Download detailed reports
- **Payouts** → Check settlement status

---

## 💰 Biaya & Komisi

Xendit fees (per transaction):
- **Credit Card**: 2.9% + Rp 2,000
- **Virtual Account**: Rp 4,000 - Rp 5,000
- **E-Wallet**: 2% - 3.3%
- **QRIS**: 0.7%
- **Retail**: Rp 4,000 - Rp 5,000

*Biaya dapat berubah, check Xendit pricing untuk info terbaru*

---

## ✅ Checklist Setup

- [ ] Daftar akun Xendit
- [ ] Verifikasi email & lengkapi data
- [ ] Dapatkan API keys (test & live)
- [ ] Update `.env.local` dengan credentials
- [ ] Run database migration
- [ ] Setup webhook URL (ngrok untuk dev)
- [ ] Test purchase flow
- [ ] Test berbagai payment methods
- [ ] Verify webhook handler
- [ ] Check database updates
- [ ] Deploy to production
- [ ] Update webhook URL production
- [ ] Test production payment
- [ ] Monitor first transactions

---

## 📚 Resources

- [Xendit Documentation](https://developers.xendit.co/)
- [Xendit API Reference](https://developers.xendit.co/api-reference/)
- [Xendit Node.js SDK](https://github.com/xendit/xendit-node)
- [Xendit Dashboard](https://dashboard.xendit.co/)
- [Support](https://help.xendit.co/)

---

**Setup complete!** 🎉 
User sekarang bisa membeli foto dengan berbagai metode pembayaran melalui Xendit.
