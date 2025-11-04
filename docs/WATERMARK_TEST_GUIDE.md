# 🧪 Watermark Feature - Quick Test Guide

## Test Scenario 1: Upload Watermark

### Steps:
1. **Login Admin**
   ```
   URL: http://localhost:3001/admin/login
   Email: admin@piksel-jual.com (atau admin yang lain)
   Password: [your password]
   ```

2. **Buka Profile Page**
   ```
   URL: http://localhost:3001/admin/profile
   Scroll ke section "Pengaturan Watermark"
   ```

3. **Upload Watermark PNG**
   ```
   - Click area upload atau drag & drop
   - Pilih file PNG (max 2MB)
   - Ideal: 500x200px dengan transparent background
   - Preview akan muncul
   ```

4. **Save Profile**
   ```
   - Click "Simpan Perubahan"
   - Wait for success message
   - ✅ Watermark URL saved to database
   ```

### Expected Result:
- ✅ Preview watermark muncul
- ✅ Alert "Berhasil - Profil berhasil disimpan!"
- ✅ Watermark URL tersimpan di `profiles.watermark_url`

---

## Test Scenario 2: Upload Foto dengan Watermark

### Steps:
1. **Buka Upload Page**
   ```
   URL: http://localhost:3001/admin/upload
   ```

2. **Pilih Event**
   ```
   - Select event dari dropdown
   - Atau create event baru jika belum ada
   ```

3. **Upload Foto**
   ```
   - Click "Pilih Foto" atau drag & drop
   - Select foto JPG/PNG
   - Set harga per foto
   - Click "Upload Semua Foto"
   ```

4. **Monitor Console Log**
   ```
   - Open browser DevTools (F12)
   - Check Console tab
   - Look for:
     💧 Watermark URL: [URL atau "No watermark set"]
     💧 Using watermark: [URL]
   ```

### Expected Result:
- ✅ Console log shows watermark URL
- ✅ Foto ter-upload (original + preview)
- ✅ Preview punya watermark
- ✅ Upload success

---

## Test Scenario 3: Verify Watermark di Preview

### Steps:
1. **Logout Admin**
   ```
   Click sidebar → Logout
   ```

2. **Buka Shop/Gallery Page**
   ```
   URL: http://localhost:3001/shop
   atau: http://localhost:3001/gallery
   ```

3. **Check Preview Foto**
   ```
   - Foto yang baru di-upload harus tampil
   - Preview resolution: 25% dari original
   - Watermark PNG di center foto
   ```

4. **Verify Watermark**
   ```
   - Watermark harus visible
   - Transparent background jika PNG punya alpha channel
   - Size: ~20% dari lebar preview
   - Position: Center
   ```

### Expected Result:
- ✅ Preview foto tampil dengan watermark
- ✅ Watermark tidak blocking subject utama
- ✅ Watermark sharp dan clear
- ✅ Original foto tetap tanpa watermark (setelah purchase)

---

## Test Scenario 4: Fallback Behavior

### Steps:
1. **Test tanpa Watermark**
   ```
   - Buka profile, remove watermark (X button)
   - Save profile
   - Upload foto baru
   - ✅ Text watermark "PREVIEW - LOW RES" muncul
   ```

2. **Test dengan Invalid Watermark URL**
   ```
   - Manually set invalid URL di database (optional)
   - Upload foto
   - ✅ Fallback ke text watermark
   ```

---

## Check Database

### Query untuk Check Watermark URL:
```sql
SELECT 
  id,
  email,
  full_name,
  role,
  watermark_url
FROM profiles
WHERE role = 'admin';
```

### Expected:
```
id         | email                    | watermark_url
-----------|--------------------------|------------------
[uuid]     | admin@piksel-jual.com   | https://[supabase]/photos/watermarks/[uuid]-watermark-[timestamp].png
```

---

## Check Storage

### Supabase Storage Structure:
```
photos/
├── watermarks/
│   └── [uuid]-watermark-1234567890.png  ← Admin watermark
├── avatars/
│   └── [uuid]-1234567890.jpg            ← Admin avatar
├── originals/
│   └── [event-id]/
│       └── 1234567890-abc123.jpg        ← Full resolution
└── previews/
    └── [event-id]/
        └── preview_1234567890-abc123.jpg ← With watermark
```

---

## Troubleshooting

### Issue: Watermark tidak muncul
**Check:**
1. Apakah watermark PNG sudah di-upload?
   → Check profile page
2. Apakah watermark_url ada di database?
   → Run query above
3. Apakah console log show watermark URL?
   → Check DevTools console
4. Apakah fetch watermark API sukses?
   → Check Network tab

### Issue: Upload foto gagal
**Check:**
1. Console error message
2. Network tab → resize API response
3. Storage permissions
4. Watermark URL accessible (public)

### Issue: Watermark terlalu besar/kecil
**Solution:**
- Watermark auto-resize to 20% of preview width
- Adjust di resize API (line: `const watermarkWidth = Math.round(newWidth * 0.2)`)
- Change 0.2 to desired percentage (e.g., 0.15 = 15%)

---

## Success Checklist

- [ ] Admin can upload watermark PNG
- [ ] Watermark saved to database
- [ ] Watermark URL retrieved in upload page
- [ ] Resize API receives watermark URL
- [ ] Watermark composited to preview
- [ ] Preview shows watermark in shop/gallery
- [ ] Original foto stays without watermark
- [ ] Text watermark fallback works
- [ ] Console logs show watermark usage

---

**Server:** http://localhost:3001
**Test User:** admin@piksel-jual.com
**Ready to test!** 🚀
