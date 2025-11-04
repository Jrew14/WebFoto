# Manual Payment Methods - Quick Setup Guide

## ✅ Problem SOLVED!

Table `manual_payment_methods` sudah berhasil dibuat di database lokal Anda!

---

## 🚀 Setup untuk Production (Vercel)

Jika Anda deploy ke Vercel, Anda perlu run migration di production database juga.

### **Method 1: Via Supabase Dashboard (EASIEST)**

1. Login ke **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project production Anda
3. Klik **SQL Editor** di sidebar
4. Klik **New Query**
5. Copy & Paste SQL ini:

```sql
-- Create manual_payment_methods table
CREATE TABLE IF NOT EXISTS manual_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (type IN ('bank_transfer', 'e_wallet', 'other')),
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  min_amount INTEGER NOT NULL DEFAULT 10000,
  max_amount INTEGER NOT NULL DEFAULT 20000000,
  fee INTEGER NOT NULL DEFAULT 0,
  fee_percentage INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_manual_payment_active ON manual_payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_manual_payment_sort ON manual_payment_methods(sort_order);

-- Enable RLS
ALTER TABLE manual_payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active payment methods
CREATE POLICY "Anyone can view active payment methods"
  ON manual_payment_methods
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage payment methods"
  ON manual_payment_methods
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default payment methods
INSERT INTO manual_payment_methods (name, type, account_number, account_name, min_amount, max_amount, fee, sort_order, is_active) VALUES
('BCA', 'bank_transfer', '1482579307', 'THIRAFI THARIQ AL IDRIS', 1000, 20000000, 0, 1, false),
('BNI', 'bank_transfer', 'xxxx', 'THIRAFI THARIQ AL IDRIS', 10000, 20000000, 0, 2, false),
('BRI', 'bank_transfer', 'xxxx', 'THIRAFI THARIQ AL IDRIS', 10000, 20000000, 0, 3, false),
('MANDIRI', 'bank_transfer', 'xxxx', 'THIRAFI THARIQ AL IDRIS', 10000, 20000000, 0, 4, false),
('DANA', 'e_wallet', '081222327635', 'FAZRI LUKMAN NURRO', 10000, 4000000, 0, 5, true),
('GOPAY', 'e_wallet', '085187249851', 'JualSosmed', 10000, 4000000, 0, 6, true),
('OVO', 'e_wallet', '085187249851', 'JualSosmed', 10000, 4000000, 0, 7, true),
('Link Aja', 'e_wallet', 'xxxx', 'THIRAFI THARIQ AL IDRIS', 10000, 4000000, 0, 8, false),
('QRIS', 'other', 'QRIS', '', 10000, 4000000, 0, 9, false)
ON CONFLICT DO NOTHING;
```

6. Klik **Run** atau `Ctrl + Enter`
7. Tunggu sampai selesai (✅ Success)

### **Method 2: Via Script (If you have DATABASE_URL)**

Jika Anda punya akses ke production DATABASE_URL:

```bash
# Set production DATABASE_URL di terminal
export DATABASE_URL="postgresql://..."

# Run migration script
bun run scripts/migrate-manual-payment.ts
```

---

## 📱 Cara Menggunakan

### **1. Access Admin Panel**
- Login sebagai admin
- Buka: `/admin/payment-methods`
- Atau klik **"Payment Methods"** di sidebar

### **2. Edit Payment Methods**
- Klik tombol **Edit** (✏️) di method yang ingin diubah
- Update account number (ganti "xxxx" dengan nomor asli)
- Update account name
- Set min/max amount
- Toggle status **ON/OFF**
- Klik **Update**

### **3. Add New Payment Method**
- Klik tombol **"Add Payment Method"**
- Isi form:
  - Payment Name (e.g., "Shopee Pay")
  - Type (Bank Transfer / E-Wallet / Other)
  - Account/Wallet Number
  - Account Name
  - Min/Max Amount
  - Fee (optional)
  - Sort Order
  - Instructions (optional)
- Check **Active** jika ingin langsung aktif
- Klik **Create**

### **4. Toggle Active/Inactive**
- Klik button **Active/Inactive** di kolom Status
- Method yang **Active** akan muncul di checkout
- Method yang **Inactive** hanya admin yang bisa lihat

### **5. Delete Payment Method**
- Klik tombol **Delete** (🗑️)
- Confirm deletion
- Method akan dihapus permanent

---

## ✅ What's Working Now

- ✅ Admin page `/admin/payment-methods` loads successfully
- ✅ Can view all payment methods
- ✅ Can add new payment methods
- ✅ Can edit existing methods
- ✅ Can toggle active/inactive status
- ✅ Can delete methods
- ✅ Default methods seeded (9 items)
- ✅ RLS policies configured
- ✅ API endpoints working

---

## 🎯 Next Steps

1. **Update Account Numbers**: Edit methods dan ganti "xxxx" dengan nomor rekening asli
2. **Set Active Status**: Toggle ON untuk methods yang siap digunakan
3. **Test**: Coba add/edit/delete untuk memastikan semua berfungsi
4. **Deploy**: Push ke Vercel, migration akan otomatis terapply di production

---

## 🔧 Troubleshooting

### Error: "Failed to create payment method"
- Cek console browser untuk detail error
- Pastikan logged in sebagai admin
- Cek network tab untuk API response

### Payment methods tidak muncul
- Refresh halaman
- Clear browser cache
- Cek apakah method sudah di-set **Active**

### Cannot delete method
- Pastikan method tidak sedang digunakan di transaction
- Cek admin permissions

---

## 📞 Support

Jika masih ada masalah:
1. Check browser console (F12)
2. Check network tab untuk API errors
3. Check Supabase logs
4. Restart dev server: `bun dev`

**Migration status**: ✅ COMPLETED
**Feature status**: ✅ READY TO USE
