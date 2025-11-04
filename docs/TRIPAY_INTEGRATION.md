# Tripay Payment Integration

## Overview
Piksel Jual has successfully migrated from Xendit to Tripay as the payment gateway. This document covers the complete integration, setup, and usage.

## What Changed

### Removed (Xendit)
- ❌ `xendit-node` package
- ❌ `src/services/xendit.service.ts` (replaced with stub)
- ❌ `src/app/api/webhooks/xendit/route.ts` (deprecated with 410 status)
- ❌ Database fields: `xendit_invoice_id`, `xendit_invoice_url`
- ❌ Environment variables: `XENDIT_SECRET_KEY`, `XENDIT_CALLBACK_TOKEN`

### Added (Tripay)
- ✅ `src/services/tripay.service.ts` - Core Tripay API integration
- ✅ `src/app/api/payment/channels/route.ts` - Fetch available payment methods
- ✅ `src/app/api/webhooks/tripay/route.ts` - Handle payment callbacks
- ✅ Database fields: `total_amount`, `payment_reference`, `payment_checkout_url`, `payment_code`, `payment_note`, `paid_at`, `expires_at`
- ✅ Environment variables: See configuration section below
- ✅ Payment channel selection UI in shop page

## Architecture

### Service Layer

#### TripayService (`src/services/tripay.service.ts`)
Core integration with Tripay REST API:

**Methods:**
- `getPaymentChannels()` - Fetch available payment methods
- `createTransaction()` - Create new payment transaction
- `getTransactionDetail(reference)` - Get transaction status
- `verifyCallbackSignature()` - Validate webhook authenticity
- `mapTripayStatus()` - Convert Tripay status to internal status

**Security:**
- SHA256 signature for transaction creation
- HMAC-SHA256 for webhook verification
- Callback token validation

#### PaymentService (`src/services/payment.service.ts`)
Application payment logic:

**Methods:**
- `createPurchase({ userId, photoId, paymentMethod })` - Create purchase with Tripay
- `getPurchaseByPaymentReference(reference)` - Find purchase by Tripay reference
- `updatePurchaseFromTripay(transaction)` - Update purchase from webhook

**Returns (from createPurchase):**
```typescript
{
  purchase: Purchase,
  checkoutUrl: string,    // URL to payment page
  payCode: string,       // Payment code (for QRIS, VA, etc.)
  reference: string,     // Tripay transaction reference
  expiryTime: Date       // Payment expiration time
}
```

### API Endpoints

#### GET `/api/payment/channels`
Fetch available Tripay payment methods.

**Response:**
```json
{
  "channels": [
    {
      "code": "QRIS",
      "name": "QRIS (Semua E-Wallet)",
      "type": "qr",
      "fee_merchant": { "flat": 0, "percent": 0.7 },
      "fee_customer": { "flat": 0, "percent": 0 },
      "active": true
    }
  ]
}
```

#### POST `/api/webhooks/tripay`
Handle Tripay payment callbacks.

**Security:**
- Validates `X-Callback-Token` header
- Verifies HMAC signature
- Only processes `paid` status

**Headers Required:**
```
X-Callback-Token: <TRIPAY_CALLBACK_SECRET>
X-Callback-Signature: <HMAC-SHA256 signature>
```

### Database Schema

#### Purchases Table (Tripay Fields)
```sql
CREATE TABLE purchases (
  -- Existing fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  photo_id UUID NOT NULL REFERENCES photos(id),
  amount INTEGER NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Tripay-specific fields
  payment_method TEXT,                    -- e.g., "QRIS", "BRIVA"
  total_amount INTEGER,                   -- Amount + fees
  payment_reference TEXT UNIQUE,          -- Tripay transaction reference
  payment_checkout_url TEXT,              -- Payment page URL
  payment_code TEXT,                      -- Payment code (VA number, QRIS, etc.)
  payment_note TEXT,                      -- Instructions for customer
  paid_at TIMESTAMP WITH TIME ZONE,       -- When payment was confirmed
  expires_at TIMESTAMP WITH TIME ZONE,    -- Payment expiration time
  
  CONSTRAINT purchases_payment_reference_unique UNIQUE (payment_reference)
);

-- Indexes
CREATE INDEX idx_purchases_payment_reference ON purchases (payment_reference);
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Tripay Configuration
TRIPAY_API_KEY=your_tripay_api_key
TRIPAY_PRIVATE_KEY=your_tripay_private_key
TRIPAY_MERCHANT_CODE=your_merchant_code
TRIPAY_MODE=development  # or production
TRIPAY_CALLBACK_SECRET=your_callback_secret

# Optional - defaults to {APP_URL}/api/webhooks/tripay
TRIPAY_CALLBACK_URL=https://yourdomain.com/api/webhooks/tripay

# App URL for return URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional - default payment method
NEXT_PUBLIC_TRIPAY_DEFAULT_METHOD=QRIS
```

