# Admin User Edit & Delete Feature

## Overview
Admin sekarang dapat mengedit informasi user (nama, phone, role, password) dan menghapus user dari sistem melalui halaman User Management.

## Fitur yang Ditambahkan

### 1. **Edit User Information**
Admin dapat mengubah:
- **Full Name**: Nama lengkap user
- **Phone Number**: Nomor telepon user
- **Role**: Mengubah antara "Buyer" dan "Admin"
- **Password**: Reset/ubah password user (opsional)

### 2. **Delete User**
Admin dapat menghapus user dari sistem, termasuk:
- Data authentication dari Supabase Auth
- Profile dari database
- Related records (purchases, bookmarks) via cascade

## UI Components

### Users Table
```tsx
// Setiap row user memiliki 2 tombol aksi:
<Button onClick={() => setSelectedUser(user)}>
  <Eye /> View
</Button>
<Button onClick={() => handleEditUser(user)}>
  <Edit /> Edit
</Button>
```

### View Dialog
- Menampilkan detail lengkap user
- Statistics (purchases, spent, last purchase)
- Tombol "Edit User" di footer untuk switch ke edit mode

### Edit Dialog
Form fields:
1. **Full Name** - Text input (editable)
2. **Email** - Text input (disabled/read-only)
3. **Phone Number** - Text input (editable)
4. **Role** - Dropdown select (Buyer/Admin)
5. **New Password** - Password input (optional)

Buttons:
- **Delete User** (destructive, kiri) - Hapus user permanen
- **Cancel** (outline) - Batalkan dan tutup dialog
- **Save Changes** (primary) - Simpan perubahan

## API Endpoints

### PATCH `/api/admin/users/[id]`
Update user information

**Request Body:**
```json
{
  "fullName": "string (optional)",
  "phone": "string (optional)",
  "role": "admin | buyer (optional)",
  "password": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

**Implementation:**
- Updates `profiles` table via Drizzle ORM
- Updates password via Supabase Admin API
- Only updates fields that are provided
- Password field is optional (empty = tidak ubah)

### DELETE `/api/admin/users/[id]`
Delete user from system

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Implementation:**
- Deletes from Supabase Auth using admin client
- Deletes from `profiles` table
- Cascade deletion handles related records

## Supabase Admin Client

Created `src/lib/supabase/admin.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

**Purpose:**
- Server-side operations with elevated privileges
- Bypass RLS policies
- Update auth users (password, etc.)
- Delete users

**Security:**
- Only used in API routes (server-side)
- Never exposed to client
- Requires `SUPABASE_SERVICE_ROLE_KEY` env variable

## State Management

### New States
```typescript
const [isEditing, setIsEditing] = useState(false);
const [editForm, setEditForm] = useState({
  fullName: "",
  phone: "",
  role: "" as "admin" | "buyer",
  password: "",
});
const [saving, setSaving] = useState(false);
```

### State Flow
1. User clicks "Edit" → `handleEditUser(user)` called
2. Set `selectedUser` and populate `editForm`
3. Set `isEditing = true` → Show edit form
4. User modifies fields → Update `editForm` state
5. Click "Save" → `handleSaveUser()` → API call
6. Success → Reload users → Close dialog
7. Click "Cancel" → Close dialog without saving

## User Flow

### Edit User:
1. Admin navigates to `/admin/users`
2. Finds user in table
3. Clicks "Edit" button
4. Edit dialog opens with pre-filled form
5. Modifies fields as needed
6. Clicks "Save Changes"
7. Confirmation alert on success
8. Dialog closes, table refreshes

### Delete User:
1. In edit dialog, click "Delete User"
2. Confirmation dialog appears
3. Confirm deletion
4. User removed from system
5. Table refreshes
6. Dialog closes

## Security Considerations

### Authorization
- Routes protected by middleware (admin only)
- API endpoints check user role
- Uses Supabase service role key for auth operations

### Validation
- Email cannot be changed (primary identifier)
- Password is optional (only updated if provided)
- Role must be "admin" or "buyer"
- Delete requires confirmation

### Data Integrity
- Cascade deletion for related records
- Transaction handling in database operations
- Error handling with try-catch blocks

## Error Handling

### Client-side:
```typescript
try {
  // API call
} catch (error) {
  console.error("Failed to save user:", error);
  alert("Failed to update user");
}
```

### Server-side:
```typescript
try {
  // Database operations
} catch (error) {
  console.error("Failed to update user:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important:**
- `SUPABASE_SERVICE_ROLE_KEY` is different from `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Service role key has elevated privileges
- Never expose service role key to client

## UI Screenshots Context

### Users Table
- Avatar (or initial circle)
- Full name & phone
- Email with icon
- Role badge (purple for Admin, blue for Buyer)
- Statistics (purchases, spent)
- Join date
- Action buttons (View, Edit)

### Edit Dialog
- Clean form layout
- Disabled email field (grey background)
- Role dropdown with icons
- Password field with helper text
- Destructive delete button (red)
- Action buttons (Cancel, Save)
- Loading state on save

## Testing Checklist

- [x] Edit user full name
- [x] Edit user phone number
- [x] Change user role (buyer ↔ admin)
- [x] Reset user password
- [x] Delete user
- [x] Cancel edit without saving
- [x] Form validation
- [x] Error handling
- [x] Loading states
- [x] Permission checks
- [ ] Test with multiple admin users (manual testing required)

## Known Limitations

1. **Email cannot be changed**: Supabase Auth uses email as primary identifier
2. **Password must meet requirements**: Supabase enforces minimum 6 characters
3. **Cannot delete last admin**: Consider implementing check to prevent this
4. **No undo for delete**: Deletion is permanent

## Future Enhancements

1. **Audit Log**: Track who edited/deleted which users
2. **Bulk Operations**: Select multiple users for role change
3. **Email Notifications**: Send email when password is reset
4. **Last Admin Protection**: Prevent deleting or demoting last admin
5. **Search & Filter**: More advanced user search capabilities
6. **Export Users**: Download user list as CSV/Excel
7. **User Activity**: Show login history and recent actions

## Related Files

- `src/app/admin/(dashboard)/users/page.tsx` - User management UI
- `src/app/api/admin/users/[id]/route.ts` - Edit/Delete API
- `src/lib/supabase/admin.ts` - Supabase admin client
- `docs/ADMIN_USER_EDIT.md` - This documentation

## Status
✅ **COMPLETED** - All features implemented and tested in development mode
