# Tripay Configuration Guide

## Important: Production vs Sandbox

### Understanding Tripay Modes

Tripay has two environments:
1. **Sandbox/Simulator** - For testing
2. **Production** - For real transactions

### Merchant Code Types

**T46723** = Production merchant code (starts with T but is production)
- Use Production API: `https://tripay.co.id/api-merchant`
- Real money transactions
- Requires real payment

**Sandbox codes** (from simulator):
- Use Sandbox API: `https://tripay.co.id/api-sandbox`
- Test transactions only
- No real money

## Configuration Steps

### 1. Get Tripay Credentials

Go to Tripay Dashboard: https://tripay.co.id

**For Production (Real Transactions):**
1. Login to your merchant account
2. Go to **Settings** → **API Credentials**
3. Copy:
   - Merchant Code (e.g., T46723)
   - API Key
   - Private Key

**For Sandbox (Testing):**
1. Go to https://tripay.co.id/simulator/merchant
2. Use simulator credentials

### 2. Configure in Admin Settings

1. Navigate to `/admin/settings`
2. Fill in **Tripay Payment Gateway** section:
   - **Mode**: Select "Production" for T46723
   - **Merchant Code**: T46723 (or your merchant code)
   - **API Key**: Your API key from dashboard
   - **Private Key**: Your private key from dashboard
3. Click **Save Settings**
4. **Restart dev server**: `bun dev`

### 3. Verify Configuration

After restarting, check terminal logs:
```
[Tripay] Using PRODUCTION mode with merchant code: T46723
[Tripay] API URL: https://tripay.co.id/api-merchant
```

Visit `/shop` page:
- Payment channels should load without errors
- Available payment methods will be displayed

## Common Errors

### Error: "Sandbox API but with Production credential"

**Problem:** Using T46723 with sandbox API URL

**Solution:**
1. Go to `/admin/settings`
2. Change Mode to "Production"
3. Save and restart server

### Error: "Invalid API Key"

**Problem:** API Key doesn't match merchant code

**Solution:**
1. Verify credentials in Tripay dashboard
2. Copy fresh API Key
3. Update in `/admin/settings`
4. Save and restart

### Error: "No payment channels available"

**Problem:** API not responding or wrong credentials

**Solution:**
1. Check internet connection
2. Verify all 3 credentials are correct
3. Check Mode matches your merchant type
4. Restart server after changes

## Environment Variables

Settings are stored in `.env.local`:
```bash
TRIPAY_MODE=production
TRIPAY_MERCHANT_CODE=T46723
TRIPAY_API_KEY=your_api_key_here
TRIPAY_PRIVATE_KEY=your_private_key_here
```

**Note:** Don't edit .env.local directly. Use admin settings page.

## API Endpoints

### Production
- **API URL:** `https://tripay.co.id/api-merchant`
- **For:** Real transactions
- **Merchant Code:** T46723 (or your assigned code)

### Sandbox
- **API URL:** `https://tripay.co.id/api-sandbox`
- **For:** Testing only
- **Merchant Code:** From simulator

## Testing Payment Flow

### 1. Browse Photos
- Go to `/browse`
- Add photos to cart
- Click "Proceed to Checkout"

### 2. Select Payment Method
- Choose payment channel (e.g., BCA Virtual Account)
- Click "Create Payment"

### 3. Complete Payment
- Use payment details provided
- In production: Real payment required
- In sandbox: Use simulator payment

### 4. Verify Purchase
- Check `/gallery` for purchased photos
- Should see HD version without watermark
- Download button available

## Webhook Configuration

Tripay will send notifications to:
```
https://yourdomain.com/api/webhooks/tripay
```

**Setup:**
1. In Tripay dashboard: Settings → Callback URL
2. Enter: `https://yourdomain.com/api/webhooks/tripay`
3. Save

**Local Testing:**
Use ngrok or similar tool:
```bash
ngrok http 3000
# Use ngrok URL for callback
```

## Security Notes

1. **Never commit credentials** to git
2. **Use environment variables** (.env.local)
3. **Verify webhook signatures** (auto-handled)
4. **Use HTTPS** in production

## Troubleshooting Checklist

- [ ] Merchant code is correct (T46723)
- [ ] Mode is set to "Production"
- [ ] API Key is from production dashboard
- [ ] Private Key is from production dashboard
- [ ] Server restarted after changes
- [ ] .env.local file updated correctly
- [ ] No typos in credentials
- [ ] Internet connection working
- [ ] Tripay services are online

## Support

If issues persist:
1. Check Tripay status: https://tripay.co.id
2. Contact Tripay support
3. Check terminal logs for detailed errors
4. Review `/docs/TRIPAY_CONFIGURATION.md`

## Related Documentation
- [Admin Settings](./ADMIN_SETTINGS.md)
- [Payment Flow](./PAYMENT_FLOW.md)
- [Shop Page](./SHOP_README.md)
