/**
 * Test Services
 * 
 * Quick test to verify all services are working
 */

import { eventService, photoService, authService } from '@/services';

async function testServices() {
  console.log('🧪 Testing services...\n');

  try {
    // Test 1: Event Service
    console.log('1. Testing Event Service');
    const events = await eventService.getEvents();
    console.log(`   ✅ Found ${events.length} events\n`);

    // Test 2: Photo Service
    console.log('2. Testing Photo Service');
    const photos = await photoService.getPhotos();
    console.log(`   ✅ Found ${photos.length} photos\n`);

    // Test 3: Auth Service
    console.log('3. Testing Auth Service');
    const { user } = await authService.getCurrentUser();
    if (user) {
      console.log(`   ✅ Current user: ${user.email} (${user.role})\n`);
    } else {
      console.log(`   ℹ️  No authenticated user\n`);
    }

    console.log('✅ All services working correctly!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Service test failed:', error);
    process.exit(1);
  }
}

testServices();
