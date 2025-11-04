# WhatsApp Notification System dengan Fonnte

## Overview
Sistem notifikasi WhatsApp otomatis menggunakan Fonnte API untuk menginformasikan pembeli tentang status pembelian mereka, baik untuk pembayaran manual maupun otomatis.

## Fonnte Integration

### Setup
1. Daftar di [Fonnte.com](https://fonnte.com)
2. Dapatkan API Token
3. Tambahkan ke environment variables:
```env
FONNTE_TOKEN=your_fonnte_token_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Service: `src/services/fonnte.service.ts`

```typescript
class FonnteService {
  // Send WhatsApp message
  sendMessage(params: WhatsAppMessageParams): Promise<boolean>
  
  // Send manual payment invoice
  sendManualPaymentInvoice(params: ManualPaymentInvoiceParams): Promise<boolean>
  
  // Send automatic payment invoice
  sendAutomaticPaymentInvoice(params: AutomaticPaymentInvoiceParams): Promise<boolean>
  
  // Send payment success notification
  sendPaymentSuccess(params: PaymentSuccessParams): Promise<boolean>
  
  // Send payment approved notification (manual)
  sendPaymentApproved(params: PaymentSuccessParams): Promise<boolean>
  
  // Format phone number for WhatsApp
  formatPhoneNumber(phone: string): string
}
```

## Notification Flow

### 1. Manual Payment Flow

#### Step 1: User Creates Manual Purchase
**Trigger:** User klik "I Have Transferred" di `/payment/manual-instructions`

**API:** `POST /api/purchases/manual`

**WhatsApp Message:**
```
🔔 *INVOICE - MANUAL PAYMENT*

Hai *[Nama Customer]*! 👋

Terima kasih telah melakukan pemesanan foto di *SoraRoid Photo*.

📸 *Detail Pesanan:*
• Foto: [Nama Foto]
• Total: *Rp [Amount]*
• ID Transaksi: [Transaction ID]

💳 *Metode Pembayaran:*
[Nama Bank/E-wallet]

📋 *Transfer ke:*
• Nomor: *[Account Number]*
• Atas Nama: *[Account Name]*

⏰ *Batas Pembayaran:*
[Expiry Time] WIB

⚠️ *PENTING:*
1. Transfer sesuai nominal yang tertera
2. Simpan bukti transfer
3. Kirim bukti pembayaran ke admin
4. Pesanan akan diproses setelah pembayaran dikonfirmasi

📱 *Status Pesanan:* PENDING
Mohon segera lakukan pembayaran sebelum batas waktu berakhir.

Terima kasih! 🙏
*SoraRoid Photo Team*
```

**Status:** `pending` - Menunggu approval admin

#### Step 2: Admin Approves Payment
**Trigger:** Admin klik "Approve" di `/admin/purchases`

**API:** `PATCH /api/admin/purchases/[id]/verify`

**WhatsApp Message:**
```
✅ *PEMBAYARAN DISETUJUI*

Hai *[Nama Customer]*! 🎉

Pembayaran manual Anda telah diverifikasi dan disetujui oleh admin!

📸 *Detail Pesanan:*
• Foto: [Nama Foto]
• Total: *Rp [Amount]*
• ID Transaksi: [Transaction ID]

📥 *Unduh Foto Anda:*
Foto berkualitas HD tanpa watermark sudah tersedia!
Silakan login dan kunjungi halaman Gallery Anda.

[Download URL]

✨ Terima kasih atas kesabaran Anda!

Salam hangat,
*SoraRoid Photo Team* 📷
```

**Status:** `pending` → `paid`
**Result:** Foto HD tersedia untuk view dan download

### 2. Automatic Payment Flow (Tripay)

#### Step 1: User Creates Automatic Purchase
**Trigger:** User memilih payment channel di `/shop`

**API:** `POST /api/purchases/create`

**WhatsApp Message:**
```
🔔 *INVOICE - AUTOMATIC PAYMENT*

Hai *[Nama Customer]*! 👋

Terima kasih telah melakukan pemesanan foto di *SoraRoid Photo*.

📸 *Detail Pesanan:*
• Foto: [Nama Foto]
• Total: *Rp [Amount]*
• Metode: [Payment Method]
• ID Transaksi: [Transaction ID]

💳 *Link Pembayaran:*
[Checkout URL]

⏰ *Batas Pembayaran:*
[Expiry Time] WIB

✅ Klik link di atas untuk melanjutkan pembayaran
✅ Setelah berhasil, foto akan otomatis tersedia untuk diunduh

📱 *Status Pesanan:* PENDING

Terima kasih! 🙏
*SoraRoid Photo Team*
```

**Status:** `pending`

#### Step 2: Tripay Webhook (Payment Success)
**Trigger:** Tripay sends webhook when payment completed

**API:** `POST /api/payment/webhook`

**WhatsApp Message:**
```
✅ *PEMBAYARAN BERHASIL*

Hai *[Nama Customer]*! 🎉

Pembayaran Anda telah dikonfirmasi!

📸 *Detail Pesanan:*
• Foto: [Nama Foto]
• Total: *Rp [Amount]*
• ID Transaksi: [Transaction ID]

📥 *Unduh Foto Anda:*
Foto berkualitas HD tanpa watermark sudah tersedia!
Silakan login dan kunjungi halaman Gallery Anda.

[Download URL]

✨ Terima kasih telah berbelanja di SoraRoid Photo!

Ada pertanyaan? Hubungi admin kami.

Salam hangat,
*SoraRoid Photo Team* 📷
```

**Status:** `pending` → `paid`
**Result:** Foto HD tersedia untuk view dan download

## Gallery Display Logic

### Before Approval (Pending)
```tsx
// Badge
<Badge className="bg-amber-500">
  <Loader2 className="animate-spin" />
  Pending Approval
</Badge>

// Image
<img src={photo.previewUrl} /> // With watermark

// Button
<Button disabled>
  <Loader2 className="animate-spin" />
  Awaiting Approval
</Button>
```

### After Approval (Paid)
```tsx
// Badge
<Badge className="bg-green-600">
  <CheckCircle />
  Full Quality
</Badge>

// Image
<img src={photo.fullUrl} /> // HD without watermark

// Buttons
<Button onClick={handleViewPhoto}>
  <Eye /> View
</Button>
<Button onClick={handleDownload}>
  <Download /> Download
</Button>
```

## Phone Number Formatting

Fonnte membutuhkan format nomor WhatsApp dengan country code (62 untuk Indonesia).

### Format Rules:
1. Remove all non-numeric characters
2. Remove leading 0
3. Add "62" if not present

### Examples:
```typescript
formatPhoneNumber("081234567890")  // → "6281234567890"
formatPhoneNumber("08123-456-7890") // → "6281234567890"
formatPhoneNumber("6281234567890")  // → "6281234567890"
formatPhoneNumber("+62 812 3456 7890") // → "6281234567890"
```

## API Endpoints

### 1. Manual Purchase Creation
**Endpoint:** `POST /api/purchases/manual`

**Request:**
```json
{
  "photoId": "uuid",
  "manualPaymentMethodId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "purchase": {
    "id": "uuid",
    "transactionId": "MANUAL-123-abc",
    "amount": 10000,
    "status": "pending",
    "expiresAt": "2025-11-05T12:00:00Z"
  }
}
```

**WhatsApp:** Sends manual payment invoice

### 2. Admin Approval
**Endpoint:** `PATCH /api/admin/purchases/[id]/verify`

**Request:**
```json
{
  "action": "approve" | "reject"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase approved successfully"
}
```

**WhatsApp:** Sends approval notification if action="approve"

### 3. Tripay Webhook
**Endpoint:** `POST /api/payment/webhook`

**Request:** (From Tripay)
```json
{
  "reference": "TRIPAY-REF",
  "merchant_ref": "TXN-123-abc",
  "status": "PAID",
  "total_amount": 10000,
  "signature": "hash"
}
```

**Response:**
```json
{
  "success": true
}
```

**WhatsApp:** Sends payment success notification if status="PAID"

### 4. Automatic Purchase Creation
**Endpoint:** `POST /api/purchases/create`

**Request:**
```json
{
  "photoId": "uuid",
  "paymentMethod": "BRIVA"
}
```

**Response:**
```json
{
  "success": true,
  "purchase": { ... },
  "checkoutUrl": "https://tripay.co.id/checkout/...",
  "reference": "TRIPAY-REF"
}
```

**WhatsApp:** Sends automatic payment invoice

## Error Handling

### Missing Token
```typescript
if (!FONNTE_TOKEN) {
  console.warn("Fonnte token not configured, skipping WhatsApp notification");
  return false;
}
```

### Missing Phone Number
```typescript
if (buyer?.phone) {
  // Send notification
} else {
  // Skip silently
}
```

### API Failure
```typescript
fonnteService.sendPaymentSuccess({ ... })
  .catch(error => {
    console.error("Failed to send WhatsApp notification:", error);
    // Don't throw - notification failure shouldn't block payment
  });
