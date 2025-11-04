/**
 * Check File Sizes in Storage
 * 
 * This script fetches photos from database and checks their actual file sizes
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function checkFileSizes() {
  try {
    console.log('🔍 Checking file sizes in Supabase Storage...\n');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // List all files in originals folder
    const { data: originalsFiles, error: originalsError } = await supabase.storage
      .from('photos')
      .list('originals', {
        limit: 100,
        offset: 0,
      });

    if (originalsError) {
      console.error('Error listing originals:', originalsError);
      return;
    }

    console.log('📁 Files in /originals/:');
    if (originalsFiles && originalsFiles.length > 0) {
      for (const folder of originalsFiles) {
        if (folder.name) {
          const { data: files } = await supabase.storage
            .from('photos')
            .list(`originals/${folder.name}`);

          if (files && files.length > 0) {
            console.log(`\n  Event: ${folder.name}`);
            files.forEach(file => {
              const sizeKB = (file.metadata?.size || 0) / 1024;
              console.log(`    - ${file.name}: ${sizeKB.toFixed(2)} KB`);
            });
          }
        }
      }
    }

    // List all files in previews folder
    const { data: previewsFiles, error: previewsError } = await supabase.storage
      .from('photos')
      .list('previews', {
        limit: 100,
        offset: 0,
      });

    if (previewsError) {
      console.error('Error listing previews:', previewsError);
      return;
    }

    console.log('\n\n📁 Files in /previews/:');
    if (previewsFiles && previewsFiles.length > 0) {
      for (const folder of previewsFiles) {
        if (folder.name) {
          const { data: files } = await supabase.storage
            .from('photos')
            .list(`previews/${folder.name}`);

          if (files && files.length > 0) {
            console.log(`\n  Event: ${folder.name}`);
            files.forEach(file => {
              const sizeKB = (file.metadata?.size || 0) / 1024;
              console.log(`    - ${file.name}: ${sizeKB.toFixed(2)} KB`);
            });
          }
        }
      }
    }

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkFileSizes();
