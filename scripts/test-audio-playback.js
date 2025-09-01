#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAudioPlayback() {
  try {
    console.log('🎵 Testing Audio Playback URLs...\n');

    // Get a few published episodes
    const episodes = await prisma.episode.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        audioUrl: true,
        isPublished: true,
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${episodes.length} published episodes to test:\n`);

    for (const episode of episodes) {
      console.log(`📻 Episode: ${episode.title || 'Untitled'}`);
      console.log(`   ID: ${episode.id}`);
      console.log(`   Audio URL: ${episode.audioUrl}`);
      
      // Test the URL handling logic
      let testUrl;
      if (episode.audioUrl.startsWith('http')) {
        testUrl = episode.audioUrl;
        console.log(`   ✅ Using direct signed URL`);
      } else if (episode.audioUrl.startsWith('/api/audio/')) {
        testUrl = episode.audioUrl;
        console.log(`   ✅ Using existing proxy URL`);
      } else {
        testUrl = `/api/audio/${encodeURIComponent(episode.audioUrl)}`;
        console.log(`   ✅ Converting to proxy URL: ${testUrl}`);
      }

      // Test if the URL is accessible
      try {
        const response = await fetch(`http://localhost:3000${testUrl.startsWith('/') ? testUrl : ''}`, {
          method: 'HEAD'
        });
        
        console.log(`   📡 HTTP Status: ${response.status}`);
        if (response.ok) {
          console.log(`   ✅ URL is accessible`);
          const contentType = response.headers.get('content-type');
          const contentLength = response.headers.get('content-length');
          console.log(`   📊 Content-Type: ${contentType}`);
          console.log(`   📊 Content-Length: ${contentLength} bytes`);
        } else {
          console.log(`   ❌ URL is not accessible (${response.status})`);
        }
      } catch (error) {
        console.log(`   ❌ Error testing URL: ${error.message}`);
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAudioPlayback();
