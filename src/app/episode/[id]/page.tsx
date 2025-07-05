'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: number;
  publishDate: string;
  audioUrl: string;
  episodeNumber?: number;
  seasonNumber?: number;
  views: number;
  likes: number;
  keywords: string[];
  podcast: {
  id: string;
  title: string;
  author: string;
  description: string;
    imageUrl: string;
    tags: string[];
    category: string;
  };
}

export default function EpisodePage() {
  const params = useParams();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        setLoading(true);
        const episodeId = params.id as string;
        
        // We need to find which podcast contains this episode
        // For now, we'll need to search through podcasts or have a different approach
        // Let me implement a simple search approach
        
        // First, let's try to get all podcasts and find the one with this episode
        const response = await fetch('/api/podcasts');
        if (!response.ok) {
          throw new Error('Failed to fetch podcasts');
        }
        const podcasts = await response.json();
        
        // Find the podcast that contains this episode
        let foundEpisode = null;
        let foundPodcast = null;
        
        for (const podcast of podcasts) {
          const podcastResponse = await fetch(`/api/podcast/${podcast.id}/internal`);
          if (podcastResponse.ok) {
            const podcastData = await podcastResponse.json();
            const episode = podcastData.episodes.find((ep: any) => ep.id === episodeId);
            if (episode) {
              foundEpisode = episode;
              foundPodcast = podcastData;
              break;
            }
          }
        }
        
        if (!foundEpisode || !foundPodcast) {
          throw new Error('Episode not found');
        }
        
    setEpisode({
          ...foundEpisode,
          podcast: {
            id: foundPodcast.id,
            title: foundPodcast.title,
            author: foundPodcast.author,
            description: foundPodcast.description || '',
            imageUrl: foundPodcast.imageUrl,
            tags: foundPodcast.tags || [],
            category: foundPodcast.category,
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load episode');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEpisodeData();
    }
  }, [params.id]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) return <div>Loading...</div>;
  
  if (error || !episode) return <div>Error: {error || 'Episode not found'}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Episode Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start space-x-6">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden">
              <Image
                src={episode.podcast.imageUrl}
                alt={episode.podcast.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <Link
                href={`/podcast/${episode.podcast.id}`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {episode.podcast.title}
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{episode.title}</h1>
              <p className="text-gray-500 mt-2">{episode.podcast.author}</p>
              <p className="text-gray-500 mt-1">
                {new Date(episode.publishDate).toLocaleDateString()} • {formatTime(episode.duration)}
                {episode.episodeNumber && ` • Episode ${episode.episodeNumber}`}
                {episode.seasonNumber && ` • Season ${episode.seasonNumber}`}
              </p>
              <p className="text-gray-600 mt-4">{episode.description}</p>
              
              {/* Episode Stats */}
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <span>👁️ {episode.views} views</span>
                <span>❤️ {episode.likes} likes</span>
              </div>
              
              {/* Tags */}
              {episode.podcast.tags && episode.podcast.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {episode.podcast.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <audio
            ref={audioRef}
            src={episode.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-sm text-gray-500">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-500">{formatTime(duration)}</span>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
              >
                {isPlaying ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"
                />
              </svg>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Playback Speed */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePlaybackRateChange(0.5)}
                className={`px-2 py-1 rounded ${
                  playbackRate === 0.5 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                0.5x
              </button>
              <button
                onClick={() => handlePlaybackRateChange(1)}
                className={`px-2 py-1 rounded ${
                  playbackRate === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => handlePlaybackRateChange(1.5)}
                className={`px-2 py-1 rounded ${
                  playbackRate === 1.5 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                1.5x
              </button>
              <button
                onClick={() => handlePlaybackRateChange(2)}
                className={`px-2 py-1 rounded ${
                  playbackRate === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                2x
              </button>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowComments(!showComments)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments</h2>
            <div className="space-y-4">
              {/* Add comment form and list here */}
              <p className="text-gray-500">Comments coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 