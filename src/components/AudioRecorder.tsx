'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Link,
  Slider,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  InfoOutlined as InfoOutlinedIcon, 
  Download as DownloadIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  VolumeUp as VolumeIcon,
  ContentCut as CutIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

export default function AudioRecorder() {
  const theme = useTheme();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [isTrimMode, setIsTrimMode] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isPlayingSelection, setIsPlayingSelection] = useState(false);
  const [isSettingStart, setIsSettingStart] = useState(true);
  const [selectionComplete, setSelectionComplete] = useState(false);

  const wavesurferRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const isTrimModeRef = useRef(false);
  const isSettingStartRef = useRef(true);
  const selectedRegionRef = useRef(null);

  // Gradient backgrounds for light/dark mode
  const gradientBg = theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #232526 0%, #414345 100%)'
    : 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)';
  const glassBg = theme.palette.mode === 'dark'
    ? 'rgba(40, 44, 52, 0.85)'
    : 'rgba(255, 255, 255, 0.85)';
  const glassBorder = theme.palette.mode === 'dark'
    ? '1.5px solid rgba(255,255,255,0.08)'
    : '1.5px solid rgba(200,200,200,0.18)';

  useEffect(() => {
    // Load session data when component mounts
    const editSession = sessionStorage.getItem('editSession');
    if (editSession) {
      const data = JSON.parse(editSession);
      setSessionData(data);
      console.log('Edit session data:', data);
      
      if (data.tempUrl) {
        setAudioUrl(data.tempUrl);
        console.log('Attempting to load audio from tempUrl:', data.tempUrl);
        loadAudio(data.tempUrl);
      } else {
        console.log('No tempUrl found in sessionData');
      }
    } else {
      console.log('No editSession found in sessionStorage');
    }
  }, []);

  // Initialize wavesurfer when audioUrl is available and component is mounted
  useEffect(() => {
    if (!audioUrl || typeof window === 'undefined') return;

    const initializeWaveSurfer = async () => {
      try {
        const WaveSurfer = require('wavesurfer.js');
        
        // Wait for the container to exist and DOM to be ready
        setTimeout(() => {
          const container = document.getElementById('waveform');
          if (!container) {
            console.error('Waveform container not found');
            setError('Failed to initialize audio editor');
            setIsLoading(false);
            return;
          }
          
          if (wavesurferRef.current) {
            wavesurferRef.current.destroy();
          }
          
          try {
            wavesurferRef.current = WaveSurfer.create({
              container: '#waveform',
              waveColor: theme.palette.primary.main,
              progressColor: theme.palette.secondary.main,
              cursorColor: theme.palette.text.primary,
              barWidth: 2,
              barRadius: 3,
              cursorWidth: 1,
              height: 100,
              barGap: 1,
              responsive: true,
            });

            wavesurferRef.current.load(audioUrl);
            
            wavesurferRef.current.on('ready', () => {
              setIsLoading(false);
              setDuration(wavesurferRef.current.getDuration());
              setTrimEnd(wavesurferRef.current.getDuration());
              console.log('WaveSurfer ready, duration:', wavesurferRef.current.getDuration());
            });

            wavesurferRef.current.on('audioprocess', (currentTime) => {
              setCurrentTime(currentTime);
            });

            wavesurferRef.current.on('play', () => {
              setIsPlaying(true);
            });

            wavesurferRef.current.on('pause', () => {
              setIsPlaying(false);
            });

            wavesurferRef.current.on('finish', () => {
              setIsPlaying(false);
              setIsPlayingSelection(false);
              setCurrentTime(0);
            });

            wavesurferRef.current.on('error', (error) => {
              console.error('WaveSurfer error:', error);
              setError('Failed to load waveform');
              setIsLoading(false);
            });

            // Handle waveform clicks for trim selection
            wavesurferRef.current.on('click', (position) => {
              console.log('Waveform clicked at position:', position, 'isTrimMode:', isTrimModeRef.current, 'isSettingStart:', isSettingStartRef.current, 'selectionComplete:', selectionComplete);
              if (isTrimModeRef.current && !selectionComplete) {
                const time = position * wavesurferRef.current.getDuration();
                console.log('Calculated time:', time, 'current selectedRegion:', selectedRegionRef.current);
                
                if (isSettingStartRef.current) {
                  // First click - set start point
                  const newSelection = { start: time, end: time };
                  setTrimStart(time);
                  setSelectedRegion(newSelection);
                  selectedRegionRef.current = newSelection;
                  setIsSettingStart(false);
                  isSettingStartRef.current = false;
                  console.log('Set start point:', time, 'new selection:', newSelection);
                } else {
                  // Second click - set end point
                  const currentRegion = selectedRegionRef.current;
                  if (!currentRegion) {
                    console.error('No current region found, resetting to start');
                    const newSelection = { start: time, end: time };
                    setTrimStart(time);
                    setSelectedRegion(newSelection);
                    selectedRegionRef.current = newSelection;
                    setIsSettingStart(false);
                    isSettingStartRef.current = false;
                    return;
                  }
                  
                  const startTime = currentRegion.start;
                  const endTime = Math.max(startTime, time);
                  const newSelection = { start: startTime, end: endTime };
                  setTrimStart(startTime);
                  setTrimEnd(endTime);
                  setSelectedRegion(newSelection);
                  selectedRegionRef.current = newSelection;
                  setSelectionComplete(true);
                  console.log('Set end point:', endTime, 'final selection:', newSelection, 'selection locked');
                }
              } else if (isTrimModeRef.current && selectionComplete) {
                console.log('Selection complete - click "Clear Selection" to start over or "Apply Trim" to proceed');
              } else {
                console.log('Trim mode is OFF - click "Enter Trim Mode" first');
              }
            });
          } catch (err) {
            console.error('Error creating WaveSurfer:', err);
            setError('Failed to initialize audio editor');
            setIsLoading(false);
          }
        }, 100); // Small delay to ensure DOM is ready
      } catch (err) {
        console.error('Error loading WaveSurfer:', err);
        setError('Failed to load audio editor');
        setIsLoading(false);
      }
    };

    initializeWaveSurfer();
  }, [audioUrl, theme.palette.primary.main, theme.palette.secondary.main, theme.palette.text.primary]);

  const loadAudio = async (url) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching audio from URL:', url);

      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);

      // Fetch audio data
      const response = await fetch(url);
      console.log('Audio fetch response:', response);
      const arrayBuffer = await response.arrayBuffer();
      const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      setAudioBuffer(decodedBuffer);
      console.log('Audio decoded successfully');
      
      // Set up audio event listeners for wavesurfer
      // The wavesurfer instance will handle all audio playback
      
    } catch (err) {
      console.error('Error loading audio:', err);
      setError('Failed to load audio file');
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!wavesurferRef.current) return;

    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      wavesurferRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopAudio = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.stop();
    }
    setIsPlaying(false);
    setIsPlayingSelection(false);
    setCurrentTime(0);
  };

  const handleVolumeChange = (event, newValue) => {
    const newVolume = newValue / 100;
    setVolume(newVolume);
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  const handleTrimStart = (event, newValue) => {
    setTrimStart(newValue);
  };

  const handleTrimEnd = (event, newValue) => {
    setTrimEnd(newValue);
  };

  const applyTrim = async () => {
    if (!audioBuffer || !audioContextRef.current || !selectedRegion) return;
    try {
      // Use the selected region from waveform clicks, not slider values
      const startTime = selectedRegion.start;
      const endTime = selectedRegion.end;
      
      // Calculate sample frames for trim
      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const numChannels = audioBuffer.numberOfChannels;
      
      // Create new buffer that excludes the selected region
      // We'll keep: 0 to startSample, and endSample to end
      const beforeLength = startSample;
      const afterLength = audioBuffer.length - endSample;
      const totalLength = beforeLength + afterLength;
      
      if (totalLength <= 0) return;

      const trimmedBuffer = audioContextRef.current.createBuffer(
        numChannels,
        totalLength,
        sampleRate
      );
      
      for (let channel = 0; channel < numChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const newChannelData = new Float32Array(totalLength);
        
        // Copy the part before the selection
        if (beforeLength > 0) {
          newChannelData.set(channelData.slice(0, startSample), 0);
        }
        
        // Copy the part after the selection
        if (afterLength > 0) {
          newChannelData.set(channelData.slice(endSample), beforeLength);
        }
        
        trimmedBuffer.copyToChannel(newChannelData, channel, 0);
      }

      // Export trimmed buffer to WAV Blob
      const wavBlob = bufferToWavBlob(trimmedBuffer);
      const trimmedUrl = URL.createObjectURL(wavBlob);

      // Update audio element and waveform
      setAudioUrl(trimmedUrl);
      setAudioBuffer(trimmedBuffer);
      if (wavesurferRef.current) {
        wavesurferRef.current.load(trimmedUrl);
      }
      setTrimStart(0);
      setTrimEnd(trimmedBuffer.duration);
      setDuration(trimmedBuffer.duration);
      setCurrentTime(0);
      setIsPlaying(false);
      
      // Clear the selection after trimming
      setSelectedRegion(null);
      selectedRegionRef.current = null;
      setSelectionComplete(false);
      setIsSettingStart(true);
      isSettingStartRef.current = true;
      
      console.log('Removed selected region:', startTime, 'to', endTime, 'kept rest of audio');
    } catch (err) {
      console.error('Error applying trim:', err);
      setError('Failed to trim audio');
    }
  };

  // Helper: Convert AudioBuffer to WAV Blob
  function bufferToWavBlob(buffer) {
    // Adapted from https://github.com/Jam3/audiobuffer-to-wav
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const numFrames = buffer.length;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataLength = numFrames * blockAlign;
    const bufferLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);
    let offset = 0;
    function writeString(s) {
      for (let i = 0; i < s.length; i++) {
        view.setUint8(offset++, s.charCodeAt(i));
      }
    }
    writeString('RIFF');
    view.setUint32(offset, 36 + dataLength, true); offset += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, format, true); offset += 2;
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, byteRate, true); offset += 4;
    view.setUint16(offset, blockAlign, true); offset += 2;
    view.setUint16(offset, bitDepth, true); offset += 2;
    writeString('data');
    view.setUint32(offset, dataLength, true); offset += 4;
    // Write interleaved PCM samples
    for (let i = 0; i < numFrames; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        let sample = buffer.getChannelData(channel)[i];
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveAndUpload = async () => {
    setIsSaving(true);
    
    try {
      // Get the current edited audio as a blob
      if (!audioBuffer) {
        throw new Error('No audio buffer available');
      }
      
      // Convert current audio buffer to WAV blob
      const wavBlob = bufferToWavBlob(audioBuffer);
      
      // Get session data for the temp file path
      const editSession = sessionStorage.getItem('editSession');
      if (!editSession) {
        throw new Error('No edit session found');
      }
      
      const sessionData = JSON.parse(editSession);
      
      // Upload the edited audio to the temp path
      const formData = new FormData();
      formData.append('file', wavBlob, sessionData.tempFileName || 'edited-audio.wav');
      formData.append('tempPath', sessionData.tempPath || '');
      
      const response = await fetch('/api/podcast/upload/temp', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload edited audio');
      }
      
      const result = await response.json();
      console.log('Edited audio uploaded to temp path:', result.tempUrl);
      
      // Store the updated reference data for the broadcast page
      sessionStorage.setItem("broadcastReference", JSON.stringify({
        referenceId: sessionData.referenceId,
        tempFileName: sessionData.tempFileName,
        tempUrl: result.tempUrl,
        tempPath: sessionData.tempPath,
        podcastId: sessionData.podcastId,
        originalFileName: sessionData.originalFileName,
      }));

      // Clear the edit session
      sessionStorage.removeItem('editSession');
      
      setIsSaving(false);
      router.push('/broadcast');
      
    } catch (error) {
      console.error('Error saving audio:', error);
      setIsSaving(false);
      setError('Failed to save edited audio');
    }
  };

  const toggleTrimMode = () => {
    const newTrimMode = !isTrimMode;
    setIsTrimMode(newTrimMode);
    isTrimModeRef.current = newTrimMode;
    
    if (newTrimMode) {
      // Enter trim mode - clear any existing selection and play cursor
      setSelectedRegion(null);
      selectedRegionRef.current = null;
      setTrimStart(0);
      setTrimEnd(duration);
      setIsSettingStart(true);
      isSettingStartRef.current = true;
      setSelectionComplete(false);
      
      // Stop any playing audio and clear cursor
      if (wavesurferRef.current) {
        wavesurferRef.current.pause();
        wavesurferRef.current.setTime(0);
        // Change colors to unplayed state for trim mode
        wavesurferRef.current.setOptions({
          waveColor: theme.palette.primary.main,
          progressColor: theme.palette.primary.main, // Same as wave color = no progress shown
          cursorColor: theme.palette.text.primary,
        });
      }
    } else {
      // Exit trim mode - restore original colors
      if (wavesurferRef.current) {
        wavesurferRef.current.setOptions({
          waveColor: theme.palette.primary.main,
          progressColor: theme.palette.secondary.main,
          cursorColor: theme.palette.text.primary,
        });
      }
      clearSelection();
      setIsSettingStart(true);
      isSettingStartRef.current = true;
    }
  };

  const clearSelection = () => {
    setSelectedRegion(null);
    selectedRegionRef.current = null;
    setTrimStart(0);
    setTrimEnd(duration);
    setIsSettingStart(true);
    isSettingStartRef.current = true;
    setSelectionComplete(false);
    
    // Reset cursor position
    if (wavesurferRef.current) {
      wavesurferRef.current.setTime(0);
    }
  };

  const playSelectedRegion = () => {
    if (!wavesurferRef.current || !selectedRegion) return;
    
    setIsPlayingSelection(true);
    wavesurferRef.current.play(selectedRegion.start, selectedRegion.end);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: gradientBg,
        p: { xs: 1, sm: 3 },
        transition: 'background 0.5s',
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: { xs: 1, sm: 2 },
          maxWidth: 1600,
          width: '100%',
          borderRadius: 2,
          background: glassBg,
          border: glassBorder,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          transition: 'background 0.5s, border 0.5s',
          minHeight: { xs: '85vh', sm: '90vh' },
        }}
      >
        {/* Audio File Info Banner */}
        {sessionData && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  if (sessionData.tempUrl) {
                    const link = document.createElement('a');
                    link.href = sessionData.tempUrl;
                    link.download = sessionData.originalFileName || 'audio-file';
                    link.click();
                  }
                }}
              >
                Download Audio
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>Audio file loaded:</strong> {sessionData.originalFileName || 'Unknown file'}
              {sessionData.tempUrl && (
                <span> • <Link href={sessionData.tempUrl} target="_blank" rel="noopener">View file</Link></span>
              )}
            </Typography>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Info Banner and Clear Editor Button on the same line */}
        <Box sx={{
          mb: 2,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.10)' : 'rgba(33,150,243,0.10)',
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            borderRadius: 1,
            px: 2.5,
            py: 1.2,
            boxShadow: '0 1px 6px rgba(33,150,243,0.04)',
            flex: 1,
            mr: 2,
            minWidth: 0,
          }}>
            <InfoOutlinedIcon color="primary" sx={{ mr: 1.5, fontSize: 24, flexShrink: 0 }} />
            <Typography variant="body1" color="text.secondary" sx={{ fontFamily: 'inherit', fontWeight: 500, fontSize: 16, lineHeight: 1.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Edit your audio with our professional editor. Trim, adjust volume, and preview your changes.
            </Typography>
          </Box>
        </Box>

        {/* Top Next Step: Broadcast Step Bar */}
        <Box sx={{
          mb: 3,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.03)' : 'transparent',
          px: { xs: 0, sm: 1 },
          py: { xs: 0.5, sm: 1 },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: theme.palette.primary.main,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 20,
              mr: 1,
            }}>
              3
            </Box>
            <Typography variant="subtitle1" color="text.primary" sx={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 18 }}>
              Edit your audio file, then continue to <b>Broadcast</b>.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAndUpload}
            disabled={isSaving}
            sx={{
              fontWeight: 700,
              fontSize: 18,
              px: 3,
              py: 1.2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
              textTransform: 'none',
            }}
          >
            {isSaving ? 'Saving...' : 'Continue to Broadcast'}
          </Button>
        </Box>

        {/* Custom Audio Editor */}
        <Box sx={{
          flex: 1,
          minHeight: { xs: '75vh', sm: '82vh' },
          borderRadius: 1,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          position: 'relative',
          bgcolor: theme.palette.background.paper,
          p: 2,
        }}>
          {/* Always render the waveform container */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Waveform - always rendered */}
            <Box sx={{ flex: 1, minHeight: 200, position: 'relative' }}>
              <div id="waveform" style={{ width: '100%', height: '100%' }} />
              
              {/* Visual markers for start/end points */}
              {selectedRegion && (
                <>
                  {/* Start point marker */}
                  <Box sx={{
                    position: 'absolute',
                    left: `${(selectedRegion.start / duration) * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    bgcolor: 'green',
                    zIndex: 4,
                    pointerEvents: 'none',
                  }} />
                  
                  {/* End point marker */}
                  {!isSettingStart && (
                    <Box sx={{
                      position: 'absolute',
                      left: `${(selectedRegion.end / duration) * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      bgcolor: 'red',
                      zIndex: 4,
                      pointerEvents: 'none',
                    }} />
                  )}
                  
                  {/* Selection area highlight */}
                  {!isSettingStart && (
                    <Box sx={{
                      position: 'absolute',
                      left: `${(selectedRegion.start / duration) * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: `${((selectedRegion.end - selectedRegion.start) / duration) * 100}%`,
                      bgcolor: 'rgba(255, 0, 0, 0.1)',
                      zIndex: 3,
                      pointerEvents: 'none',
                    }} />
                  )}
                </>
              )}
              
              {/* Trim mode indicator */}
              {isTrimModeRef.current && (
                <Box sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  bgcolor: 'rgba(255, 0, 0, 0.8)',
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  fontSize: '12px',
                  fontWeight: 'bold',
                  zIndex: 3,
                }}>
                  TRIM MODE
                </Box>
              )}
              
              {/* Loading overlay */}
              {isLoading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,32,38,0.85)' : 'rgba(255,255,255,0.85)',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CircularProgress size={48} color="primary" />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
                    Loading audio editor...
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Playback Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
              <IconButton onClick={togglePlayPause} color="primary" size="large">
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <IconButton onClick={stopAudio} color="secondary" size="large">
                <StopIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Box>

            {/* Volume Control */}
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Volume Control
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <VolumeIcon color="action" />
                <Slider
                  value={volume * 100}
                  onChange={handleVolumeChange}
                  aria-label="Volume"
                  min={0}
                  max={100}
                  sx={{ flex: 1 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                  {Math.round(volume * 100)}%
                </Typography>
              </Box>
            </Box>

            {/* Trim Controls */}
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CutIcon color="action" />
                <Typography variant="subtitle2">
                  Trim Audio
                </Typography>
                <Button
                  variant={isTrimModeRef.current ? "contained" : "outlined"}
                  size="small"
                  onClick={toggleTrimMode}
                  sx={{ ml: 'auto' }}
                >
                  {isTrimModeRef.current ? "Exit Trim Mode" : "Enter Trim Mode"}
                </Button>
              </Box>
              
              {isTrimModeRef.current && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {isSettingStartRef.current ? (
                      <><strong>Step 1:</strong> Click on the waveform to set the START point</>
                    ) : selectionComplete ? (
                      <>
                        <strong>Selection Complete!</strong> Click "Apply Trim" to trim the audio
                        {selectedRegion && (
                          <>
                            <br />
                            <strong>Selected:</strong> {formatTime(selectedRegion.start)} to {formatTime(selectedRegion.end)}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <strong>Step 2:</strong> Click on the waveform to set the END point
                        {selectedRegion && (
                          <>
                            <br />
                            <strong>Current selection:</strong> {formatTime(selectedRegion.start)} to {formatTime(selectedRegion.end)}
                          </>
                        )}
                      </>
                    )}
                  </Typography>
                </Alert>
              )}

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Start Time: {formatTime(trimStart)}
                  </Typography>
                  <Slider
                    value={trimStart}
                    onChange={handleTrimStart}
                    min={0}
                    max={duration}
                    step={0.1}
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    End Time: {formatTime(trimEnd)}
                  </Typography>
                  <Slider
                    value={trimEnd}
                    onChange={handleTrimEnd}
                    min={trimStart}
                    max={duration}
                    step={0.1}
                    sx={{ flex: 1 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<CutIcon />}
                    onClick={applyTrim}
                    disabled={!selectedRegion || !selectionComplete}
                    sx={{ flex: 1 }}
                  >
                    Apply Trim
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={clearSelection}
                    sx={{ flex: 1 }}
                  >
                    Clear Selection
                  </Button>
                </Box>

                {selectedRegion && !isSettingStartRef.current && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={playSelectedRegion}
                      disabled={isPlayingSelection}
                      sx={{ flex: 1 }}
                    >
                      {isPlayingSelection ? "Playing Selection..." : "Preview Selection"}
                    </Button>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Minimal Footer */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          mt: 1,
        }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontFamily: 'inherit', fontWeight: 500, fontSize: 18 }}>
            Professional Audio Editor
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}