### Getting Tripay Credentials

1. Register at [Tripay](https://tripay.co.id/)
2. Get your credentials from dashboard:
   - API Key: Dashboard → API Keys
   - Private Key: Dashboard → API Keys
   - Merchant Code: Dashboard → Profile
3. Set callback URL in Tripay dashboard to: `https://yourdomain.com/api/webhooks/tripay`
4. Copy callback secret from dashboard

### Development vs Production

**Development Mode:**
```env
TRIPAY_MODE=development
TRIPAY_API_KEY=DEV-...
```
- Uses sandbox environment
- Fake payments for testing
- No real money transactions

**Production Mode:**
```env
TRIPAY_MODE=production
TRIPAY_API_KEY=your_production_key
```
- Real payment processing
- Real money transactions
- Requires verified Tripay account

## Usage

### Frontend Flow

#### 1. Shop Page (Photo Purchase)

**File:** `src/app/shop/page.tsx`

User flow:
1. Browse available photos
2. Select payment channel from dropdown
3. Click "Beli Sekarang" (Buy Now)
4. Get redirected to Tripay payment page

**Code Example:**
```typescript
// Load payment channels
useEffect(() => {
  async function loadChannels() {
    const response = await fetch('/api/payment/channels');
    const data = await response.json();
    setPaymentChannels(data.channels);
  }
  loadChannels();
}, []);

// Handle purchase
const handleBuyPhoto = async () => {
  if (!selectedPaymentChannel) {
    toast.error('Pilih metode pembayaran terlebih dahulu');
    return;
  }
  
  const response = await fetch('/api/purchases/create', {
    method: 'POST',
    body: JSON.stringify({
      photoId,
      paymentMethod: selectedPaymentChannel
    })
  });
  
  const data = await response.json();
  window.location.href = data.checkoutUrl; // Redirect to Tripay
};
```

#### 2. Payment Success Page

**File:** `src/app/payment/success/page.tsx`

Query params:
- `merchant_ref` - Internal purchase transaction ID
- `reference` - Tripay transaction reference

Displays:
- Success message
- Transaction details
- Download link (if payment confirmed)

#### 3. Payment Failed Page

**File:** `src/app/payment/failed/page.tsx`

Query params:
- `merchant_ref` - Internal purchase transaction ID
- `reference` - Tripay transaction reference

Displays:
- Failure message
- Reason (if available)
- Retry button

### Backend Flow

#### 1. Create Purchase

**Endpoint:** `POST /api/purchases/create`

**Request:**
```json
{
  "photoId": "uuid",
  "paymentMethod": "QRIS"
}
```

**Response:**
```json
{
  "purchase": { /* purchase object */ },
  "checkoutUrl": "https://tripay.co.id/checkout/...",
  "payCode": "QRIS code or VA number",
  "reference": "T1234567890",
  "expiryTime": "2024-01-01T12:00:00Z"
}
```

**Process:**
1. Validate user authentication
2. Check photo availability
3. Get photo price
4. Create Tripay transaction
5. Save purchase to database
6. Return checkout URL

#### 2. Handle Webhook

**Endpoint:** `POST /api/webhooks/tripay`

**Request Headers:**
```
X-Callback-Token: <your_callback_secret>
X-Callback-Signature: <hmac_signature>
```

**Request Body:**
```json
{
  "reference": "T1234567890",
  "merchant_ref": "internal_transaction_id",
  "status": "PAID",
  "amount": 50000,
  // ... other Tripay fields
}
```

**Process:**
1. Validate callback token
2. Verify HMAC signature
3. Find purchase by reference
4. Update purchase status
5. Mark photo as sold
6. Return success response

**Security Checks:**
- ✅ Callback token must match `TRIPAY_CALLBACK_SECRET`
- ✅ HMAC signature must be valid
- ✅ Only process `PAID` status
- ✅ Prevent duplicate processing

## Payment Methods Supported

### Instant Payment (Real-time)
- **QRIS** - All e-wallets via QR code
- **OVO** - OVO e-wallet
- **DANA** - DANA e-wallet
- **ShopeePay** - Shopee e-wallet

### Virtual Account (Manual)
- **BRIVA** - BRI Virtual Account
- **BNIVA** - BNI Virtual Account
- **MANDIRIVA** - Mandiri Virtual Account
- **BCAVA** - BCA Virtual Account
- **PERMATAVA** - Permata Virtual Account

### Retail Outlet
- **ALFAMART** - Payment at Alfamart
- **INDOMARET** - Payment at Indomaret

## Payment Flow Diagram

```
┌─────────┐                 ┌──────────┐                 ┌────────┐
│  User   │                 │  Server  │                 │ Tripay │
└────┬────┘                 └─────┬────┘                 └────┬───┘
     │                            │                           │
     │ 1. Select photo           │                           │
     ├──────────────────────────>│                           │
     │                            │                           │
     │ 2. Choose payment method  │                           │
     ├──────────────────────────>│                           │
     │                            │                           │
     │ 3. Click "Buy Now"        │                           │
     ├──────────────────────────>│                           │
     │                            │                           │
     │                            │ 4. Create transaction    │
     │                            ├─────────────────────────>│
     │                            │                           │
     │                            │ 5. Return checkout URL   │
     │                            │<─────────────────────────┤
     │                            │                           │
     │ 6. Redirect to payment    │                           │
     │<───────────────────────────┤                           │
     │                            │                           │
     │ 7. Complete payment       │                           │
     ├───────────────────────────────────────────────────────>│
     │                            │                           │
     │                            │ 8. Webhook callback      │
     │                            │<─────────────────────────┤
     │                            │                           │
     │                            │ 9. Verify & update status│
     │                            │                           │
     │ 10. Redirect to success   │                           │
     │<───────────────────────────┤                           │
     │                            │                           │
```

## Testing

### Manual Testing Checklist

#### Setup
- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] Tripay sandbox account ready

