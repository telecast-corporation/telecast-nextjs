import { useState, useEffect } from 'react';

interface UseAudioUrlResult {
  audioUrl: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useAudioUrl = (
  podcastId: string,
  episodeId: string,
  filePath: string | null
): UseAudioUrlResult => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAudioUrl = async () => {
    if (!filePath) {
      setError('No audio file path available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/podcast/internal/${podcastId}/episode/${episodeId}/audio-url`);
      
      if (!response.ok) {
        throw new Error(`Failed to get audio URL: ${response.statusText}`);
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
    } catch (err) {
      console.error('Error fetching audio URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to get audio URL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filePath) {
      fetchAudioUrl();
    }
  }, [podcastId, episodeId, filePath]);

  const refresh = () => {
    fetchAudioUrl();
  };

  return { audioUrl, loading, error, refresh };
}; 