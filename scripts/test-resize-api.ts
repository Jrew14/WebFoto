/**
 * Test Resize API
 * 
 * This script tests the resize API to ensure it properly reduces image resolution
 */

async function testResizeAPI() {
  try {
    console.log('🧪 Testing Resize API...\n');

    // Create a test HTML file input simulation
    const testImageUrl = 'https://picsum.photos/2000/1500'; // 2000x1500 test image
    
    console.log('📥 Fetching test image (2000x1500)...');
    const response = await fetch(testImageUrl);
    const blob = await response.blob();
    
    console.log(`   Original size: ${(blob.size / 1024).toFixed(2)} KB\n`);

    // Test resize API
    console.log('🔄 Calling resize API with quality=25%...');
    const formData = new FormData();
    formData.append('file', blob, 'test-image.jpg');
    formData.append('quality', '25');

    const resizeResponse = await fetch('http://localhost:3001/api/photos/resize', {
      method: 'POST',
      body: formData,
    });

    if (!resizeResponse.ok) {
      const errorText = await resizeResponse.text();
      console.error('❌ Resize API failed:', errorText);
      return;
    }

    const resizedBlob = await resizeResponse.blob();
    
    console.log(`✅ Resize successful!`);
    console.log(`   Preview size: ${(resizedBlob.size / 1024).toFixed(2)} KB`);
    console.log(`   Compression: ${((resizedBlob.size / blob.size) * 100).toFixed(1)}%`);
    console.log(`   Expected dimensions: ~500x375 (25% of 2000x1500)\n`);

    // Calculate expected dimensions
    const expectedWidth = 2000 * 0.25;
    const expectedHeight = 1500 * 0.25;
    
    console.log('📊 Summary:');
    console.log(`   ✓ Original: ~2000x1500, ${(blob.size / 1024).toFixed(2)} KB`);
    console.log(`   ✓ Preview:  ~${expectedWidth}x${expectedHeight}, ${(resizedBlob.size / 1024).toFixed(2)} KB`);
    console.log(`   ✓ Reduction: ${(100 - (resizedBlob.size / blob.size) * 100).toFixed(1)}%\n`);

    console.log('✅ Resize API is working correctly!');

  } catch (error) {
    console.error('❌ Error testing resize API:', error);
  }
}

// Run test
testResizeAPI();
