/**
 * Test script to send a dummy request to the image-flow API
 * Usage: node test-request.js
 */

const FormData = require('form-data');
// node-fetch v3 is ESM-only, use dynamic import or built-in fetch (Node 18+)
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
  // Fallback: try to use node-fetch
  try {
    fetch = require('node-fetch');
  } catch {
    console.error('❌ fetch is not available. Please use Node.js 18+ or install node-fetch');
    process.exit(1);
  }
}

// Create a minimal valid PNG image (1x1 pixel, transparent)
// PNG signature + minimal IHDR + IEND chunks
const createDummyPng = () => {
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  ]);
  
  // Minimal valid PNG (1x1 transparent pixel)
  const pngData = Buffer.from([
    // IHDR chunk
    0x00, 0x00, 0x00, 0x0d, // Length: 13
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x01, // Width: 1
    0x00, 0x00, 0x00, 0x01, // Height: 1
    0x08, // Bit depth: 8
    0x06, // Color type: RGBA
    0x00, // Compression: deflate
    0x00, // Filter: none
    0x00, // Interlace: none
    0x9a, 0x9c, 0x18, 0x00, // CRC
    // IDAT chunk (minimal)
    0x00, 0x00, 0x00, 0x0c, // Length: 12
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x78, 0x9c, 0x63, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // Compressed data
    0x00, 0x00, 0x00, 0x00, // CRC
    // IEND chunk
    0x00, 0x00, 0x00, 0x00, // Length: 0
    0x49, 0x45, 0x4e, 0x44, // "IEND"
    0xae, 0x42, 0x60, 0x82, // CRC
  ]);
  
  return Buffer.concat([pngHeader, pngData]);
};

async function testImageFlow() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const endpoint = `${backendUrl}/api/image-flow`;

  console.log(`\n🧪 Testing image-flow API at: ${endpoint}\n`);

  try {
    // Create dummy PNG image
    const dummyImage = createDummyPng();
    console.log('✅ Created dummy PNG image (1x1 pixel)');

    // Create form data
    const formData = new FormData();
    formData.append('baseImage', dummyImage, {
      filename: 'test-image.png',
      contentType: 'image/png',
    });
    formData.append('userPrompt', 'Make the image more vibrant and colorful');
    formData.append('aspectRatio', '1:1');

    console.log('📤 Sending request...');
    console.log('   - baseImage: test-image.png (PNG)');
    console.log('   - userPrompt: "Make the image more vibrant and colorful"');
    console.log('   - aspectRatio: "1:1"\n');

    const startTime = Date.now();
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    const duration = Date.now() - startTime;
    const responseText = await response.text();

    console.log(`📥 Response received (${duration}ms)`);
    console.log(`   Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      console.log('❌ Request failed');
      console.log('Response body:', responseText);
      process.exit(1);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('✅ Request successful!');
      console.log('\nResponse data:');
      console.log(JSON.stringify(responseData, null, 2));
      
      if (responseData.prompt1) {
        console.log(`\n📝 Prompt 1 (reconstructed): ${responseData.prompt1.substring(0, 100)}...`);
      }
      if (responseData.prompt2) {
        console.log(`📝 Prompt 2 (edited): ${responseData.prompt2.substring(0, 100)}...`);
      }
      if (responseData.outputImage) {
        console.log(`🖼️  Output image: ${responseData.outputImage}`);
      }
    } catch (parseError) {
      console.log('⚠️  Response is not valid JSON:');
      console.log(responseText);
    }

    console.log('\n✅ Test completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure the backend server is running:');
      console.error('   cd backend && npm run dev');
    }
    
    process.exit(1);
  }
}

// Run the test
testImageFlow();

