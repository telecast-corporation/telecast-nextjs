const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAudioUrls() {
  try {
    console.log('🔍 Debugging audio URLs...\n');

    // Get all episodes with their publishing status
    const episodes = await prisma.episode.findMany({
      select: {
        id: true,
        title: true,
        audioUrl: true,
        isPublished: true,
        isFinal: true,
        publishedAt: true,
        podcastId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${episodes.length} episodes:\n`);

    for (const episode of episodes) {
      console.log(`📻 Episode: ${episode.title || 'Untitled'}`);
      console.log(`   ID: ${episode.id}`);
      console.log(`   Published: ${episode.isPublished}`);
      console.log(`   Final: ${episode.isFinal}`);
      console.log(`   Audio URL: ${episode.audioUrl}`);
      console.log(`   Created: ${episode.createdAt}`);
      console.log(`   Updated: ${episode.updatedAt}`);
      console.log(`   Published At: ${episode.publishedAt || 'Not published'}`);
      
      // Test the audio proxy URL
      const proxyUrl = `/api/audio/${encodeURIComponent(episode.audioUrl)}`;
      console.log(`   🔗 Proxy URL: ${proxyUrl}`);
      console.log('');
    }

    // Check if there are any differences between published and unpublished episodes
    const publishedEpisodes = episodes.filter(ep => ep.isPublished);
    const unpublishedEpisodes = episodes.filter(ep => !ep.isPublished);
    
    console.log('\n📊 Summary:');
    console.log(`   Published episodes: ${publishedEpisodes.length}`);
    console.log(`   Unpublished episodes: ${unpublishedEpisodes.length}`);
    
    if (publishedEpisodes.length > 0) {
      console.log('\n📻 Published episodes audio URLs:');
      publishedEpisodes.forEach(ep => {
        console.log(`   - ${ep.title || 'Untitled'}: ${ep.audioUrl}`);
      });
    }
    
    if (unpublishedEpisodes.length > 0) {
      console.log('\n📻 Unpublished episodes audio URLs:');
      unpublishedEpisodes.forEach(ep => {
        console.log(`   - ${ep.title || 'Untitled'}: ${ep.audioUrl}`);
      });
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAudioUrls();