```

## Testing

### Test Phone Number
Format: `62` + your phone without leading 0
Example: `6281234567890`

### Test Flow:

1. **Manual Payment Test:**
```bash
# Create purchase
curl -X POST http://localhost:3000/api/purchases/manual \
  -H "Content-Type: application/json" \
  -d '{"photoId":"uuid","manualPaymentMethodId":"uuid"}'

# Check WhatsApp for invoice message

# Approve payment (as admin)
curl -X PATCH http://localhost:3000/api/admin/purchases/[id]/verify \
  -H "Content-Type: application/json" \
  -d '{"action":"approve"}'

# Check WhatsApp for approval message
```

2. **Automatic Payment Test:**
```bash
# Create purchase
curl -X POST http://localhost:3000/api/purchases/create \
  -H "Content-Type: application/json" \
  -d '{"photoId":"uuid","paymentMethod":"BRIVA"}'

# Check WhatsApp for invoice message

# Simulate Tripay webhook (payment success)
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "reference":"TEST-REF",
    "merchant_ref":"TXN-123",
    "status":"PAID",
    "total_amount":10000,
    "signature":"valid-signature"
  }'

# Check WhatsApp for success message
```

## Security Considerations

1. **Token Protection:** Never expose `FONNTE_TOKEN` to client
2. **Async Sending:** Notifications sent asynchronously without blocking
3. **Signature Verification:** Tripay webhooks verified before processing
4. **Error Isolation:** Notification failures don't break payment flow
5. **Rate Limiting:** Fonnte has rate limits, handle gracefully

## Configuration

### Required Environment Variables
```env
# Fonnte WhatsApp API
FONNTE_TOKEN=your_fonnte_token

# App URL for download links
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Tripay (if using automatic payment)
TRIPAY_API_KEY=your_api_key
TRIPAY_PRIVATE_KEY=your_private_key
TRIPAY_MERCHANT_CODE=your_merchant_code
```

### Webhook Configuration (Tripay)
Set webhook URL in Tripay dashboard:
```
https://your-domain.com/api/payment/webhook
```

## Monitoring

### Logs to Watch
```bash
# Successful notification
[Fonnte] Message sent successfully to 6281234567890

# Failed notification
[Fonnte] Failed to send message: [error details]
Failed to send WhatsApp notification: [error]

# Webhook received
[Tripay Webhook] Received: { reference, status, ... }
[Tripay Webhook] Purchase [id] updated to paid
```

## Future Enhancements

1. **Message Templates:** Use Fonnte templates for better delivery
2. **Rich Media:** Send images with invoice
3. **Multiple Languages:** i18n for notifications
4. **Retry Logic:** Implement exponential backoff for failures
5. **Delivery Status:** Track message delivery status
6. **Admin Notifications:** Notify admin of new orders
7. **Batch Notifications:** Bulk sending for promotions

## Status
✅ **COMPLETED** - All notification flows implemented and tested
