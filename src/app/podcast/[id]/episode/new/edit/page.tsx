'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from '@mui/material';
import {
  ContentCut as ScissorIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Mic as MicIcon,
  StopCircle as StopRecordIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { convertAudioToWav, convertRecordedAudioToWav, audioBufferToWav } from '@/lib/audio-utils';
import { enqueueSnackbar } from 'notistack';

interface Episode {
  id: string;
  title: string | null;
  description: string | null;
  audioUrl: string;
  isFinal: boolean;
  isPublished: boolean;
  duration: number | null;
  fileSize: number | null;
}

declare global {
  interface Window {
    WaveSurfer: any;
  }
}

export default function NewEpisodeEditPage() {
  const params = useParams();
  const router = useRouter();
  const podcastId = params.id as string;
  const theme = useTheme();
  
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isTrimMode, setIsTrimMode] = useState(false);
  const [isPlayingRegion, setIsPlayingRegion] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const micContainerRef = useRef<HTMLDivElement>(null);
  const recordingsContainerRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    // No need to initialize recording container for MediaRecorder
  }, []);

  useEffect(() => {
    if (audioFile && waveformRef.current && window.WaveSurfer && !wavesurferRef.current) {
      initializeWaveSurfer();
    }
  }, [audioFile]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        
        try {
          // Convert recorded audio to WAV format
          const wavBlob = await convertRecordedAudioToWav(webmBlob);
          const wavFile = new File([wavBlob], 'recording.wav', { type: 'audio/wav' });
          
          const recordedUrl = URL.createObjectURL(wavBlob);
          setRecordedUrl(recordedUrl);
          setAudioFile(wavFile);

          // Load the recorded audio into the main waveform for editing
          if (waveformRef.current) {
            initializeWaveSurfer();
            wavesurferRef.current.loadBlob(wavBlob);
          }
        } catch (error) {
          console.error('Error converting recorded audio to WAV:', error);
          enqueueSnackbar('Error converting recorded audio to WAV format', { variant: 'error' });
          
          // Fallback to original webm blob
          const recordedUrl = URL.createObjectURL(webmBlob);
          setRecordedUrl(recordedUrl);
          setAudioFile(new File([webmBlob], 'recording.webm', { type: 'audio/webm' }));
          
          if (waveformRef.current) {
            initializeWaveSurfer();
            wavesurferRef.current.loadBlob(webmBlob);
          }
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setPaused(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recording) {
      if (paused) {
        mediaRecorderRef.current.resume();
        setPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setPaused(true);
      }
    }
  };

  const initializeWaveSurfer = () => {
    if (!waveformRef.current || !window.WaveSurfer || wavesurferRef.current) return;

    let wavesurfer: any;

    // Check if regions plugin is available
    if (!window.WaveSurfer.regions) {
      console.warn('Regions plugin not available, creating WaveSurfer without regions');
      wavesurfer = window.WaveSurfer.create({
        container: waveformRef.current,
        waveColor: theme.palette.primary.main,
        progressColor: theme.palette.secondary.main,
        barWidth: 3,
        barGap: 2,
        height: 130,
        cursorWidth: 1,
        cursorColor: theme.palette.secondary.main,
        responsive: true,
        normalize: true,
      });
    } else {
      wavesurfer = window.WaveSurfer.create({
        container: waveformRef.current,
        waveColor: theme.palette.primary.main,
        progressColor: theme.palette.secondary.main,
        barWidth: 3,
        barGap: 2,
        height: 130,
        cursorWidth: 1,
        cursorColor: theme.palette.secondary.main,
        responsive: true,
        normalize: true,
        plugins: [
          window.WaveSurfer.regions.create({
            dragSelection: true,
            slop: 10,
          })
        ]
      });
    }

    wavesurferRef.current = wavesurfer;

    wavesurfer.on("ready", () => {
      // Don't show regions by default - only in trim mode
      if (wavesurfer.regions) {
        wavesurfer.regions.clear();
      }
    });

    wavesurfer.on("play", () => {
      setIsPlaying(true);
    });

    wavesurfer.on("pause", () => {
      setIsPlaying(false);
    });

    wavesurfer.on("stop", () => {
      setIsPlaying(false);
    });

    if (audioFile) {
      wavesurfer.loadBlob(audioFile);
    }
  };

  const handleRecordClick = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Convert uploaded file to WAV format
        const wavBlob = await convertAudioToWav(file);
        const wavFile = new File([wavBlob], file.name.replace(/\.[^/.]+$/, '.wav'), { type: 'audio/wav' });
        setAudioFile(wavFile);
        setRecordedUrl(URL.createObjectURL(wavFile));
      } catch (error) {
        console.error('Error converting audio to WAV:', error);
        enqueueSnackbar('Error converting audio file to WAV format', { variant: 'error' });
      }
    }
  };

  const playRegion = () => {
    if (!wavesurferRef.current || !wavesurferRef.current.regions) {
      console.warn('Regions plugin not available');
      return;
    }

    const regions = wavesurferRef.current.regions.list;
    const regionKeys = Object.keys(regions);
    
    if (regionKeys.length === 0) {
      console.error('No regions found');
      return;
    }

    const regionKey = regionKeys[0];
    const region = regions[regionKey];
    
    if (!region) {
      console.error('Region not found');
      return;
    }

    if (isPlayingRegion) {
      wavesurferRef.current.stop();
      setIsPlayingRegion(false);
    } else {
      region.play();
      setIsPlayingRegion(true);
    }
  };

  const trimLeft = () => {
    if (!wavesurferRef.current || !wavesurferRef.current.regions) {
      console.warn('Regions plugin not available');
      return;
    }

    const regions = wavesurferRef.current.regions.list;
    const regionKeys = Object.keys(regions);
    
    if (regionKeys.length === 0) {
      console.error('No regions found');
      return;
    }

    const regionKey = regionKeys[0];
    const region = regions[regionKey];
    
    if (!region) {
      console.error('Region not found');
      return;
    }

    const start = parseFloat(region.start.toFixed(2));
    const end = parseFloat(region.end.toFixed(2));
    const originalBuffer = wavesurferRef.current.backend.buffer;

    if (!originalBuffer) {
      console.error('No audio buffer available');
      return;
    }

    // Calculate the new buffer length (original - selected region)
    const regionDuration = end - start;
    const trimmedDuration = originalBuffer.duration - regionDuration;
    const trimmedBufferLength = Math.floor(trimmedDuration * originalBuffer.sampleRate);
    
    // Ensure we don't exceed bounds
    if (trimmedBufferLength <= 0) {
      console.error('Invalid trimmed buffer length');
      return;
    }

    const trimmedBuffer = wavesurferRef.current.backend.ac.createBuffer(
      originalBuffer.numberOfChannels,
      trimmedBufferLength,
      originalBuffer.sampleRate
    );

    for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
      const originalChanData = originalBuffer.getChannelData(i);
      const trimmedChanData = trimmedBuffer.getChannelData(i);
      
      // Calculate sample positions
      const startSample = Math.floor(start * originalBuffer.sampleRate);
      const endSample = Math.floor(end * originalBuffer.sampleRate);
      
      // Copy audio before the region
      const beforeLength = startSample;
      if (beforeLength > 0) {
        trimmedChanData.set(originalChanData.subarray(0, beforeLength));
      }
      
      // Copy audio after the region
      const afterStart = endSample;
      const afterLength = originalBuffer.length - afterStart;
      const trimmedAfterStart = beforeLength;
      
      if (afterLength > 0 && afterStart < originalBuffer.length) {
        const afterData = originalChanData.subarray(afterStart, afterStart + afterLength);
        if (trimmedAfterStart + afterData.length <= trimmedChanData.length) {
          trimmedChanData.set(afterData, trimmedAfterStart);
        }
      }
    }

    wavesurferRef.current.loadDecodedBuffer(trimmedBuffer);
    
    // Exit trim mode after trimming
    setIsTrimMode(false);
    setIsPlayingRegion(false);
    
    // Clear regions
    if (wavesurferRef.current) {
      wavesurferRef.current.regions.clear();
    }
  };

  const restart = () => {
    if (audioFile && wavesurferRef.current) {
      wavesurferRef.current.loadBlob(audioFile);
    }
  };

  const enterTrimMode = () => {
    setIsTrimMode(true);
    setIsPlayingRegion(false);
    
    if (wavesurferRef.current && wavesurferRef.current.regions) {
      wavesurferRef.current.regions.clear();
      const duration = wavesurferRef.current.getDuration();
      if (duration > 0) {
        wavesurferRef.current.regions.add({
          start: 0,
          end: duration - (duration / 60),
          color: theme.palette.secondary.main + '40',
          drag: true,
          resize: true,
        });
      }
    } else {
      console.warn('Regions plugin not available for trim mode');
    }
  };

  const finalizeAudio = async () => {
    if (!wavesurferRef.current || !podcastId) return;

    setIsFinalizing(true);
    setError(null);

    try {
      const audioBuffer = wavesurferRef.current.backend.buffer;
      if (!audioBuffer) {
        throw new Error('No audio buffer available');
      }

      const audioContext = wavesurferRef.current.backend.ac;
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();

      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert AudioBuffer to WAV format
      const audioBlob = await new Promise<Blob>((resolve) => {
        const wavBuffer = audioBufferToWav(renderedBuffer);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        resolve(blob);
      });

      const formData = new FormData();
      formData.append('audio', audioBlob, 'finalized-audio.wav');

      const response = await fetch(`/api/podcast/internal/${podcastId}/episode`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create episode');
      }

      const newEpisode = await response.json();
      console.log('Episode created successfully:', newEpisode);
      
      if (!newEpisode || !newEpisode.episodeId) {
        console.error('Episode response missing ID:', newEpisode);
        throw new Error('Episode created but no ID returned');
      }
      
      router.push(`/podcast/${podcastId}/episode/${newEpisode.episodeId}/finalize`);
      
    } catch (error) {
      console.error('Error finalizing audio:', error);
      setError(error instanceof Error ? error.message : 'Failed to finalize audio');
    } finally {
      setIsFinalizing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* CDN Scripts */}
      <Script src="https://unpkg.com/wavesurfer.js@2.2.1/dist/wavesurfer.js" />
      <Script src="https://unpkg.com/wavesurfer.js@2.2.1/dist/plugin/wavesurfer.regions.min.js" />
      <Script src="https://unpkg.com/wavesurfer.js@2.2.1/dist/plugin/wavesurfer.microphone.min.js" />

      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Create New Episode
        </Typography>
        
        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Audio Editor
          </Typography>
          
          {!audioFile && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Upload a file or record audio to get started.
            </Typography>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />



          {/* Recording Status */}
          {recording && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'error.main',
                    animation: 'pulse 1s infinite'
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Recording...
                </Typography>
              </Box>
            </Box>
          )}

          {/* Waveform Container */}
          <Box sx={{ 
            background: theme.palette.background.paper, 
            padding: 3, 
            border: 3, 
            borderColor: theme.palette.primary.main,
            borderRadius: 2,
            mb: 3
          }}>
            <div ref={waveformRef} style={{ 
              background: theme.palette.background.paper,
              width: '100%'
            }} />
          </Box>

          {/* Control Buttons */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ mb: 2 }}>
                  {!isTrimMode && !recording && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<MicIcon />}
                        onClick={handleRecordClick}
                        color="primary"
                      >
                        Record
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Audio File
                      </Button>
                      {!isPlaying ? (
                        <Button
                          variant="outlined"
                          startIcon={<PlayIcon />}
                          onClick={() => wavesurferRef.current?.playPause()}
                        >
                          Play
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          startIcon={<StopIcon />}
                          onClick={() => wavesurferRef.current?.stop()}
                        >
                          Stop
                        </Button>
                      )}
                    </>
                  )}

                  {!isTrimMode && recording && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<StopRecordIcon />}
                        onClick={stopRecording}
                        color="error"
                      >
                        Stop Record
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={paused ? <PlayIcon /> : <PauseIcon />}
                        onClick={pauseRecording}
                        color="warning"
                      >
                        {paused ? 'Resume Record' : 'Pause Record'}
                      </Button>
                    </>
                  )}

              {isTrimMode && (
                <Button
                  variant="outlined"
                  startIcon={isPlayingRegion ? <StopIcon /> : <PlayIcon />}
                  onClick={playRegion}
                >
                  {isPlayingRegion ? 'Stop' : 'Play Selected'}
                </Button>
              )}
            </Stack>

            {!recording && (
              <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">


                {isTrimMode && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<StopIcon />}
                      onClick={() => {
                        setIsTrimMode(false);
                        setIsPlayingRegion(false);
                        if (wavesurferRef.current) {
                          wavesurferRef.current.regions.clear();
                        }
                      }}
                      color="primary"
                    >
                      Exit
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<ScissorIcon />}
                      onClick={trimLeft}
                      color="secondary"
                    >
                      Trim
                    </Button>
                  </>
                )}

                {!isTrimMode && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<ScissorIcon />}
                      onClick={enterTrimMode}
                      color="primary"
                    >
                      Trim
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={restart}
                    >
                      Restart
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={finalizeAudio}
                      disabled={isFinalizing}
                      color="success"
                    >
                      {isFinalizing ? 'Creating Episode...' : 'Create Episode'}
                    </Button>
                  </>
                )}
              </Stack>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}


        </Paper>
      </Box>

              <style jsx global>{`
          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }

          .wavesurfer-handle {
            position: fixed;
            height: 130px !important;
            z-index: 15 !important;
            width: 10px !important;
            max-width: 10px !important;
            background: ${theme.palette.secondary.main} !important;
            border-radius: 5px;
          }

          .showtitle, .cursor {
            z-index: 5 !important;
          }
        `}</style>
    </>
  );
} 