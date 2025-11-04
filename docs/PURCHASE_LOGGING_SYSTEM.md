# Purchase Logging & Manual Payment Verification System

## Overview
Complete purchase management system with dual payment types (manual transfer & automatic payment gateway), admin verification workflow, and user purchase history.

## ✅ Completed Features

### 1. Database Schema Updates
- **Migration 006**: Added manual payment tracking columns to `purchases` table
  - `payment_type`: "manual" | "automatic"
  - `payment_proof_url`: URL to uploaded proof (future enhancement)
  - `manual_payment_method_id`: FK to manual_payment_methods
  - `verified_by`: Admin who verified the payment
  - `verified_at`: Timestamp of verification

### 2. User Purchase History (`/user/purchases`)
- **Location**: `src/app/user/purchases/page.tsx`
- **Features**:
  - View all purchased photos with status
  - Filter by status (All, Paid, Pending)
  - Photo preview with event details
  - Download button (only for paid status)
  - Payment type and method display
  - Transaction details (date, amount, expiry)
  - Visual status badges (paid, pending, expired, failed)

### 3. Admin Purchase Management (`/admin/purchases`)
- **Location**: `src/app/admin/(dashboard)/purchases/page.tsx`
- **Features**:
  - View all purchases across all users
  - Statistics dashboard (total, paid, pending, manual pending)
  - Filter by status and payment type
  - Detailed purchase view dialog
  - Verify manual payments (approve/reject)
  - Payment proof preview (when implemented)
  - Buyer and photo information
  - Verification history tracking

### 4. API Endpoints

#### **User Purchases API** (`/api/purchases/user`)
- **Method**: GET
- **Purpose**: Get all purchases for authenticated user
- **Returns**: List of purchases with photo and event details
- **Authentication**: Required (user auth)

#### **Admin Purchases API** (`/api/admin/purchases`)
- **Method**: GET
- **Purpose**: Get all purchases across all users
- **Returns**: List of purchases with buyer, photo, and verifier info
- **Authentication**: Admin only
- **Features**: Includes verification history

#### **Purchase Verification API** (`/api/admin/purchases/[id]/verify`)
- **Method**: PATCH
- **Purpose**: Approve or reject manual payments
- **Body**: `{ action: "approve" | "reject" }`
- **Authentication**: Admin only
- **Actions**:
  - Approve: Sets status to "paid", records verifier and timestamp
  - Reject: Sets status to "failed"

#### **Photo Download API** (`/api/photos/download`)
- **Method**: GET
- **Purpose**: Secure photo download with purchase verification
- **Query**: `?photoId=<uuid>`
- **Authentication**: Required (user auth)
- **Validation**: Checks if user has paid purchase for photo

#### **Manual Purchase Creation** (`/api/purchases/manual`)
- **Method**: POST
- **Purpose**: Create manual payment purchase record
- **Body**: 
  ```json
  {
    "photoId": "uuid",
    "amount": number,
    "totalAmount": number,
    "manualPaymentMethodId": "uuid",
    "paymentMethod": "string"
  }
  ```
- **Authentication**: Required (user auth)
- **Returns**: Transaction ID for tracking

## Purchase Flow

### Manual Payment Flow
1. **User selects "Manual Transfer"** in shop
2. **Choose payment method** (BCA, BNI, DANA, etc.)
3. **View transfer instructions** with account details
4. **Confirm payment** → Creates purchase with status "pending"
5. **Redirect to pending page** with 24-hour expiry
6. **Admin reviews** purchase in admin panel
7. **Admin approves** → Status changes to "paid"
8. **User can download** photo after approval

### Automatic Payment Flow
1. **User selects "Automatic Payment"** in shop
2. **Choose payment channel** (Virtual Account, E-Wallet, etc.)
3. **Redirect to Tripay** payment page
4. **User completes payment** on Tripay
5. **Webhook updates status** to "paid" automatically
6. **User can download** immediately after payment

## Status Flow

```
Manual:   pending → [admin approve] → paid → download available
                  → [admin reject]  → failed → no access

Automatic: pending → [webhook] → paid → download available
                               → failed/expired → no access
```

## Database Relationships

```
purchases
├─ buyerId → profiles.id (user who purchased)
├─ photoId → photos.id (photo purchased)
├─ manualPaymentMethodId → manual_payment_methods.id (if manual)
└─ verifiedBy → profiles.id (admin who verified, if manual)

photos
├─ eventId → events.id
└─ photographerId → profiles.id

manual_payment_methods
└─ independent table with payment method details
```

## Security Features

- **Authentication**: All endpoints require user authentication
- **Authorization**: Admin endpoints verify admin role
- **Purchase Verification**: Download only allowed for paid purchases
- **Unique Constraint**: One purchase per user per photo (buyer_id + photo_id)
- **Expiry Tracking**: 24-hour expiry for manual payments

