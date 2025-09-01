#!/usr/bin/env node

const { Storage } = require('@google-cloud/storage');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Diagnosing Google Cloud Settings...\n');

// Check environment variables first
const requiredVars = [
  'GOOGLE_CLOUD_PROJECT_ID',
  'GOOGLE_CLOUD_CLIENT_EMAIL',
  'GOOGLE_CLOUD_PRIVATE_KEY',
  'GOOGLE_CLOUD_PODCAST_BUCKET_NAME',
  'GOOGLE_CLOUD_PROFILE_BUCKET_NAME'
];

console.log('📋 Step 1: Environment Variables Check');
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
  console.log('Fix: Add missing variables to .env.local file');
  process.exit(1);
}

console.log('\n✅ All environment variables are set!');

// Test Google Cloud connection and identify specific issues
async function diagnoseGoogleCloud() {
  try {
    console.log('\n🔐 Step 2: Testing Google Cloud Authentication...');
    
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });

    console.log('✅ Storage client created successfully');

    // Test basic project access
    console.log('\n📁 Step 3: Testing Project Access...');
    try {
      const [buckets] = await storage.getBuckets();
      console.log(`✅ Project access successful - Found ${buckets.length} buckets`);
    } catch (error) {
      console.log('❌ Project access failed');
      if (error.message.includes('API not enabled')) {
        console.log('💡 Fix: Enable Google Cloud Storage API in your project');
        console.log('   Go to: https://console.cloud.google.com/apis/library/storage.googleapis.com');
      } else if (error.message.includes('billing')) {
        console.log('💡 Fix: Enable billing for your Google Cloud project');
        console.log('   Go to: https://console.cloud.google.com/billing');
      } else if (error.message.includes('permission')) {
        console.log('💡 Fix: Check service account permissions');
        console.log('   Ensure service account has "Storage Object Admin" role');
      }
      throw error;
    }

    // Test bucket access
    console.log('\n📦 Step 4: Testing Bucket Access...');
    
    const podcastBucket = storage.bucket(process.env.GOOGLE_CLOUD_PODCAST_BUCKET_NAME);
    const profileBucket = storage.bucket(process.env.GOOGLE_CLOUD_PROFILE_BUCKET_NAME);

    try {
      const [podcastExists] = await podcastBucket.exists();
      console.log(`  📁 Podcast Bucket: ${podcastExists ? '✅ Accessible' : '❌ Not found'}`);
      
      if (!podcastExists) {
        console.log('💡 Fix: Create the podcast bucket or check the bucket name');
        console.log(`   Expected bucket: ${process.env.GOOGLE_CLOUD_PODCAST_BUCKET_NAME}`);
      }
    } catch (error) {
      console.log(`  📁 Podcast Bucket: ❌ Access denied`);
      console.log('💡 Fix: Check bucket permissions and service account roles');
    }

    try {
      const [profileExists] = await profileBucket.exists();
      console.log(`  📁 Profile Bucket: ${profileExists ? '✅ Accessible' : '❌ Not found'}`);
      
      if (!profileExists) {
        console.log('💡 Fix: Create the profile bucket or check the bucket name');
        console.log(`   Expected bucket: ${process.env.GOOGLE_CLOUD_PROFILE_BUCKET_NAME}`);
      }
    } catch (error) {
      console.log(`  📁 Profile Bucket: ❌ Access denied`);
      console.log('💡 Fix: Check bucket permissions and service account roles');
    }

    // Test file operations
    console.log('\n📝 Step 5: Testing File Operations...');
    
    try {
      const testFileName = `diagnostic-test-${Date.now()}.txt`;
      const testFile = podcastBucket.file(testFileName);
      
      // Test upload
      await testFile.save('Diagnostic test content', {
        metadata: { contentType: 'text/plain' },
      });
      console.log('  ✅ File upload successful');

      // Test signed URL generation
      const [signedUrl] = await testFile.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000,
      });
      console.log('  ✅ Signed URL generation successful');

      // Test URL access
      const response = await fetch(signedUrl);
      if (response.ok) {
        console.log('  ✅ Signed URL access successful');
      } else {
        console.log(`  ❌ Signed URL access failed: ${response.status}`);
      }

      // Cleanup
      await testFile.delete();
      console.log('  ✅ Test file cleanup successful');

    } catch (error) {
      console.log('  ❌ File operations failed:', error.message);
      
      if (error.message.includes('permission')) {
        console.log('💡 Fix: Add "Storage Object Admin" role to service account');
      } else if (error.message.includes('not found')) {
        console.log('💡 Fix: Check bucket name and ensure it exists');
      }
    }

    console.log('\n🎉 Diagnosis complete! Check the results above for any issues.');

  } catch (error) {
    console.error('\n❌ Diagnosis failed:', error.message);
    
    // Provide specific guidance based on error type
    if (error.message.includes('invalid_grant')) {
      console.log('\n💡 This is an authentication issue. Possible causes:');
      console.log('  1. Service account key is invalid or expired');
      console.log('  2. Private key format is incorrect');
      console.log('  3. Service account was deleted or disabled');
      console.log('  4. Project was deleted or disabled');
    } else if (error.message.includes('not found')) {
      console.log('\n💡 This is a resource issue. Possible causes:');
      console.log('  1. Project ID is incorrect');
      console.log('  2. Bucket names are wrong');
      console.log('  3. Service account doesn\'t have access to resources');
    } else if (error.message.includes('permission')) {
      console.log('\n💡 This is a permissions issue. Possible causes:');
      console.log('  1. Service account lacks required IAM roles');
      console.log('  2. Bucket permissions are too restrictive');
      console.log('  3. Project permissions are insufficient');
    }
    
    process.exit(1);
  }
}

// Run the diagnosis
diagnoseGoogleCloud();
