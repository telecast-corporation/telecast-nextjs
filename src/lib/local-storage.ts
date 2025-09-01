import { writeFile, mkdir, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');
const PODCASTS_DIR = join(UPLOADS_DIR, 'podcasts');

// Ensure directories exist
async function ensureDirectories() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
  if (!existsSync(PODCASTS_DIR)) {
    await mkdir(PODCASTS_DIR, { recursive: true });
  }
}

// Generate a unique filename
const generateUniqueFilename = (originalName: string, prefix: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${prefix}/${timestamp}-${randomString}.${extension}`;
};

// Upload file to local storage
export const uploadPodcastFile = async (
  file: Buffer,
  originalName: string,
  contentType: string,
  isImage: boolean = false
): Promise<{ url: string; filename: string }> => {
  await ensureDirectories();
  
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
  
  const filePath = join(process.cwd(), 'public', filename);
  
  // Ensure the directory exists
  const dir = filePath.substring(0, filePath.lastIndexOf('/'));
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  
  // Write the file
  await writeFile(filePath, file);
  
  // Return the public URL
  const url = `/${filename}`;
  
  return { url, filename };
};

// Upload file to temp location
export const uploadPodcastTempFile = async (
  file: Buffer,
  originalName: string,
  contentType: string
): Promise<{ url: string; filename: string }> => {
  await ensureDirectories();
  
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
  
  const filePath = join(process.cwd(), 'public', filename);
  
  // Ensure the directory exists
  const dir = filePath.substring(0, filePath.lastIndexOf('/'));
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  
  // Check if file exists before overwriting
  const exists = existsSync(filePath);
  console.log(`File ${filename} exists:`, exists);
  
  // Write the file
  await writeFile(filePath, file);
  
  // Verify file was saved
  const savedExists = existsSync(filePath);
  console.log(`File ${filename} exists after save:`, savedExists);
  
  // Return the public URL
  const url = `/${filename}`;
  
  return { url, filename };
};

// Delete file from local storage
export const deletePodcastFile = async (filename: string): Promise<void> => {
  const filePath = join(process.cwd(), 'public', filename);
  if (existsSync(filePath)) {
    await unlink(filePath);
  }
};

// Move file from temp to final location
export const moveFile = async (
  sourcePath: string,
  destinationPath: string
): Promise<{ success: boolean; url: string }> => {
  try {
    const sourceFilePath = join(process.cwd(), 'public', sourcePath);
    const destFilePath = join(process.cwd(), 'public', destinationPath);
    
    // Check if source file exists
    if (!existsSync(sourceFilePath)) {
      console.error('Source file does not exist:', sourcePath);
      return { success: false, url: '' };
    }
    
    // Ensure destination directory exists
    const destDir = destFilePath.substring(0, destFilePath.lastIndexOf('/'));
    if (!existsSync(destDir)) {
      await mkdir(destDir, { recursive: true });
    }
    
    // Read source file and write to destination
    const fileBuffer = await readFile(sourceFilePath);
    await writeFile(destFilePath, fileBuffer);
    
    // Delete original file
    await unlink(sourceFilePath);
    
    // Return the public URL
    const url = `/${destinationPath}`;
    
    return { success: true, url };
  } catch (error) {
    console.error('Error moving file:', error);
    return { success: false, url: '' };
  }
};

// Get file read URL (for local storage, this is just the public URL)
export const getFileReadSignedUrl = async (
  path: string,
  ttlMs: number = 60 * 60 * 1000
): Promise<string> => {
  console.log('getFileReadSignedUrl called with path:', path);
  
  const filePath = join(process.cwd(), 'public', path);
  
  // Check if file exists
  const exists = existsSync(filePath);
  console.log('File exists:', exists, 'for path:', path);
  
  if (!exists) {
    throw new Error(`File does not exist: ${path}`);
  }
  
  // For local storage, return the public URL
  const url = `/${path}`;
  console.log('Generated local URL:', url);
  return url;
};

// Delete file (generic function)
export const deleteFile = async (filename: string): Promise<void> => {
  await deletePodcastFile(filename);
};
