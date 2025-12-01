/**
 * Simple test script using native Node.js modules
 * Usage: node test-request-simple.js
 */

const http = require('http');
const https = require('https');
const FormData = require('form-data');

/**
 * Downloads an image from a URL
 */
function downloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(imageUrl);
    const client = url.protocol === 'https:' ? https : http;
    
    client.get(imageUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${res.statusCode} ${res.statusMessage}`));
        return;
      }
      
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
    }).on('error', reject);
  });
}

async function sendTestRequest() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const url = new URL(`${backendUrl}/api/image-flow`);
  
  console.log(`\n🧪 Testing image-flow API at: ${url.href}\n`);

  // Use real test image URL (default) or dummy image
  const testImageUrl = process.env.TEST_IMAGE_URL || 
    'https://v3b.fal.media/files/b/elephant/t1zfDJ4uVg8kev04Im67P.png';
  
  let imageBuffer;
  let imageFilename = 'test-image.png';
  let imageContentType = 'image/png';
  
  try {
    console.log(`📥 Downloading test image from: ${testImageUrl}`);
    imageBuffer = await downloadImage(testImageUrl);
    console.log(`✅ Downloaded image (${(imageBuffer.length / 1024).toFixed(2)} KB)\n`);
    
    // Determine content type from URL or buffer
    if (testImageUrl.includes('.png')) {
      imageContentType = 'image/png';
      imageFilename = 'test-image.png';
    } else if (testImageUrl.includes('.jpg') || testImageUrl.includes('.jpeg')) {
      imageContentType = 'image/jpeg';
      imageFilename = 'test-image.jpg';
    } else if (testImageUrl.includes('.webp')) {
      imageContentType = 'image/webp';
      imageFilename = 'test-image.webp';
    }
  } catch (error) {
    console.log(`⚠️  Failed to download image: ${error.message}`);
    console.log('   Falling back to dummy image...\n');
    // Fallback to minimal PNG
    imageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
      0xae, 0x42, 0x60, 0x82,
    ]);
  }

  const formData = new FormData();
  formData.append('baseImage', imageBuffer, {
    filename: imageFilename,
    contentType: imageContentType,
  });
  formData.append('userPrompt', 'Make the image more vibrant and colorful');
  formData.append('aspectRatio', '1:1');

  console.log('📤 Sending request...');
  console.log(`   - baseImage: ${imageFilename} (${imageContentType})`);
  console.log('   - userPrompt: "Make the image more vibrant and colorful"');
  console.log('   - aspectRatio: "1:1"\n');

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: formData.getHeaders(),
  };

  const startTime = Date.now();
  const req = http.request(options, (res) => {
    const duration = Date.now() - startTime;
    let responseData = '';

    console.log(`📥 Response received (${duration}ms)`);
    console.log(`   Status: ${res.statusCode} ${res.statusMessage}\n`);

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const parsed = JSON.parse(responseData);
          console.log('✅ Request successful!');
          console.log('\nResponse data:');
          console.log(JSON.stringify(parsed, null, 2));
          
          if (parsed.prompt1) {
            console.log(`\n📝 Prompt 1 (reconstructed): ${parsed.prompt1.substring(0, 100)}...`);
          }
          if (parsed.prompt2) {
            console.log(`📝 Prompt 2 (edited): ${parsed.prompt2.substring(0, 100)}...`);
          }
          if (parsed.outputImage) {
            console.log(`🖼️  Output image: ${parsed.outputImage}`);
          }
          console.log('\n✅ Test completed successfully!\n');
        } catch (e) {
          console.log('⚠️  Response is not valid JSON:');
          console.log(responseData);
        }
      } else {
        console.log('❌ Request failed');
        console.log('Response body:', responseData);
        
        // Try to parse error message
        try {
          const error = JSON.parse(responseData);
          if (error.message) {
            console.log('\n💡 Error details:', error.message);
            
            if (error.message.includes('reconstruction')) {
              console.log('\n📋 Troubleshooting tips:');
              console.log('   1. ✅ Check the backend terminal/logs for detailed OpenAI response');
              console.log('      Look for: "GPT prompt reconstruction response structure"');
              console.log('   2. Verify OPENAI_API_KEY is valid and has credits');
              console.log('   3. The image was downloaded successfully, so format should be OK');
              console.log('   4. OpenAI might be returning an unexpected response format');
              console.log('\n💡 To see what OpenAI returned, check the backend server logs');
              console.log('   The logs will show the full response structure from OpenAI');
            }
          }
        } catch (e) {
          // Not JSON, already printed
        }
        
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure the backend server is running:');
      console.error('   cd backend && npm run dev');
    }
    
    process.exit(1);
  });

  formData.pipe(req);
}

sendTestRequest();

