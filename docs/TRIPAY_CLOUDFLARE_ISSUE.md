# Tripay Cloudflare 403 Issue & Solution

## 🚨 Problem

Tripay Production API (`https://tripay.co.id/api-merchant`) diblokir oleh Cloudflare Bot Protection dengan status **403 Forbidden** saat dipanggil dari server.

### Error Messages:
- `Tripay API returned non-JSON response (likely HTML error page). Status: 403`
- `JSON Parse error: Unrecognized token '<'`
- `No payment channels available`

### Root Cause:
Cloudflare mendeteksi request dari server sebagai bot traffic dan memblokir akses ke API production endpoint.

## ✅ Current Solution

### Mock Payment Channels Fallback
Sistem sekarang menggunakan **mock payment channels** sebagai fallback ketika Tripay API mengembalikan 403 error.

**Mock channels yang tersedia:**
- BRI Virtual Account (BRIVA) - Fee: Rp 2,500
- BNI Virtual Account (BNIVA) - Fee: Rp 4,000
- Mandiri Virtual Account (MANDIRIVA) - Fee: Rp 4,000
- QRIS (All E-Wallet) - Fee: 0.7%
- Alfamart - Fee: Rp 3,500
- Indomaret - Fee: Rp 3,500

### Warning di Console:
```
⚠️ [Tripay] Using MOCK payment channels - Cloudflare is blocking production API
⚠️ [Tripay] Please contact Tripay support to whitelist your server IP
```

## 🔧 Permanent Solutions

### Option 1: Contact Tripay Support (RECOMMENDED)
**Untuk production yang sebenarnya, HARUS hubungi Tripay support.**

**Steps:**
1. Login ke dashboard Tripay: https://tripay.co.id/member/
2. Buka menu Support/Ticket
3. Buat ticket baru dengan informasi:
   ```
   Subject: Request IP Whitelist untuk API Production
   
   Deskripsi:
   - Merchant Code: T46723
   - Issue: API endpoint /api-merchant/merchant/payment-channel 
     mengembalikan 403 Forbidden (Cloudflare block)
   - Server IP: [IP_SERVER_KAMU]
   - Request: Whitelist IP server atau disable bot protection 
     untuk API endpoints
   ```

4. Tunggu response dari Tripay support team

### Option 2: Use VPS with Different IP
Jika IP lokal/current server diblokir permanently, consider pindah ke VPS dengan IP yang berbeda.

### Option 3: API Proxy (Not Recommended)
Gunakan proxy service, tapi ini tidak recommended untuk production karena security concerns.

## 📝 How the Fallback Works

File: `src/services/tripay.service.ts`

```typescript
async getPaymentChannels(): Promise<TripayChannel[]> {
  try {
    // Try to fetch from Tripay API
    const data = await this.request("/merchant/payment-channel");
    return data;
  } catch (error) {
    // If 403 error, use mock data
    if (error instanceof Error && error.message.includes("403")) {
      console.warn("[Tripay] Using mock payment channels due to Cloudflare block");
      return this.getMockPaymentChannels();
    }
    throw error;
  }
}
```

## ⚠️ Limitations of Mock Data

**IMPORTANT:** Mock payment channels hanya untuk development/testing!

**Kenapa tidak bisa untuk production:**
- ❌ **Tidak bisa create transaction** - Tripay API tetap akan reject
- ❌ **Fee mungkin tidak akurat** - Real fees bisa berubah
- ❌ **Channel availability** - Tidak real-time
- ❌ **Missing fields** - Beberapa data seperti icon_url tidak ada

**Yang BISA dengan mock:**
- ✅ Display payment channels di UI
- ✅ User bisa pilih metode payment
- ✅ Sistem tidak crash dengan error

**Yang TIDAK BISA:**
- ❌ Create actual payment transaction
- ❌ Get payment instructions
- ❌ Check transaction status

## 🔄 Alternative: Manual Payment

Sementara Tripay belum fixed, gunakan **Manual Payment** yang sudah berfungsi sempurna:

**Cara user order dengan manual payment:**
1. User pilih foto di /shop
2. Klik "Beli Sekarang"
3. Pilih "Transfer Manual"
4. Sistem generate order dengan nomor rekening
5. User transfer ke rekening yang diberikan
6. Upload bukti transfer
7. Admin approve di dashboard

**File terkait:**
- `src/app/shop/page.tsx` - Manual payment UI
- `src/app/payment/manual-pending/page.tsx` - Upload bukti
- `src/app/admin/(dashboard)/orders/page.tsx` - Admin approval

## 📊 Testing Status

### ✅ Tested Successfully:
- Server tidak crash saat Tripay 403
- Mock channels muncul di UI
- Warning log terlihat di console
- Manual payment masih berfungsi

### ⏳ Pending Test (Need Real API):
- Create transaction dengan real Tripay API
- Payment instructions
- Transaction callback
- Order status update from Tripay webhook

## 🎯 Next Steps

1. **URGENT:** Contact Tripay support untuk whitelist IP
2. **DEVELOPMENT:** Continue development dengan mock data
3. **PRODUCTION:** Gunakan manual payment sampai Tripay fixed
4. **MONITORING:** Check console logs untuk warning messages

## 📞 Tripay Support Contacts

- Dashboard: https://tripay.co.id/member/
- Documentation: https://tripay.co.id/developer
- Support Email: support@tripay.co.id
- WhatsApp: (Check di dashboard Tripay)

---

**Last Updated:** 2025-11-04  
**Status:** Using Mock Fallback  
**Merchant Code:** T46723  
**API Mode:** Production
