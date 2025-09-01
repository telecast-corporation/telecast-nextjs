#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
require('dotenv').config({ path: '.env.local' });

console.log('🎵 Testing Audio File Upload and Storage...\n');

// Check environment variables
const requiredVars = [
  'GOOGLE_CLOUD_PROJECT_ID',
  'GOOGLE_CLOUD_CLIENT_EMAIL',
  'GOOGLE_CLOUD_PRIVATE_KEY',
  'GOOGLE_CLOUD_PODCAST_BUCKET_NAME'
];

console.log('📋 Environment Variables Check:');
let missingVars = [];
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${varName.includes('KEY') ? '***SET***' : value}`);
  } else {
    console.log(`  ❌ ${varName}: MISSING`);
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log(`\n❌ Missing environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_PODCAST_BUCKET_NAME);

async function testAudioUpload() {
  try {
    console.log('\n🎵 Step 1: Creating test audio file...');
    
    // Create a simple test WAV file (minimal valid WAV header)
    const testWavHeader = Buffer.from([
      // RIFF header
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x00, 0x00, 0x00, // File size - 8 (36 bytes)
      0x57, 0x41, 0x56, 0x45, // "WAVE"
      
      // fmt chunk
      0x66, 0x6D, 0x74, 0x20, // "fmt "
      0x10, 0x00, 0x00, 0x00, // fmt chunk size (16 bytes)
      0x01, 0x00, // Audio format (PCM)
      0x01, 0x00, // Number of channels (1 = mono)
      0x44, 0xAC, 0x00, 0x00, // Sample rate (44100 Hz)
      0x88, 0x58, 0x01, 0x00, // Byte rate
      0x02, 0x00, // Block align
      0x10, 0x00, // Bits per sample (16)
      
      // data chunk
      0x64, 0x61, 0x74, 0x61, // "data"
      0x00, 0x00, 0x00, 0x00  // Data size (0 bytes for silence)
    ]);
    
    const testFileName = `test-audio-${Date.now()}.wav`;
    const testFilePath = path.join(__dirname, testFileName);
    
    // Write test file
    fs.writeFileSync(testFilePath, testWavHeader);
    console.log(`  ✅ Created test WAV file: ${testFileName} (${testWavHeader.length} bytes)`);
    
    // Verify file header
    const fileBuffer = fs.readFileSync(testFilePath);
    const header = fileBuffer.toString('ascii', 0, 12);
    console.log(`  📁 File header: "${header}" (should be "RIFF....WAVE")`);
    
    if (header.startsWith('RIFF') && header.includes('WAVE')) {
      console.log('  ✅ WAV header is valid');
    } else {
      console.log('  ❌ WAV header is invalid');
    }

    console.log('\n🎵 Step 2: Uploading test file to Google Cloud Storage...');
    
    const gcsFileName = `test-uploads/${testFileName}`;
    const file = bucket.file(gcsFileName);
    
    // Upload with proper metadata
    await file.save(testWavHeader, {
      metadata: {
        contentType: 'audio/wav',
        cacheControl: 'public, max-age=31536000',
      },
      resumable: false,
    });
    
    console.log(`  ✅ File uploaded to: ${gcsFileName}`);

    console.log('\n🎵 Step 3: Verifying uploaded file...');
    
    // Get metadata
    const [metadata] = await file.getMetadata();
    console.log('  📁 Uploaded file metadata:', {
      size: metadata.size,
      contentType: metadata.contentType,
      md5Hash: metadata.md5Hash,
      etag: metadata.etag
    });
    
    // Verify file size
    if (parseInt(metadata.size) === testWavHeader.length) {
      console.log('  ✅ File size matches original');
    } else {
      console.log(`  ❌ File size mismatch: ${metadata.size} vs ${testWavHeader.length}`);
    }
    
    // Verify content type
    if (metadata.contentType === 'audio/wav') {
      console.log('  ✅ Content type is correct');
    } else {
      console.log(`  ❌ Content type is wrong: ${metadata.contentType}`);
    }

    console.log('\n🎵 Step 4: Downloading and verifying file integrity...');
    
    // Download the file
    const [downloadedBuffer] = await file.download();
    console.log(`  📁 Downloaded file size: ${downloadedBuffer.length} bytes`);
    
    // Compare with original
    if (downloadedBuffer.equals(testWavHeader)) {
      console.log('  ✅ File integrity verified - no corruption');
    } else {
      console.log('  ❌ File corruption detected!');
      
      // Show first few bytes for comparison
      console.log('  📁 Original first 16 bytes:', testWavHeader.slice(0, 16));
      console.log('  📁 Downloaded first 16 bytes:', downloadedBuffer.slice(0, 16));
    }
    
    // Verify WAV header in downloaded file
    const downloadedHeader = downloadedBuffer.toString('ascii', 0, 12);
    console.log(`  📁 Downloaded file header: "${downloadedHeader}"`);
    
    if (downloadedHeader.startsWith('RIFF') && downloadedHeader.includes('WAVE')) {
      console.log('  ✅ Downloaded WAV header is valid');
    } else {
      console.log('  ❌ Downloaded WAV header is invalid');
    }

    console.log('\n🎵 Step 5: Testing signed URL access...');
    
    // Generate signed URL
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    
    console.log('  📁 Generated signed URL');
    
    // Test URL access
    const response = await fetch(signedUrl);
    if (response.ok) {
      const urlBuffer = await response.arrayBuffer();
      console.log(`  📁 URL access successful, downloaded: ${urlBuffer.byteLength} bytes`);
      
      // Compare with original
      const urlBufferNode = Buffer.from(urlBuffer);
      if (urlBufferNode.equals(testWavHeader)) {
        console.log('  ✅ URL download integrity verified');
      } else {
        console.log('  ❌ URL download corruption detected');
      }
    } else {
      console.log(`  ❌ URL access failed: ${response.status} ${response.statusText}`);
    }

    console.log('\n🎵 Step 6: Cleanup...');
    
    // Delete test file from GCS
    await file.delete();
    console.log('  ✅ Deleted test file from GCS');
    
    // Delete local test file
    fs.unlinkSync(testFilePath);
    console.log('  ✅ Deleted local test file');

    console.log('\n🎉 Audio upload test completed successfully!');
    console.log('\n💡 If all tests passed, your audio storage is working correctly.');
    console.log('💡 If any tests failed, check the specific error messages above.');

  } catch (error) {
    console.error('\n❌ Audio upload test failed:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('\n💡 Permission issue detected. Check:');
      console.log('  1. Service account has Storage Object Admin role');
      console.log('  2. Bucket permissions are correct');
    } else if (error.message.includes('not found')) {
      console.log('\n💡 Resource not found. Check:');
      console.log('  1. Bucket name is correct');
      console.log('  2. Project ID is correct');
    }
    
    process.exit(1);
  }
}

// Run the test
testAudioUpload();