#### Payment Channel Selection
- [ ] Channels load on shop page
- [ ] All channels displayed correctly
- [ ] Selection persists before payment
- [ ] Error shown if no channel selected

#### Create Purchase
- [ ] Can select photo
- [ ] Payment method dropdown works
- [ ] Purchase creates successfully
- [ ] Redirects to Tripay page
- [ ] Database record created with correct fields

#### Tripay Payment Page
- [ ] Checkout URL loads correctly
- [ ] Payment instructions clear
- [ ] QR code displays (for QRIS)
- [ ] VA number shows (for VA methods)
- [ ] Expiry time visible

#### Webhook Processing
- [ ] Webhook receives callback
- [ ] Token validation works
- [ ] Signature verification succeeds
- [ ] Purchase status updates to 'paid'
- [ ] Photo marked as sold
- [ ] paid_at timestamp recorded

#### Success/Failure Pages
- [ ] Success page shows correct info
- [ ] Failure page shows correct error
- [ ] Download link works (success)
- [ ] Retry button works (failure)

### Testing with Tripay Simulator

Tripay provides a payment simulator in development mode:

1. Go to [Tripay Simulator](https://tripay.co.id/simulator)
2. Enter your transaction reference
3. Click "Pay Now"
4. Transaction will be marked as paid
5. Webhook will be triggered automatically

### Automated Testing

**Unit Tests:**
```bash
bun test src/services/tripay.service.test.ts
bun test src/services/payment.service.test.ts
```

**Integration Tests:**
```bash
bun test src/app/api/webhooks/tripay/route.test.ts
```

## Troubleshooting

### Common Issues

#### 1. "Payment channels not loading"
**Cause:** API key invalid or network error

**Solution:**
- Check `TRIPAY_API_KEY` in .env
- Verify API key in Tripay dashboard
- Check network connectivity
- Look at browser console for errors

#### 2. "Webhook not received"
**Cause:** Callback URL not configured or incorrect

**Solution:**
- Set callback URL in Tripay dashboard
- Ensure URL is publicly accessible
- Use ngrok for local testing: `ngrok http 3000`
- Update `TRIPAY_CALLBACK_URL` to ngrok URL

#### 3. "Signature verification failed"
**Cause:** Private key mismatch

**Solution:**
- Verify `TRIPAY_PRIVATE_KEY` matches dashboard
- Check for extra spaces or line breaks
- Regenerate key in Tripay dashboard if needed

#### 4. "Purchase not updating after payment"
**Cause:** Webhook validation failing

**Solution:**
- Check `TRIPAY_CALLBACK_SECRET` matches dashboard
- Verify webhook logs in Tripay dashboard
- Check server logs for errors
- Ensure database connection is stable

#### 5. "Transaction expired"
**Cause:** Payment not completed within time limit

**Solution:**
- Tripay transactions expire after 24 hours
- Create new transaction for expired payments
- Consider extending expiry time in Tripay settings

### Debug Mode

Enable detailed logging:

```typescript
// src/services/tripay.service.ts
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Tripay Request:', requestData);
  console.log('Tripay Response:', response);
}
```

### Webhook Testing Locally

Use ngrok to expose local server:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js dev server
bun dev

# In another terminal, expose port 3000
ngrok http 3000

# Update Tripay dashboard callback URL to:
https://your-ngrok-url.ngrok.io/api/webhooks/tripay

# Update .env
TRIPAY_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/webhooks/tripay
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io
```

## Migration Checklist

If you're migrating an existing project:

- [x] Install Tripay dependencies (none needed - uses fetch)
- [x] Remove Xendit dependencies (`xendit-node`)
- [x] Update environment variables
- [x] Run database migration to add Tripay fields
- [x] Update `PaymentService` to use `TripayService`
- [x] Update purchase API to accept `paymentMethod`
- [x] Add payment channel selection to UI
- [x] Update webhook endpoint
- [x] Deprecate old Xendit webhook (return 410)
- [x] Update success/failure pages with Tripay fields
- [x] Test complete payment flow
- [ ] Update documentation (you're reading it!)
- [ ] Train team on new flow
- [ ] Monitor first production transactions

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env` to version control
- ✅ Use different keys for dev/staging/production
- ✅ Rotate keys periodically
- ✅ Limit API key permissions to only what's needed

### Webhook Security
- ✅ Always verify callback token
- ✅ Always verify HMAC signature
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Log all webhook attempts
- ✅ Alert on suspicious activity

### Database Security
- ✅ Use unique constraints on `payment_reference`
- ✅ Prevent duplicate payment processing
- ✅ Use transactions for critical updates
- ✅ Implement proper indexes for performance

### User Security
- ✅ Validate user authentication before purchase
- ✅ Check photo availability before payment
- ✅ Implement CSRF protection
- ✅ Sanitize all user inputs

## Monitoring & Alerts

### Key Metrics to Track

1. **Payment Success Rate**
   ```typescript
   const successRate = (paidTransactions / totalTransactions) * 100;
   ```

2. **Average Payment Time**
   ```typescript
   const avgTime = sum(paidAt - createdAt) / count;
   ```

3. **Webhook Failures**
   ```typescript
   const failureRate = (failedWebhooks / totalWebhooks) * 100;
   ```

4. **Payment Method Distribution**
   ```typescript
   SELECT payment_method, COUNT(*) 
   FROM purchases 
   GROUP BY payment_method;
   ```

### Alerts to Set Up

- 🚨 Webhook failure rate > 5%
- 🚨 Payment success rate < 90%
- 🚨 Transaction creation errors
- 🚨 Signature verification failures
- 🚨 Database connection issues

## Support

### Tripay Documentation
- [Official Docs](https://tripay.co.id/developer)
- [API Reference](https://tripay.co.id/developer/api)
- [Sandbox/Simulator](https://tripay.co.id/simulator)

### Internal Support
- Slack: `#payment-integration`
- Email: dev@piksel-jual.com
- On-call: Check PagerDuty rotation

## Changelog

### 2025-01-15 - Tripay Migration Complete ✅
- Removed Xendit integration
- Implemented Tripay service
- Updated database schema
- Added payment channel selection
- Updated UI for Tripay flow
- Completed webhook handler
- Documentation created

---

**Last Updated:** January 15, 2025  
**Maintained by:** Development Team  
**Status:** ✅ Production Ready
