'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const AudiobookPlaybackPage: React.FC = () => {
  const params = useParams();
  const [audiobookId, setAudiobookId] = useState<string | string[] | null>(null);

  useEffect(() => {
    if (params && params.id) {
      setAudiobookId(params.id);
    }
  }, [params]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2em', marginBottom: '15px' }}>
        Audiobook: {audiobookId ? audiobookId : 'Loading...'}
      </h1>
      <p style={{ fontSize: '1.1em', color: '#555' }}>
        Audiobook playback for <strong style={{ color: '#333' }}>{audiobookId ? audiobookId : 'this audiobook'}</strong> will go here.
      </p>
      <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#777' }}>
        This is a placeholder for the actual audio player and controls.
      </p>
    </div>
  );
};

export default AudiobookPlaybackPage;