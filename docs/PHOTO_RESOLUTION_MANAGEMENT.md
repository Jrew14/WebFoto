# Photo Resolution Management - Implementation Summary

## Objective
Implement a two-tier photo resolution system where:
- **Preview (25% resolution)**: Shown to all users browsing the shop/gallery
- **Full resolution (100%)**: Only accessible after purchase via secure download

## Implementation Details

### 1. Image Processing Library
**Library**: Sharp v0.34.4
- High-performance image processing for Node.js
- Used for server-side image resizing
- Installed via: `bun add sharp`

### 2. API Endpoint for Resizing
**File**: `src/app/api/photos/resize/route.ts`

**Features**:
- Accepts file upload via FormData
- Configurable quality parameter (default: 25%)
- Maintains aspect ratio
- Outputs JPEG with 80% compression
- Returns resized image as blob

**Usage**:
```javascript
const formData = new FormData();
formData.append('file', originalFile);
formData.append('quality', '25');

const response = await fetch('/api/photos/resize', {
  method: 'POST',
  body: formData,
});
const resizedBlob = await response.blob();
```

### 3. Upload Flow Modification
**File**: `src/app/admin/(dashboard)/upload/page.tsx`

**Process**:
1. Upload original photo to `originals/{eventId}/{filename}`
2. Call resize API to create 25% resolution version
3. Upload preview photo to `previews/{eventId}/{filename}`
4. Store both URLs in database:
   - `previewUrl`: Low-res version (25%)
   - `fullUrl`: Original high-res version (100%)

**Storage Structure**:
```
photos/
├── originals/
│   └── {eventId}/
│       └── {filename}.jpg (100% resolution)
└── previews/
    └── {eventId}/
        └── {filename}.jpg (25% resolution)
```

### 4. Secure Download API
**File**: `src/app/api/photos/download/route.ts`

**Security Features**:
- Requires authentication
- Verifies purchase before allowing download
- Generates signed URLs (1 hour expiry)
- Only accessible to photo owners

**Flow**:
1. User requests download for photoId
2. API verifies user is authenticated
3. API checks if user has purchased the photo
4. API generates signed URL for original file
5. Returns temporary download URL

### 5. Gallery Display
**Files**: 
- `src/app/gallery/page.tsx`
- `src/app/shop/page.tsx`

**Implementation**:
- All users see `previewUrl` (25% resolution)
- Only purchased photos show download button
- Download uses secure API endpoint
- Non-purchased photos only visible as previews

### 6. Database Schema
No changes required - existing schema already supports:
- `previewUrl`: For low-res browsing
- `fullUrl`: For full-res downloads
- `watermarkUrl`: For watermarked versions (optional)

## Security Considerations

1. **Preview Protection**: 
   - Low resolution makes unauthorized use less appealing
   - 25% resolution significantly reduces file size and quality

2. **Original Protection**:
   - Original files stored in separate bucket path
   - Only accessible via signed URLs
   - Signed URLs expire after 1 hour
   - Purchase verification required

3. **Access Control**:
   - Download API checks authentication
   - Purchase verification via database query
   - No direct access to original file paths

## Performance Impact

1. **Upload Time**:
   - Increased due to resize operation
   - ~2-3 seconds per photo (depends on size)
   - Can be optimized with background jobs

2. **Storage**:
   - Each photo requires 2 files
   - Preview ~6-10% of original size
   - Total storage: ~110% of original

3. **Bandwidth**:
   - Preview files much smaller
   - Reduced bandwidth for browsing
   - Original only transferred on purchase

## Testing Checklist

- [x] Install sharp library
- [x] Create resize API endpoint
- [x] Update upload flow to create 2 versions
- [x] Create secure download API
- [x] Update gallery to use preview URLs
- [x] Update download to use secure API
- [ ] Test upload with real photo
- [ ] Verify 2 files created in storage
- [ ] Test preview display in shop
- [ ] Test download after purchase
- [ ] Verify signed URL expiry

## Future Enhancements

1. **Background Processing**:
   - Move resize operation to background job
   - Use queue system for bulk uploads
   - Improve upload UX

2. **Progressive Loading**:
   - Add blur placeholder
   - Implement lazy loading
   - Optimize preview generation

3. **Watermarking**:
   - Add visible watermark to previews
   - Custom photographer branding
   - Remove on purchase

4. **Multiple Resolutions**:
   - Create thumbnail (10%)
   - Create preview (25%)
   - Keep original (100%)
   - Serve appropriate size based on context

5. **CDN Integration**:
   - Serve previews via CDN
   - Cache signed URLs
   - Optimize global delivery

## Notes

- Sharp library only works server-side (Node.js)
- Resize operation must be done via API route
- Consider adding progress indicator for long uploads
- Monitor storage costs with dual-file approach
