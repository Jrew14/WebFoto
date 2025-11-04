# Public Home Page - Pinterest-Style Layout

## Overview
Halaman utama public WebFoto dengan tampilan inspirasi Pinterest, menampilkan kolase foto dengan masonry grid layout yang menarik dan responsive.

## Features Implemented

### 1. **Public Navbar** (`/components/public/PublicNavbar.tsx`)
Navbar sederhana untuk halaman public tanpa sidebar.

**Components:**
- Logo WebFoto dengan icon Camera
- Navigation links: Explore, About, Events
- Auth buttons: Log in & Sign up (pojok kanan atas)
- Sticky positioning
- Backdrop blur effect
- Responsive design

**Styling:**
- Clean & minimal design
- Button "Sign up" dengan primary color (menonjol)
- Button "Log in" dengan ghost variant
- Hidden nav links pada mobile (<md)
- Logo text hidden pada small screens

### 2. **Public Layout** (`/app/home/layout.tsx`)
Layout wrapper untuk halaman public.

**Structure:**
```tsx
<div className="min-h-screen flex flex-col">
  <PublicNavbar />
  <main className="flex-1">{children}</main>
</div>
```

### 3. **Home Page** (`/app/home/page.tsx`)
Halaman utama dengan Pinterest-style masonry grid.

## Page Sections

### A. Hero Section
**Content:**
- Main heading: "Get your next"
- Sub heading: "photo collection idea" (emerald color)
- Description text
- Search bar dengan icon

**Styling:**
- Gradient background (slate-50 to background)
- Center aligned
- Responsive text sizes (4xl → 6xl)
- Max-width container

### B. Filter Tabs (Sticky)
**Features:**
- Filter buttons untuk event categories
- Sticky positioning below navbar
- Backdrop blur effect
- Horizontal scroll pada mobile
- Active state styling (bg-slate-900)
- Pill-shaped buttons

**Filter Options:**
- All (default)
- Wedding
- Corporate
- Birthday
- Concert
- Graduation
- Portrait
- Nature

### C. Masonry Grid
**Layout:**
- CSS Columns untuk masonry effect
- Responsive columns:
  - Mobile: 1 column
  - SM: 2 columns
  - MD: 3 columns
  - LG: 4 columns
  - XL: 5 columns
- Gap: 4 (1rem)
- Space-y: 4

**Photo Cards:**
- Rounded-2xl corners
- Shadow on default, xl shadow on hover
- White background
- Break-inside-avoid untuk masonry
- Group hover effects

**Image Display:**
- Lazy loading
- Object-cover
- Variable heights untuk organic layout
- Smooth transitions

**Hover Overlay:**
- Gradient overlay (black from bottom)
- Opacity transition
- Show on hover only

**Action Buttons (Top Right):**
- ❤️ Heart (Bookmark)
- 📥 Download
- Circular white buttons
- Hover scale effect
- Shadow-lg

**Info Display (Bottom):**
- Event name (white text)
- Photographer name (white/90 opacity)
- Price (Rp Xk format)
- Add to Cart button (primary)

### D. Footer CTA
**Content:**
- Heading: "Ready to find your perfect photos?"
- Description text
- Two CTAs: Sign up & Log in

**Styling:**
- Gradient background (slate-50 from top)
- Center aligned
- Button group with gap

## Data Structure

### Photo Interface
```typescript
interface Photo {
  id: string;
  name: string;
  price: number;
  eventId: string;
  eventName: string;
  preview: string;
  uploadDate: string;
  photographer: string;
  height: number; // untuk masonry layout
}
```

### Mock Data
- **16 photos** dengan variasi tinggi (280px - 620px)
- **8 event categories**
- Variable heights untuk organic masonry layout

## State Management

### States:
- `photos`: Photo[] - List semua foto
- `filterEvent`: string - Active event filter ("all" default)
- `searchQuery`: string - Search input value
- `hoveredPhoto`: string | null - Currently hovered photo ID
- `isMounted`: boolean - Client-side render check

### Filtering Logic:
1. Filter by event ID (jika bukan "all")
2. Filter by search query (nama foto atau event name)
3. Case-insensitive search

## Responsive Design

### Breakpoints:
- **Mobile** (<640px): 1 column, simplified nav
- **SM** (640px): 2 columns
- **MD** (768px): 3 columns, show nav links
- **LG** (1024px): 4 columns
- **XL** (1280px): 5 columns

### Mobile Optimizations:
- Hidden "Log in" button pada small screens
- Horizontal scroll untuk filter tabs
- Logo text hidden <sm
- Responsive text sizes
- Touch-friendly button sizes

