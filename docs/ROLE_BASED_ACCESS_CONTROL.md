# Role-Based Access Control Middleware

## Overview
Implemented middleware to automatically redirect users based on their roles, ensuring proper separation between admin and customer interfaces.

## Implementation Date
October 29, 2025

## Features

### 1. Admin Route Protection
- **Routes Protected**: `/admin/*` (except `/admin/login`)
- **Access Control**:
  - ✅ Only users with `role: 'admin'` can access
  - ❌ Unauthenticated users → Redirected to `/admin/login`
  - ❌ Authenticated buyers → Redirected to `/gallery` with error message

### 2. Customer Route Protection
- **Routes Protected**: `/gallery/*`, `/shop/*`, `/user/*`, `/home/*`
- **Access Control**:
  - ✅ Buyers and unauthenticated users can access
  - ❌ Admins → Redirected to `/admin/dashboard` with info message

### 3. Smart Redirects
- **Admin Login Page**: Already authenticated admins are automatically redirected to `/admin/dashboard`
- **Unauthorized Access**: Users attempting to access routes outside their role are redirected to their appropriate area

## Technical Details

### Middleware Logic Flow

```
┌─────────────────────────────────────┐
│   User accesses route               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Get user authentication & role    │
│   from Supabase                     │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌─────────────┐ ┌─────────────┐
│Admin Route? │ │Customer Rt? │
└──────┬──────┘ └──────┬──────┘
       │               │
       ▼               ▼
  [Admin Logic]  [Customer Logic]
```

### Admin Route Logic
```typescript
if (adminRoutes) {
  // Allow /admin/login for non-admins
  if (pathname === "/admin/login") {
    if (user && userRole === "admin") {
      return redirect("/admin/dashboard");
    }
    return allow;
  }

  // Require authentication
  if (!user) return redirect("/admin/login");

  // Require admin role
  if (userRole !== "admin") {
    return redirect("/gallery?error=admin_only");
  }

  // Allow access
  return allow;
}
```

### Customer Route Logic
```typescript
if (customerRoutes) {
  // Block admins
  if (user && userRole === "admin") {
    return redirect("/admin/dashboard?info=customer_only");
  }

  // Allow buyers and guests
  return allow;
}
```

## Routes Configuration

### Protected Routes
```typescript
export const config = {
  matcher: [
    // Admin routes
    "/admin/:path*",
    
    // Customer routes
    "/gallery/:path*",
    "/shop/:path*",
    "/user/:path*",
    "/home/:path*"
  ],
};
```

## Access Control Matrix

| User Role | `/admin/*` | `/gallery` | `/shop` | `/user` | `/home` |
|-----------|------------|------------|---------|---------|---------|
| **Admin** | ✅ Allow | ❌ Redirect to `/admin/dashboard` | ❌ Redirect to `/admin/dashboard` | ❌ Redirect to `/admin/dashboard` | ❌ Redirect to `/admin/dashboard` |
| **Buyer** | ❌ Redirect to `/gallery` | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| **Guest** | ❌ Redirect to `/admin/login` | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |

## User Experience

### Admin User Journey
1. **Accessing Admin Area**:
   - ✅ Direct access to `/admin/*` routes
   - ✅ Auto-redirect from `/admin/login` if already logged in

2. **Accessing Customer Area**:
   - ❌ Blocked from `/gallery`, `/shop`, `/user`, `/home`
   - 🔄 Redirected to `/admin/dashboard?info=customer_only`

### Buyer User Journey
1. **Accessing Customer Area**:
   - ✅ Full access to `/gallery`, `/shop`, `/user`, `/home`
   - ✅ Can browse without authentication

2. **Accessing Admin Area**:
   - ❌ Blocked from `/admin/*` (except `/admin/login`)
   - 🔄 Redirected to `/gallery?error=admin_only`

### Guest User Journey
1. **Accessing Customer Area**:
   - ✅ Full access to browse galleries and shops
   
2. **Accessing Admin Area**:
   - ❌ Blocked from protected admin routes
   - 🔄 Redirected to `/admin/login`

## Error Messages

### Query Parameters for User Feedback

| Parameter | Value | Meaning | Suggested UI Message |
|-----------|-------|---------|---------------------|
| `error` | `admin_only` | Buyer tried to access admin area | "This area is for administrators only." |
| `info` | `customer_only` | Admin tried to access customer area | "This area is for customers. You are logged in as admin." |

## Security Considerations

1. **Role Verification**: User role is fetched from the database on every request, not from cookies
2. **No Cookie-Based Role Storage**: Prevents client-side role manipulation
3. **Supabase Auth Integration**: Leverages Supabase's secure authentication system
4. **Profile Check**: Always verifies user role from the `profiles` table

## Testing Checklist

- [ ] Admin can access `/admin/dashboard`
- [ ] Admin cannot access `/gallery`, `/shop`, `/user`, `/home`
- [ ] Admin is redirected to dashboard when accessing customer routes
- [ ] Buyer can access `/gallery`, `/shop`, `/user`, `/home`
- [ ] Buyer cannot access `/admin/*` routes (except login page)
- [ ] Buyer is redirected to gallery when accessing admin routes
- [ ] Guest users can view customer routes
- [ ] Guest users are redirected to login when accessing admin routes
- [ ] Authenticated admin is auto-redirected from `/admin/login` to dashboard

## Files Modified

- `src/middleware.ts` - Complete rewrite of role-based access control logic

## Dependencies

- `@supabase/ssr` - Server-side Supabase client
- `next` - Next.js framework
- Database table: `profiles` with `role` column (`'admin' | 'buyer'`)

## Future Improvements

1. **Cache Role Data**: Consider caching user roles in session to reduce database queries
2. **More Granular Permissions**: Add feature-level permissions beyond just admin/buyer
3. **Audit Logging**: Log unauthorized access attempts for security monitoring
4. **Rate Limiting**: Add rate limiting for failed access attempts

## Related Documentation

- [PRD](./prd.md) - Product Requirements Document
- [Plan](./plan.md) - Delivery Plan
- [Admin Dashboard](./ADMIN_DASHBOARD_README.md)
- [Admin Login](./ADMIN_LOGIN_README.md)
- [Gallery](./GALLERY_SUMMARY.md)
