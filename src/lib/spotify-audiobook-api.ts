
import { SpotifyClient } from './spotify';
import { cache } from 'react';

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
};

export const getAudiobookDetails = cache(async (audiobookId: string) => {
  const spotifyClient = new SpotifyClient();
  const audiobook = await spotifyClient.getAudiobookById(audiobookId);

  if (!audiobook) {
    return null;
  }
  
  const episodes = audiobook.chapters.items.map((chapter) => ({
    id: chapter.id,
    title: chapter.name,
    url: chapter.audio_preview_url,
    duration: formatDuration(chapter.duration_ms),
    publishDate: chapter.release_date,
  }));

  return {
    id: audiobook.id,
    title: audiobook.name,
    author: audiobook.authors.map((a) => a.name).join(', '),
    description: audiobook.description,
    thumbnail: audiobook.images[0]?.url,
    url: episodes.length > 0 ? episodes[0].url : '',
    duration: '',
    narrator: audiobook.narrators.map((n) => n.name).join(', '),
    rating: 0,
    source: 'spotify',
    sourceUrl: audiobook.external_urls.spotify,
    episodes: episodes,
  };
});
