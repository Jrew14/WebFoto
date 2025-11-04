# Sidebar Upgrade - shadcn/ui Sidebar Component

## 🎉 Overview

Sidebar admin telah diupgrade menggunakan komponen **Sidebar** resmi dari shadcn/ui. Upgrade ini memberikan pengalaman UI yang lebih modern dengan fitur-fitur advanced seperti collapsible sidebar, mobile responsive, dan tooltip.

## ✨ New Features

### 1. **Collapsible Sidebar**
- Sidebar dapat di-collapse menjadi icon-only mode
- Keyboard shortcut: `Ctrl/Cmd + B` untuk toggle sidebar
- Smooth animation transitions
- Auto-collapse pada mobile

### 2. **Icon-Only Mode**
- Sidebar menyusut menjadi icon bar
- Tooltip muncul saat hover pada collapsed state
- Lebih banyak ruang untuk konten utama

### 3. **Mobile Responsive**
- Pada mobile: Sidebar menjadi slide-out sheet
- Touch-friendly interactions
- Overlay backdrop saat sidebar terbuka

### 4. **Header dengan Brand**
- Logo/icon (Camera) dengan background primary
- Brand name: "WebFoto Admin"
- Subtitle: "Dashboard Panel"
- Clickable untuk kembali ke dashboard

### 5. **Footer dengan Dropdown Menu**
- User info display (Admin + email)
- Dropdown menu untuk logout
- Expandable dengan ChevronUp icon

### 6. **Sidebar Trigger Button**
- Header bar dengan trigger button
- Breadcrumb navigation
- Separator untuk visual clarity

## 🏗️ Architecture

### Components Installed

```bash
bunx shadcn@latest add sidebar
bunx shadcn@latest add dropdown-menu
bunx shadcn@latest add breadcrumb
```

**Auto-installed dependencies:**
- `separator` - Visual dividers
- `sheet` - Mobile drawer
- `tooltip` - Icon tooltips
- `skeleton` - Loading states

### File Structure

```
src/
├── components/
│   ├── admin/
│   │   └── Sidebar.tsx (Updated - AppSidebar)
│   └── ui/
│       ├── sidebar.tsx (New)
│       ├── dropdown-menu.tsx (New)
│       ├── breadcrumb.tsx (New)
│       ├── separator.tsx (New)
│       ├── sheet.tsx (New)
│       ├── tooltip.tsx (New)
│       └── skeleton.tsx (New)
├── hooks/
│   └── use-mobile.ts (New)
└── app/
    └── admin/
        └── (dashboard)/
            └── layout.tsx (Updated - SidebarProvider)
```

## 📝 Code Changes

### 1. Sidebar Component (`src/components/admin/Sidebar.tsx`)

**Before:**
```tsx
export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r...">
      {/* Static sidebar */}
    </aside>
  );
}
```

**After:**
```tsx
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* Brand with logo */}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarMenu>
            {/* Menu items with tooltips */}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        {/* User dropdown */}
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
```

### 2. Layout Update (`src/app/admin/(dashboard)/layout.tsx`)

**Before:**
```tsx
return (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar />
    <main className="flex-1">
      {children}
    </main>
  </div>
);
```

**After:**
```tsx
return (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>WebFoto Admin</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </SidebarInset>
  </SidebarProvider>
);
```

## 🎨 UI Components Breakdown

### SidebarHeader
```tsx
<SidebarHeader>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton size="lg" asChild>
        <Link href="/admin/dashboard">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Camera className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">WebFoto Admin</span>
            <span className="truncate text-xs">Dashboard Panel</span>
          </div>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarHeader>
```

### SidebarContent (Menu Items)
```tsx
<SidebarContent>
  <SidebarGroup>
    <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
              disabled={item.disabled}
            >
              <Link href={item.href}>
                <Icon />
                <span>{item.title}</span>
                {item.disabled && <span>Soon</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</SidebarContent>
```

### SidebarFooter (User Menu)
```tsx
<SidebarFooter>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton size="lg">
            <User icon />
            <div>
              <span>Admin</span>
              <span>admin@webfoto.com</span>
            </div>
            <ChevronUp />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarFooter>
```

## 🎯 Key Features Explained

### 1. Collapsible Behavior
```tsx
<Sidebar collapsible="icon">
```
- **"icon"**: Sidebar collapses to icon-only mode
- **"offcanvas"**: Sidebar slides out completely (default mobile)
- **"none"**: Sidebar stays fixed

### 2. Tooltip on Collapsed State
```tsx
<SidebarMenuButton
  tooltip={item.title}  // Tooltip muncul saat collapsed
>
```

### 3. Active State
```tsx
<SidebarMenuButton
  isActive={pathname === item.href}
>
```
Auto-styling untuk menu yang sedang aktif.

### 4. Keyboard Shortcut
```tsx
// Built-in: Ctrl/Cmd + B untuk toggle
const SIDEBAR_KEYBOARD_SHORTCUT = "b"
```

### 5. Mobile Detection
```tsx
const { isMobile } = useSidebar()
// Auto switch to Sheet mode pada mobile
```

## 📱 Responsive Behavior

### Desktop (> 768px)
- Sidebar fixed di kiri
- Dapat di-collapse ke icon mode
- Width: 16rem (expanded) / 3rem (collapsed)