## Visual Effects

### Transitions:
- Card shadow: hover effect
- Image scale: 1.0 → 1.05 on parent hover
- Overlay opacity: 0 → 100 on hover
- Button scale: 1.0 → 1.1 on hover
- Filter button: smooth background change

### Animations:
- All transitions: 300ms duration
- Smooth opacity changes
- Scale transforms
- Background color transitions

## Performance Optimizations

### Image Loading:
- `loading="lazy"` untuk lazy load
- Variable aspect ratios
- Optimized preview URLs

### Client-Side Rendering:
- `isMounted` check untuk prevent hydration errors
- Conditional rendering

## Color Scheme

### Primary Colors:
- **Primary**: Default theme primary
- **Emerald**: Emerald-600 untuk heading
- **Slate**: Slate-50, 100, 200, 600, 900

### Gradients:
- Hero: `from-slate-50 to-background`
- Footer: `from-slate-50 to-background` (reversed)
- Overlay: `from-black/70 via-black/20 to-transparent`

## Typography

### Headings:
- H1: text-4xl md:text-6xl (Get your next)
- H2: text-3xl md:text-5xl (photo collection idea)
- H3: text-3xl (Footer CTA)

### Body Text:
- Description: text-lg
- Event name: text-sm
- Photographer: text-xs
- Price: text-sm font-semibold

## User Interactions

### Click Actions:
- Photo card → View detail (future)
- Bookmark button → Save to bookmarks
- Download button → Download photo
- Add to cart → Add to shopping cart
- Filter button → Change filter
- Search input → Filter by query

### Hover Effects:
- Photo card → Show overlay with info
- Action buttons → Scale up
- Filter buttons → Background change

## Empty States

### No Photos Found:
- Search icon (slate-400)
- "No photos found" heading
- Helper text
- Suggestion to adjust filters

## Navigation

### Routes:
- `/` → Redirects to `/home`
- `/home` → Public home page
- `/login` → Login page (future)
- `/signup` → Sign up page (future)
- `/about` → About page (future)
- `/events` → Events page (future)

## File Structure
```
src/
├── app/
│   ├── page.tsx                    # Root redirect to /home
│   └── home/
│       ├── layout.tsx              # Public layout
│       └── page.tsx                # Home page
└── components/
    └── public/
        └── PublicNavbar.tsx        # Public navbar
```

## Technical Stack

### Dependencies:
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- shadcn/ui components:
  - Button
  - Input

### CSS Features:
- CSS Columns (masonry layout)
- Flexbox
- Grid
- Sticky positioning
- Backdrop blur
- Gradients
- Transitions
- Transforms

## Accessibility

### Features:
- Semantic HTML
- Alt text pada images
- Aria-hidden untuk decorative icons
- Keyboard navigation support
- Focus states
- Proper heading hierarchy

## Browser Support

### Modern Browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

### CSS Features Used:
- CSS Columns (masonry)
- Backdrop filter (blur)
- CSS Grid
- Flexbox
- CSS Variables

## Future Enhancements

### Phase 1 (Immediate):
1. Connect to real Supabase data
2. Implement authentication
3. Create login/signup pages
4. Add photo detail modal
5. Implement bookmark functionality
6. Add to cart implementation

### Phase 2 (Short-term):
1. Infinite scroll
2. Advanced search filters
3. Sort options (price, date, popularity)
4. User collections
5. Share functionality
6. Download high-res preview

### Phase 3 (Long-term):
1. AI-powered search
2. Similar photo recommendations
3. Photographer profiles
4. Event pages
5. Featured collections
6. Social features

## Testing Checklist

- [ ] Responsive design (all breakpoints)
- [ ] Search functionality
- [ ] Filter functionality
- [ ] Hover states
- [ ] Image lazy loading
- [ ] Navigation links
- [ ] Button actions (console logs)
- [ ] Empty states
- [ ] Mobile menu
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

## Preview URLs

- **Home Page**: `http://localhost:3000/home`
- **Root**: `http://localhost:3000` (redirects to /home)

## Notes

### Design Inspiration:
- Pinterest masonry grid
- Clean, minimal navigation
- Focus on visual content
- Smooth interactions

### Key Differences from User Pages:
- No sidebar (public access)
- Simpler navigation
- Auth CTAs prominent
- Optimized for discovery
- Social proof elements

### Mock Data Characteristics:
- 16 photos total
- 8 event categories
- Variable heights (280-620px)
- Realistic price ranges (Rp 35k - 75k)
- Picsum photos untuk preview
