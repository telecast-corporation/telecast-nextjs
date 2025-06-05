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
  const prefix = isImage ? 'podcast-cover' : 'podcasts';
  const filename = generateUniqueFilename(originalName, prefix);
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