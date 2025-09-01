const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBrowserAudio() {
  try {
    console.log('🎵 Testing Browser Audio Playback...\n');

    // Get a few published episodes with different URL types
    const episodes = await prisma.episode.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        audioUrl: true,
        isPublished: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${episodes.length} published episodes to test:\n`);

    for (const episode of episodes) {
      console.log(`📻 Episode: ${episode.title || 'Untitled'}`);
      console.log(`   ID: ${episode.id}`);
      console.log(`   Audio URL: ${episode.audioUrl.substring(0, 100)}...`);
      
      // Determine the correct URL to use (same logic as our fix)
      let audioUrl;
      if (episode.audioUrl.startsWith('http')) {
        audioUrl = episode.audioUrl;
        console.log(`   ✅ Using direct signed URL`);
      } else if (episode.audioUrl.startsWith('/api/audio/')) {
        audioUrl = episode.audioUrl;
        console.log(`   ✅ Using existing proxy URL`);
      } else {
        audioUrl = `/api/audio/${encodeURIComponent(episode.audioUrl)}`;
        console.log(`   ✅ Converting to proxy URL`);
      }

      // Test if the URL is accessible
      try {
        const testUrl = audioUrl.startsWith('http') ? audioUrl : `http://localhost:3000${audioUrl}`;
        const response = await fetch(testUrl, {
          method: 'HEAD'
        });
        
        console.log(`   📡 HTTP Status: ${response.status}`);
        if (response.ok) {
          console.log(`   ✅ URL is accessible`);
          const contentType = response.headers.get('content-type');
          const contentLength = response.headers.get('content-length');
          console.log(`   📊 Content-Type: ${contentType}`);
          console.log(`   📊 Content-Length: ${contentLength} bytes`);
          
          // Test if it's actually an audio file
          if (contentType && contentType.startsWith('audio/')) {
            console.log(`   🎵 Valid audio file detected`);
          } else {
            console.log(`   ⚠️  Not an audio file: ${contentType}`);
          }
        } else {
          console.log(`   ❌ URL is not accessible (${response.status})`);
        }
      } catch (error) {
        console.log(`   ❌ Error testing URL: ${error.message}`);
      }
      
      console.log('');
    }

    console.log('💡 To test in browser:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Navigate to a podcast page');
    console.log('3. Try clicking on published episodes to play audio');
    console.log('4. Check browser console for any errors');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBrowserAudio();
