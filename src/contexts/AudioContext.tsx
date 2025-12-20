'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useMemo, useCallback } from 'react';

export interface Episode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  publishDate: string;
  imageUrl?: string;
}

export interface Podcast {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string;
  url: string;
}

interface AudioContextType {
  currentPodcast: Podcast | null;
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  currentAudio: HTMLAudioElement | null;
  play: (podcast: Podcast, episode: Episode) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeUpdateRef = useRef(0);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize audio element only once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
    }

    const audio = audioRef.current;

    // Throttle time updates to prevent excessive re-renders
    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      // Only update state every 500ms to reduce re-renders
      if (Math.abs(currentTime - lastTimeUpdateRef.current) > 0.5) {
        lastTimeUpdateRef.current = currentTime;
        setCurrentTime(currentTime);
      }
    };

    const handleDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Memoize functions to prevent unnecessary re-renders
  const play = useCallback(async (podcast: Podcast, episode: Episode) => {
    if (!audioRef.current) return;

    try {
      // Stop current playback
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setDuration(0);

      // Get fresh signed URL for the audio file
      const response = await fetch(`/api/podcast/internal/${podcast.id}/episode/${episode.id}/audio-url`);
      
      if (!response.ok) {
        throw new Error(`Failed to get audio URL: ${response.statusText}`);
      }

      const data = await response.json();
      const signedAudioUrl = data.audioUrl;

      // Set new source and start playback
      audioRef.current.src = signedAudioUrl;
      audioRef.current.load(); // Ensure the new source is loaded
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
        setCurrentPodcast(podcast);
        setCurrentEpisode(episode);
          })
          .catch(error => {
            console.error('Error playing audio:', error);
          });
      }
    } catch (error) {
      console.error('Error in play function:', error);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Error resuming audio:', error);
      });
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      lastTimeUpdateRef.current = time;
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolumeState(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRateState(rate);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentPodcast,
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMuted,
    currentAudio: audioRef.current,
    play,
    pause,
    resume,
    seek,
    setVolume,
    setPlaybackRate,
    toggleMute,
  }), [
    currentPodcast,
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMuted,
    play,
    pause,
    resume,
    seek,
    setVolume,
    setPlaybackRate,
    toggleMute,
  ]);

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