## UI Components Used

### Shadcn Components
- `Button`
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Badge`
- `Table`, `TableHeader`, `TableRow`, `TableCell`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`

### Icons (lucide-react)
- `ShoppingBag`, `Clock`, `CheckCircle`, `XCircle`
- `Download`, `Eye`, `Loader2`, `Filter`
- `Calendar`, `CreditCard`

## File Structure

```
src/
├── app/
│   ├── user/
│   │   └── purchases/
│   │       └── page.tsx           # User purchase history
│   ├── admin/
│   │   └── (dashboard)/
│   │       └── purchases/
│   │           └── page.tsx       # Admin purchase management
│   └── api/
│       ├── purchases/
│       │   ├── user/
│       │   │   └── route.ts       # GET user purchases
│       │   └── manual/
│       │       └── route.ts       # POST create manual purchase
│       ├── photos/
│       │   └── download/
│       │       └── route.ts       # GET secure download
│       └── admin/
│           └── purchases/
│               ├── route.ts       # GET all purchases (admin)
│               └── [id]/
│                   └── verify/
│                       └── route.ts # PATCH verify purchase
├── db/
│   └── schema.ts                  # Updated with manual payment columns
└── components/
    └── ui/                        # Shadcn components

supabase/
└── migrations/
    ├── 005_manual_payment_methods.sql    # ✅ Executed
    └── 006_manual_payment_tracking.sql   # ✅ Executed

scripts/
└── migrate-purchases.ts           # Migration script (✅ executed)
```

## Future Enhancements

### High Priority
1. **Payment Proof Upload**:
   - Add file upload in manual instructions page
   - Store in Supabase Storage
   - Display in admin verification dialog

2. **Email Notifications**:
   - Send confirmation email after purchase creation
   - Notify user when admin approves/rejects
   - Send download link after approval

3. **Purchase Receipt**:
   - Generate PDF receipt after payment
   - Include transaction details and photo info
   - Download or email option

### Medium Priority
4. **Expiry Handling**:
   - Automatic status update to "expired" after 24 hours
   - Cron job or edge function for expiry checks
   - Allow user to retry payment

5. **Bulk Operations**:
   - Admin bulk approve/reject
   - Bulk download for users
   - Export purchase reports

6. **Advanced Filters**:
   - Date range filter
   - Search by transaction ID
   - Filter by event or photographer

### Low Priority
7. **Analytics Dashboard**:
   - Revenue tracking
   - Popular photos/events
   - Payment method statistics
   - Conversion rates

8. **User Notifications**:
   - In-app notification system
   - Bell icon with unread count
   - Real-time updates via WebSocket

## Testing Checklist

### User Flow
- [ ] Login as buyer
- [ ] Navigate to shop (`/shop`)
- [ ] Click "Buy" on a photo
- [ ] Select "Manual Transfer"
- [ ] Choose payment method (e.g., BCA)
- [ ] Confirm payment → redirects to `/payment/manual-pending`
- [ ] Check purchase in `/user/purchases` (should show pending)
- [ ] Verify download button is disabled

### Admin Flow
- [ ] Login as admin
- [ ] Navigate to `/admin/purchases`
- [ ] See purchase in pending list
- [ ] Click "View" to see details
- [ ] Click "Approve" to verify payment
- [ ] Verify status changes to "paid"
- [ ] Check verifier name and timestamp

### Verification
- [ ] Return to buyer account
- [ ] Refresh `/user/purchases`
- [ ] Verify status now shows "Paid"
- [ ] Click "Download" → photo downloads successfully
- [ ] Try downloading same photo again → should work

## Build Status

✅ **Build Successful** (45 static pages generated)
✅ **No TypeScript Errors**
⚠️ **ESLint Warnings** (non-blocking, mostly unused vars and img tags)

## Migration Status

✅ **005_manual_payment_methods.sql** - Executed (9 methods seeded)
✅ **006_manual_payment_tracking.sql** - Executed (5 columns added)

## Notes

- All purchases start with status "pending"
- Manual payments require admin verification
- Automatic payments updated via Tripay webhook
- Only "paid" status allows photo download
- 24-hour expiry for manual payments
- Transaction ID format: `TRX-{timestamp}-{random}`

## Related Documentation

- [Manual Payment Methods System](./ADMIN_PAYMENT_METHODS_README.md)
- [Tripay Integration](./TRIPAY_INTEGRATION.md)
- [Purchase API Guide](./PURCHASE_API_GUIDE.md)
- [Admin Dashboard](./ADMIN_DASHBOARD_README.md)
