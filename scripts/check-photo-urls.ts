/**
 * Check Photo URLs Script
 * 
 * This script checks if there are photos with identical previewUrl and fullUrl
 * (indicates old photos that need to be regenerated with low-res previews)
 */

import { db } from '../src/db';
import { photos } from '../src/db/schema';
import { sql } from 'drizzle-orm';

async function checkPhotoUrls() {
  try {
    console.log('🔍 Checking photo URLs in database...\n');

    // Get all photos
    const allPhotos = await db.select().from(photos);
    
    console.log(`📊 Total photos in database: ${allPhotos.length}\n`);

    if (allPhotos.length === 0) {
      console.log('✅ No photos found in database.');
      return;
    }

    // Check for photos with identical URLs
    const photosWithSameUrls = allPhotos.filter(
      photo => photo.previewUrl === photo.fullUrl
    );

    console.log(`📸 Photos with identical previewUrl and fullUrl: ${photosWithSameUrls.length}`);

    if (photosWithSameUrls.length > 0) {
      console.log('\n⚠️  These photos need to be re-uploaded with the new dual-resolution system:\n');
      
      photosWithSameUrls.forEach((photo, index) => {
        console.log(`${index + 1}. Photo: ${photo.name}`);
        console.log(`   ID: ${photo.id}`);
        console.log(`   URL: ${photo.previewUrl}`);
        console.log(`   Event ID: ${photo.eventId}`);
        console.log('');
      });

      console.log('💡 Recommendation:');
      console.log('   - Delete these old photos from admin dashboard');
      console.log('   - Re-upload them to generate low-res previews');
      console.log('   - Or run a migration script to create preview versions');
    } else {
      console.log('\n✅ All photos have separate preview and full URLs!');
    }

    // Check storage paths
    console.log('\n📁 Checking storage paths...\n');
    
    const photosInOriginals = allPhotos.filter(
      photo => photo.fullUrl.includes('/originals/')
    );
    
    const photosInPreviews = allPhotos.filter(
      photo => photo.previewUrl.includes('/previews/')
    );

    console.log(`   Photos with fullUrl in /originals/: ${photosInOriginals.length}`);
    console.log(`   Photos with previewUrl in /previews/: ${photosInPreviews.length}`);

    if (photosInOriginals.length !== allPhotos.length) {
      console.log('\n⚠️  Some photos are not using the new /originals/ path');
    }

    if (photosInPreviews.length !== allPhotos.length) {
      console.log('⚠️  Some photos are not using the new /previews/ path');
    }

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error checking photo URLs:', error);
    throw error;
  }
}

// Run the script
checkPhotoUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