### Mobile (< 768px)
- Sidebar menjadi Sheet (drawer)
- Trigger button di header
- Overlay backdrop
- Width: 18rem

## 🎨 Styling & Theming

### CSS Variables
```css
--sidebar-width: 16rem
--sidebar-width-icon: 3rem
--sidebar-width-mobile: 18rem
```

### Theme Colors
- `bg-sidebar` - Sidebar background
- `text-sidebar-foreground` - Sidebar text
- `bg-sidebar-primary` - Primary elements (logo, user icon)
- `bg-sidebar-accent` - Active/hover states
- `bg-sidebar-border` - Borders and separators

### Data Attributes
```tsx
data-state="expanded" | "collapsed"
data-collapsible="icon" | "offcanvas" | "none"
data-variant="sidebar" | "floating" | "inset"
data-mobile="true" | "false"
```

## ⚡ Performance

### State Management
- Uses React Context (`SidebarContext`)
- Cookie persistence for sidebar state
- Memoized context values
- Minimal re-renders

### Animations
- CSS transitions: `duration-200 ease-linear`
- Smooth width transitions
- Transform-based animations

## 🔧 Configuration

### Menu Items
```tsx
const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  // ... more items
  {
    title: "Profile Admin",
    href: "/admin/profile",
    icon: User,
    disabled: true,  // Coming soon items
  },
];
```

### Logout Function
```tsx
const handleLogout = async () => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/admin/auth/logout";
  document.body.appendChild(form);
  form.submit();
};
```

## 🆕 New Hooks

### useSidebar()
```tsx
const {
  state,           // "expanded" | "collapsed"
  open,            // boolean
  setOpen,         // (open: boolean) => void
  isMobile,        // boolean
  openMobile,      // boolean
  setOpenMobile,   // (open: boolean) => void
  toggleSidebar,   // () => void
} = useSidebar();
```

### useIsMobile()
```tsx
const isMobile = useIsMobile();
// Detects screen width < 768px
```

## 🎯 Benefits of Upgrade

### Before (Custom Sidebar)
- ❌ Static width
- ❌ No collapse feature
- ❌ Basic mobile support
- ❌ No keyboard shortcuts
- ❌ Manual responsive handling

### After (shadcn Sidebar)
- ✅ Collapsible with icon mode
- ✅ Built-in mobile responsive
- ✅ Keyboard shortcuts (Cmd/Ctrl + B)
- ✅ Tooltip support
- ✅ Cookie state persistence
- ✅ Smooth animations
- ✅ Dropdown menu integration
- ✅ Better accessibility

## 🧪 Testing

### Desktop
1. ✅ Click trigger button - sidebar collapses
2. ✅ Hover icons - tooltips appear
3. ✅ Press Cmd/Ctrl + B - toggle sidebar
4. ✅ Click menu items - navigation works
5. ✅ Click user dropdown - logout option appears

### Mobile
1. ✅ Resize to < 768px - sidebar auto-hides
2. ✅ Click trigger - sheet opens
3. ✅ Click menu item - sheet closes and navigates
4. ✅ Click backdrop - sheet closes

### Active States
1. ✅ Navigate to page - menu item highlights
2. ✅ Active state persists in collapsed mode
3. ✅ Disabled items show "Soon" badge

## 📊 Component Hierarchy

```
SidebarProvider
├── AppSidebar (Sidebar)
│   ├── SidebarHeader
│   │   └── SidebarMenu
│   │       └── SidebarMenuItem
│   │           └── SidebarMenuButton (Brand)
│   ├── SidebarContent
│   │   └── SidebarGroup
│   │       ├── SidebarGroupLabel
│   │       └── SidebarGroupContent
│   │           └── SidebarMenu
│   │               └── SidebarMenuItem[]
│   │                   └── SidebarMenuButton
│   ├── SidebarFooter
│   │   └── SidebarMenu
│   │       └── SidebarMenuItem
│   │           └── DropdownMenu
│   │               ├── DropdownMenuTrigger
│   │               │   └── SidebarMenuButton (User)
│   │               └── DropdownMenuContent
│   │                   └── DropdownMenuItem (Logout)
│   └── SidebarRail
└── SidebarInset
    ├── header
    │   ├── SidebarTrigger
    │   ├── Separator
    │   └── Breadcrumb
    └── children (Page content)
```

## 🔗 Resources

- [shadcn/ui Sidebar Docs](https://ui.shadcn.com/docs/components/sidebar)
- [Radix UI Sheet](https://www.radix-ui.com/primitives/docs/components/sheet)
- [Radix UI Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)

## 📝 Migration Notes

### Breaking Changes
- Component name: `Sidebar` → `AppSidebar`
- Layout structure changed to use `SidebarProvider`
- Logout moved from nav menu to footer dropdown

### Non-Breaking
- Menu items array structure unchanged
- Routing logic unchanged
- Authentication flow unchanged
- Active state detection unchanged

## 🚀 Future Enhancements

- [ ] Add user profile picture in footer
- [ ] Multiple sidebar groups (e.g., Settings section)
- [ ] Badge notifications on menu items
- [ ] Collapsible sub-menus
- [ ] Search functionality in sidebar
- [ ] Recent pages history
- [ ] Theme switcher in footer dropdown

---

**Status:** ✅ Successfully Upgraded
**Date:** 2025-10-20
**Server:** http://localhost:3001
**No Errors:** All components working perfectly
