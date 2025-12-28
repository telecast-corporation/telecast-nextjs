
import { PrismaClient } from '@prisma/client';
import { SpotifyClient } from '../src/lib/spotify';

const prisma = new PrismaClient();
const spotifyClient = new SpotifyClient();

async function main() {
  // Clear the StreamingContent table
  await prisma.streamingContent.deleteMany({});

  // Fetch audiobooks from Spotify
  const audiobooks: any[] = await spotifyClient.searchShows('popular', 50, 'audiobook');

  // Save the audiobooks to the database
  for (const item of audiobooks) {
    await prisma.streamingContent.create({
      data: {
        id: item.id,
        type: 'audiobook',
        title: item.name,
        description: item.description,
        thumbnail: item.images[0]?.url || '',
        url: item.external_urls.spotify,
        year: '',
        duration: '', // Spotify API does not provide duration for audiobooks
        rating: '', // Spotify API does not provide rating for audiobooks
        source: 'Spotify',
        sourceUrl: item.external_urls.spotify,
        previewVideo: '',
        genres: [],
        status: '',
        language: item.languages[0],
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
