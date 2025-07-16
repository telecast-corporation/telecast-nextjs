import { Storage } from '@google-cloud/storage';

// Initialize Storage client
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

// Get bucket instances
const podcastBucket = storage.bucket(process.env.GOOGLE_CLOUD_PODCAST_BUCKET_NAME || '');
const profileBucket = storage.bucket(process.env.GOOGLE_CLOUD_PROFILE_BUCKET_NAME || '');

// Helper function to generate a unique filename
const generateUniqueFilename = (originalName: string, prefix: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${prefix}/${timestamp}-${randomString}.${extension}`;
};

// Upload file to podcast bucket
export const uploadPodcastFile = async (
  file: Buffer,
  originalName: string,
  contentType: string,
  isImage: boolean = false
): Promise<{ url: string; filename: string }> => {
  let filename: string;
  
  // Check if this is a temp path update (contains 'podcasts/temp/' prefix)
  if (originalName.startsWith('podcasts/temp/')) {
    // Use the provided temp path directly
    filename = originalName;
  } else {
    // Generate a new unique filename
    const prefix = isImage ? 'podcast-cover' : 'podcasts';
    filename = generateUniqueFilename(originalName, prefix);
  }
  
  const fileUpload = podcastBucket.file(filename);

  await fileUpload.save(file, {
    metadata: {
      contentType,
    },
  });

  const [url] = await fileUpload.getSignedUrl({
    action: 'read',
    expires: '03-01-2500', // Long expiration for podcast files
  });

  return { url, filename };
};

// Upload file to temp location in podcast bucket
export const uploadPodcastTempFile = async (
  file: Buffer,
  originalName: string,
  contentType: string
): Promise<{ url: string; filename: string }> => {
  let filename: string;
  
  // Check if this is a temp path update (contains 'podcasts/temp/' prefix)
  if (originalName.startsWith('podcasts/temp/')) {
    // Use the provided temp path directly
    filename = originalName;
    console.log('Overwriting existing temp file:', filename);
  } else {
    // Generate a new unique filename in temp location
    const prefix = 'podcasts/temp';
    filename = generateUniqueFilename(originalName, prefix);
    console.log('Creating new temp file:', filename);
  }
  
  const fileUpload = podcastBucket.file(filename);

  // Check if file exists before overwriting
  const [exists] = await fileUpload.exists();
  console.log(`File ${filename} exists:`, exists);

  await fileUpload.save(file, {
    metadata: {
      contentType,
    },
  });

  // Verify file was saved
  const [savedExists] = await fileUpload.exists();
  console.log(`File ${filename} exists after save:`, savedExists);

  const [url] = await fileUpload.getSignedUrl({
    action: 'read',
    expires: '03-01-2500', // Long expiration for podcast files
  });

  return { url, filename };
};

// Upload file to profile bucket
export const uploadProfileFile = async (
  file: Buffer,
  originalName: string,
  contentType: string
): Promise<{ url: string; filename: string }> => {
  const filename = generateUniqueFilename(originalName, 'profiles');
  const fileUpload = profileBucket.file(filename);

  await fileUpload.save(file, {
    metadata: {
      contentType,
    },
  });

  const [url] = await fileUpload.getSignedUrl({
    action: 'read',
    expires: '03-01-2500', // Long expiration for profile pictures
  });

  return { url, filename };
};

// Delete file from podcast bucket
export const deletePodcastFile = async (filename: string): Promise<void> => {
  await podcastBucket.file(filename).delete();
};

// Delete file from profile bucket
export const deleteProfileFile = async (filename: string): Promise<void> => {
  await profileBucket.file(filename).delete();
};

// Move file from temp to final location
export const moveFile = async (
  sourcePath: string,
  destinationPath: string
): Promise<{ success: boolean; url: string }> => {
  try {
    const sourceFile = podcastBucket.file(sourcePath);
    const destinationFile = podcastBucket.file(destinationPath);

    // Check if source file exists
    const [sourceExists] = await sourceFile.exists();
    if (!sourceExists) {
      console.error('Source file does not exist:', sourcePath);
      return { success: false, url: '' };
    }

    // Copy file to new location
    await sourceFile.copy(destinationFile);
    
    // Delete original file
    await sourceFile.delete();

    // Get signed URL for the new file
    const [url] = await destinationFile.getSignedUrl({
      action: 'read',
      expires: '03-01-2500',
    });

    return { success: true, url };
  } catch (error) {
    console.error('Error moving file:', error);
    return { success: false, url: '' };
  }
};

// Delete file from podcast bucket (generic function)
export const deleteFile = async (filename: string): Promise<void> => {
  await podcastBucket.file(filename).delete();
}; 