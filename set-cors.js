// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

// The ID of your GCS bucket
const bucketName = 'telecast-corp-podcast-bucket';

// Allowed origins
const origins = ['http://localhost:3000', 'https://telecast.ca'];

// Methods to allow (include OPTIONS for preflight)
const methods = ['GET', 'PUT', 'HEAD', 'OPTIONS'];

// Response headers to expose
const responseHeaders = ['Content-Type', 'x-goog-resumable', 'Range'];

// Max age for preflight cache
const maxAgeSeconds = 3600;

async function configureBucketCors() {
  try {
    await storage.bucket(bucketName).setCorsConfiguration([
      {
        maxAgeSeconds,
        method: methods,
        origin: origins,
        responseHeader: responseHeaders,
      },
    ]);

    console.log(`✅ Bucket ${bucketName} CORS updated`);
    console.log(`   Methods: ${methods.join(', ')}; Origins: ${origins.join(', ')}`);
  } catch (error) {
    console.error('❌ Error setting CORS configuration:', error);
    process.exit(1);
  }
}

configureBucketCors(); 
 