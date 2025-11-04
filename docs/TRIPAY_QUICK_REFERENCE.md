# Tripay Quick Reference

## 🚀 Quick Start

### 1. Environment Variables (Required)
```env
TRIPAY_API_KEY=your_api_key
TRIPAY_PRIVATE_KEY=your_private_key
TRIPAY_MERCHANT_CODE=your_merchant_code
TRIPAY_MODE=development
TRIPAY_CALLBACK_SECRET=your_callback_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Start Development
```bash
bun dev
```

### 3. Test Payment Flow
1. Visit `/shop`
2. Select payment method from dropdown
3. Click "Beli Sekarang"
4. Complete payment in Tripay sandbox

---

## 📋 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/payment/channels` | Get available payment methods |
| POST | `/api/purchases/create` | Create purchase with payment |
| POST | `/api/webhooks/tripay` | Handle payment callbacks |

---

## 🗄️ Database

### Tripay Fields in `purchases` table:
- `payment_reference` (TEXT, UNIQUE) - Tripay transaction ID
- `payment_checkout_url` (TEXT) - Payment page URL
- `payment_code` (TEXT) - VA number or QRIS code
- `payment_note` (TEXT) - Payment instructions
- `total_amount` (INTEGER) - Total with fees
- `paid_at` (TIMESTAMP) - Payment confirmation time
- `expires_at` (TIMESTAMP) - Payment expiry time

---

## 🔧 Useful Scripts

```bash
# Check database status
bun run scripts/check-database.ts

# Check purchases table
bun run scripts/check-purchases-table.ts

# Check migrations table
bun run scripts/check-migrations-table.ts
```

---

## 🧪 Testing with Tripay Simulator

1. Create a transaction
2. Copy the `reference` from response
3. Go to https://tripay.co.id/simulator
4. Enter reference and click "Pay Now"
5. Webhook will be triggered automatically

---

## 🐛 Troubleshooting

### Channels not loading?
```bash
# Check API key
echo $TRIPAY_API_KEY

# Check mode
echo $TRIPAY_MODE
```

### Webhook not working locally?
```bash
# Use ngrok
ngrok http 3000

# Update .env
TRIPAY_CALLBACK_URL=https://xxx.ngrok.io/api/webhooks/tripay
NEXT_PUBLIC_APP_URL=https://xxx.ngrok.io
```

### Payment not updating?
1. Check webhook logs in Tripay dashboard
2. Check callback secret matches
3. Verify signature verification is passing

---

## 📊 Payment Status Flow

```
pending → processing → paid → completed
                    ↓
                  failed
                    ↓
                 expired
```

---

## 🔐 Security Checklist

- ✅ Callback token validation
- ✅ HMAC signature verification
- ✅ HTTPS in production
- ✅ Unique payment references
- ✅ Prevent duplicate processing

---

## 📚 Full Documentation

See `docs/TRIPAY_INTEGRATION.md` for complete guide.

---

## ⚡ Common Payment Methods

| Code | Name | Type |
|------|------|------|
| QRIS | QRIS (All E-wallets) | QR Code |
| BRIVA | BRI Virtual Account | VA |
| BNIVA | BNI Virtual Account | VA |
| BCAVA | BCA Virtual Account | VA |
| OVO | OVO E-wallet | Instant |
| DANA | DANA E-wallet | Instant |

---

**Quick Access:**
- 📖 Integration Guide: `docs/TRIPAY_INTEGRATION.md`
- 📝 Migration Summary: `docs/TRIPAY_MIGRATION_SUMMARY.md`
- 🎯 This Reference: `docs/TRIPAY_QUICK_REFERENCE.md`
