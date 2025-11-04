# Manual Payment Methods Migration

## ❌ Error: Table "manual_payment_methods" does not exist

Untuk menambahkan metode pembayaran manual, table database perlu dibuat terlebih dahulu.

## 🔧 Solusi: Jalankan Migration SQL

### **Opsi 1: Via Supabase Dashboard (RECOMMENDED)**

1. Buka **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy seluruh isi file: `supabase/migrations/005_manual_payment_methods.sql`
6. Paste di SQL Editor
7. Klik **Run** atau tekan `Ctrl + Enter`

### **Opsi 2: Via psql CLI**

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migration
\i supabase/migrations/005_manual_payment_methods.sql
```

### **Opsi 3: Via Drizzle Kit**

```bash
# Generate migration
bun run drizzle-kit generate

# Push to database
bun run drizzle-kit push
```

## ✅ Verifikasi

Setelah migration berhasil, refresh halaman `/admin/payment-methods` dan Anda akan melihat:

- ✅ Table payment methods kosong atau dengan data default
- ✅ Button "Add Payment Method" berfungsi
- ✅ Bisa create/edit/delete payment methods

## 📋 Default Payment Methods

Migration akan membuat payment methods berikut (status OFF by default):

- BCA - Bank Transfer
- BNI - Bank Transfer  
- BRI - Bank Transfer
- MANDIRI - Bank Transfer
- DANA - E-Wallet (ON)
- GOPAY - E-Wallet (ON)
- OVO - E-Wallet (ON)
- Link Aja - E-Wallet
- QRIS - Other

Anda bisa edit account numbers dan toggle status ON/OFF sesuai kebutuhan.

## 🚨 Troubleshooting

Jika masih error setelah migration:

1. Cek apakah migration berhasil:
   ```sql
   SELECT * FROM manual_payment_methods LIMIT 5;
   ```

2. Cek RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'manual_payment_methods';
   ```

3. Refresh browser dan clear cache
4. Restart dev server: `bun dev`

## 📞 Need Help?

Jika masih ada masalah, cek:
- Supabase project status
- Database connection string di `.env.local`
- Console browser untuk error details
