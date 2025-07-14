// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

// The ID of your GCS bucket
const bucketName = 'telecast-corp-podcast-bucket';

// The origin for this CORS config to allow requests from
const origin = 'http://localhost:3000';

// The response header to share across origins
const responseHeader = 'Content-Type';

// The maximum amount of time the browser can make requests before it must
// repeat preflighted requests
const maxAgeSeconds = 3600;

// The name of the method
const method = 'GET';

async function configureBucketCors() {
  try {
    await storage.bucket(bucketName).setCorsConfiguration([
      {
        maxAgeSeconds,
        method: [method],
        origin: [origin],
        responseHeader: [responseHeader],
      },
    ]);

    console.log(`✅ Bucket ${bucketName} was updated with a CORS config`);
    console.log(`   to allow ${method} requests from ${origin}`);
    console.log(`   sharing ${responseHeader} responses across origins`);
  } catch (error) {
    console.error('❌ Error setting CORS configuration:', error);
  }
}

configureBucketCors(); 
 