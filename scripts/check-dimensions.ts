/**
 * Check Image Dimensions
 * 
 * Downloads and checks actual dimensions of preview vs original images
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function checkImageDimensions() {
  try {
    console.log('🔍 Checking image dimensions...\n');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the first photo's URLs
    const { data: files } = await supabase.storage
      .from('photos')
      .list('originals/e40f693c-856a-4a36-a219-94e3b8dd0148', { limit: 1 });

    if (!files || files.length === 0) {
      console.log('No files found');
      return;
    }

    const fileName = files[0].name;
    
    // Get URLs
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(`originals/e40f693c-856a-4a36-a219-94e3b8dd0148/${fileName}`);

    const { data: { publicUrl: previewUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(`previews/e40f693c-856a-4a36-a219-94e3b8dd0148/${fileName}`);

    console.log('📸 Checking:', fileName);
    console.log('');

    // Download and check original
    console.log('🔎 Original (Full Resolution):');
    const originalResponse = await fetch(originalUrl);
    const originalBuffer = Buffer.from(await originalResponse.arrayBuffer());
    const originalMeta = await sharp(originalBuffer).metadata();
    console.log(`   Dimensions: ${originalMeta.width}x${originalMeta.height}`);
    console.log(`   Size: ${(originalBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`   URL: ${originalUrl}`);
    console.log('');

    // Download and check preview
    console.log('🔎 Preview (25% Resolution):');
    const previewResponse = await fetch(previewUrl);
    const previewBuffer = Buffer.from(await previewResponse.arrayBuffer());
    const previewMeta = await sharp(previewBuffer).metadata();
    console.log(`   Dimensions: ${previewMeta.width}x${previewMeta.height}`);
    console.log(`   Size: ${(previewBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`   URL: ${previewUrl}`);
    console.log('');

    // Calculate reduction
    const widthReduction = ((originalMeta.width! - previewMeta.width!) / originalMeta.width!) * 100;
    const heightReduction = ((originalMeta.height! - previewMeta.height!) / originalMeta.height!) * 100;
    const sizeReduction = ((originalBuffer.length - previewBuffer.length) / originalBuffer.length) * 100;

    console.log('📊 Reduction:');
    console.log(`   Width: ${widthReduction.toFixed(1)}% (${originalMeta.width} → ${previewMeta.width})`);
    console.log(`   Height: ${heightReduction.toFixed(1)}% (${originalMeta.height} → ${previewMeta.height})`);
    console.log(`   File Size: ${sizeReduction.toFixed(1)}%`);
    console.log('');

    if (widthReduction >= 70 && heightReduction >= 70) {
      console.log('✅ Resolution successfully reduced to ~25%!');
    } else {
      console.log('⚠️  Resolution reduction might not be optimal');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkImageDimensions();
