#!/usr/bin/env node

const { Storage } = require('@google-cloud/storage');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Google Cloud Configuration...\n');

// Check environment variables
const requiredVars = [
  'GOOGLE_CLOUD_PROJECT_ID',
  'GOOGLE_CLOUD_CLIENT_EMAIL',
  'GOOGLE_CLOUD_PRIVATE_KEY',
  'GOOGLE_CLOUD_PODCAST_BUCKET_NAME',
  'GOOGLE_CLOUD_PROFILE_BUCKET_NAME'
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
  console.log(`\n❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.log('Please check the GOOGLE_CLOUD_SETUP.md file for setup instructions.');
  process.exit(1);
}

console.log('\n✅ All environment variables are set!');

// Test Google Cloud Storage connection
async function testGoogleCloud() {
  try {
    console.log('\n🔐 Testing Google Cloud Storage Authentication...');
    
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });

    console.log('✅ Storage client created successfully');

    // Test bucket access
    console.log('\n📦 Testing Bucket Access...');
    
    const podcastBucket = storage.bucket(process.env.GOOGLE_CLOUD_PODCAST_BUCKET_NAME);
    const profileBucket = storage.bucket(process.env.GOOGLE_CLOUD_PROFILE_BUCKET_NAME);

    // Check if buckets exist and are accessible
    const [podcastExists] = await podcastBucket.exists();
    const [profileExists] = await profileBucket.exists();

    console.log(`  📁 Podcast Bucket (${process.env.GOOGLE_CLOUD_PODCAST_BUCKET_NAME}): ${podcastExists ? '✅ Accessible' : '❌ Not accessible'}`);
    console.log(`  📁 Profile Bucket (${process.env.GOOGLE_CLOUD_PROFILE_BUCKET_NAME}): ${profileExists ? '✅ Accessible' : '❌ Not accessible'}`);

    if (!podcastExists || !profileExists) {
      console.log('\n❌ One or more buckets are not accessible. Please check:');
      console.log('  1. Bucket names are correct');
      console.log('  2. Service account has proper permissions');
      console.log('  3. Buckets exist in the specified project');
      process.exit(1);
    }

    // Test file operations
    console.log('\n📝 Testing File Operations...');
    
    const testFileName = `test-${Date.now()}.txt`;
    const testFile = podcastBucket.file(testFileName);
    
    // Upload test file
    await testFile.save('Hello from Telecast!', {
      metadata: {
        contentType: 'text/plain',
      },
    });
    console.log('  ✅ File upload successful');

    // Generate signed URL
    const [signedUrl] = await testFile.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    console.log('  ✅ Signed URL generation successful');

    // Test URL access
    const response = await fetch(signedUrl);
    if (response.ok) {
      console.log('  ✅ Signed URL access successful');
    } else {
      console.log('  ❌ Signed URL access failed');
    }

    // Clean up test file
    await testFile.delete();
    console.log('  ✅ Test file cleanup successful');

    console.log('\n🎉 All Google Cloud tests passed! Your configuration is working correctly.');
    console.log('\nYou should now be able to play audio files in your application.');

  } catch (error) {
    console.error('\n❌ Google Cloud test failed:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n💡 This usually means:');
      console.log('  1. The service account key is invalid or expired');
      console.log('  2. The private key format is incorrect');
      console.log('  3. The service account doesn\'t have proper permissions');
    } else if (error.message.includes('not found')) {
      console.log('\n💡 This usually means:');
      console.log('  1. The project ID is incorrect');
      console.log('  2. The bucket names are wrong');
      console.log('  3. The service account doesn\'t have access to the buckets');
    }
    
    process.exit(1);
  }
}

// Run the test
testGoogleCloud();
