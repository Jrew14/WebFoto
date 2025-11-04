# ✅ Watermark Repeating Pattern - Update

## Perubahan dari Previous Version

### Before (Single Center):
- Watermark 1x di center
- Size: 20% dari lebar
- Blend: Normal

### After (Repeating Pattern):
- Watermark repeating covering seluruh gambar
- Rotasi: -45 derajat (miring)
- Size: 15% dari lebar (lebih kecil untuk pattern)
- Blend mode: **Multiply** (transparent overlay)
- Spacing: 30% antara watermark

## Implementasi Detail

### Resize API Update
**File**: `src/app/api/photos/resize/route.ts`

```typescript
// 1. Resize watermark to 15% of image width
const watermarkWidth = Math.round(newWidth * 0.15);

// 2. Rotate watermark -45 degrees
const rotatedWatermark = await sharp(watermarkBuffer)
  .resize(watermarkWidth, watermarkHeight)
  .rotate(-45, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

// 3. Calculate grid (rows x cols)
const spacingX = rotatedWidth + Math.round(rotatedWidth * 0.3); // +30% spacing
const spacingY = rotatedHeight + Math.round(rotatedHeight * 0.3);
const cols = Math.ceil(newWidth / spacingX) + 1;
const rows = Math.ceil(newHeight / spacingY) + 1;

// 4. Create composite array
const composites = [];
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    composites.push({
      input: rotatedWatermark,
      left: col * spacingX - Math.round(spacingX / 2),
      top: row * spacingY - Math.round(spacingY / 2),
      blend: 'multiply', // Multiply blend mode
    });
  }
}

// 5. Composite all watermarks
resizedBuffer = await sharp(imageBuffer)
  .composite(composites)
  .toBuffer();
```

## Visual Pattern

```
Before (Single):
┌──────────────────┐
│                  │
│                  │
│    [WATERMARK]   │  ← 1x center
│                  │
│                  │
└──────────────────┘


After (Repeating):
┌──────────────────┐
│ ╱W╱  ╱W╱  ╱W╱   │
│                  │
│  ╱W╱  ╱W╱  ╱W╱  │  ← Multiple instances
│                  │  ← Rotated -45°
│ ╱W╱  ╱W╱  ╱W╱   │  ← Multiply blend
└──────────────────┘
```

## Parameters

| Parameter | Value | Keterangan |
|-----------|-------|------------|
| **Watermark Size** | 15% dari lebar preview | Lebih kecil untuk repeating |
| **Rotation** | -45° | Diagonal pattern |
| **Spacing X** | 130% dari watermark width | 30% gap horizontal |
| **Spacing Y** | 130% dari watermark height | 30% gap vertical |
| **Blend Mode** | Multiply | Transparent overlay |
| **Background** | Transparent (alpha: 0) | Untuk rotasi |

## Multiply Blend Mode

Multiply blend mode membuat watermark:
- ✅ Lebih subtle dan tidak mengganggu
- ✅ Dark colors pada watermark akan lebih gelap di foto
- ✅ Light colors akan lebih transparan
- ✅ Cocok untuk logo/text watermark
- ✅ Tidak blocking subject foto

## Grid Calculation

```typescript
// Example untuk preview 756x1008px dengan watermark 113px (after rotate ~160px):
spacingX = 160 + (160 * 0.3) = 208px
spacingY = 160 + (160 * 0.3) = 208px

cols = ceil(756 / 208) + 1 = 5 columns
rows = ceil(1008 / 208) + 1 = 6 rows

Total watermarks = 5 × 6 = 30 instances
```

## Advantages

✅ **Full Coverage**: Watermark menutupi seluruh area foto
✅ **Harder to Remove**: Lebih susah di-crop atau dihapus
✅ **Professional Look**: Pattern yang konsisten
✅ **Subtle**: Multiply blend tidak terlalu mengganggu
✅ **Scalable**: Auto-adjust untuk berbagai ukuran foto
✅ **Rotated**: -45° pattern lebih aesthetic

## Testing

### Test Repeating Pattern:
```bash
1. Upload watermark PNG di profile
2. Upload foto di /admin/upload
3. Check preview:
   - Watermark harus repeating
   - Rotasi -45 derajat (diagonal)
   - Menutupi seluruh area
   - Blend multiply (semi-transparent)
4. Console log akan show: "Watermark applied: 6x5 = 30 instances"
```

### Adjust Parameters (Optional):
```typescript
// Adjust watermark size (current: 15%)
const watermarkWidth = Math.round(newWidth * 0.10); // 10% = smaller

// Adjust rotation angle (current: -45°)
.rotate(-30, { background: { r: 0, g: 0, b: 0, alpha: 0 } }) // -30° = less steep

// Adjust spacing (current: 30%)
const spacingX = rotatedWidth + Math.round(rotatedWidth * 0.5); // 50% = more gap

// Change blend mode
blend: 'overlay' // or 'screen', 'lighten', 'darken'
```

## Supported Blend Modes

| Mode | Effect |
|------|--------|
| `multiply` | ✅ **Current** - Darkens, transparent overlay |
| `overlay` | Combination of multiply and screen |
| `screen` | Lightens, opposite of multiply |
| `lighten` | Only lighter pixels show |
| `darken` | Only darker pixels show |

## Example Output

**Input Photo**: 3024x4032px (12MP)
**Preview**: 756x1008px (25%)
**Watermark Original**: 500x200px
**Watermark Resized**: 113x45px (15% of 756px)
**Watermark Rotated**: ~160x160px (after -45° rotation)
**Grid**: 5 cols × 6 rows = **30 watermarks**
**Spacing**: 208px horizontal, 208px vertical
**Blend**: Multiply
**File Size**: 226KB (88% reduction)

---

**Status:** ✅ Implemented
**Pattern:** Repeating Grid
**Rotation:** -45° Diagonal
**Blend:** Multiply Mode
**Coverage:** Full Image
