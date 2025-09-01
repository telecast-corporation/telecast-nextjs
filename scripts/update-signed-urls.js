// Script to update all existing signed URLs in the database to use original GCS URLs
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function convertSignedUrlToOriginalUrl(signedUrl) {
  if (!signedUrl) return null;
  
  // Check if it's already an original URL
  if (signedUrl.startsWith('https://storage.googleapis.com/') && !signedUrl.includes('?')) {
    return signedUrl;
  }
  
  // Extract the bucket name and file path from signed URL
  const url = new URL(signedUrl);
  const pathname = url.pathname;
  
  // Remove leading slash and extract bucket and file path
  const pathParts = pathname.substring(1).split('/');
  if (pathParts.length < 2) {
    console.log('❌ Invalid signed URL format:', signedUrl);
    return null;
  }
  
  const bucketName = pathParts[0];
  const filePath = pathParts.slice(1).join('/');
  
  // Construct original URL
  const originalUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
  
  return originalUrl;
}

async function updateSignedUrls() {
  try {
    console.log('🔄 Starting signed URL conversion...');
    
    // Update podcast cover images
    console.log('\n📸 Updating podcast cover images...');
    const podcasts = await prisma.podcast.findMany({
      where: {
        coverImage: {
          not: null
        }
      }
    });
    
    let podcastUpdates = 0;
    for (const podcast of podcasts) {
      const originalUrl = convertSignedUrlToOriginalUrl(podcast.coverImage);
      if (originalUrl && originalUrl !== podcast.coverImage) {
        await prisma.podcast.update({
          where: { id: podcast.id },
          data: { coverImage: originalUrl }
        });
        console.log(`  ✅ Updated podcast ${podcast.title}: ${originalUrl}`);
        podcastUpdates++;
      }
    }
    console.log(`📸 Updated ${podcastUpdates} podcast cover images`);
    
    // Update episode audio URLs
    console.log('\n🎵 Updating episode audio URLs...');
    const episodes = await prisma.episode.findMany({
      where: {
        audioUrl: {
          not: null,
          not: ''
        }
      }
    });
    
    let episodeUpdates = 0;
    for (const episode of episodes) {
      const originalUrl = convertSignedUrlToOriginalUrl(episode.audioUrl);
      if (originalUrl && originalUrl !== episode.audioUrl) {
        await prisma.episode.update({
          where: { id: episode.id },
          data: { audioUrl: originalUrl }
        });
        console.log(`  ✅ Updated episode ${episode.title}: ${originalUrl}`);
        episodeUpdates++;
      }
    }
    console.log(`🎵 Updated ${episodeUpdates} episode audio URLs`);
    
    // Update user profile images
    console.log('\n👤 Updating user profile images...');
    const users = await prisma.user.findMany({
      where: {
        image: {
          not: null
        }
      }
    });
    
    let userUpdates = 0;
    for (const user of users) {
      const originalUrl = convertSignedUrlToOriginalUrl(user.image);
      if (originalUrl && originalUrl !== user.image) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: originalUrl }
        });
        console.log(`  ✅ Updated user ${user.email}: ${originalUrl}`);
        userUpdates++;
      }
    }
    console.log(`👤 Updated ${userUpdates} user profile images`);
    
    console.log('\n🎉 Signed URL conversion completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Podcast cover images: ${podcastUpdates}`);
    console.log(`   - Episode audio URLs: ${episodeUpdates}`);
    console.log(`   - User profile images: ${userUpdates}`);
    console.log(`   - Total updates: ${podcastUpdates + episodeUpdates + userUpdates}`);
    
  } catch (error) {
    console.error('❌ Error updating signed URLs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if database URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('✅ Database connection configured');
updateSignedUrls();
