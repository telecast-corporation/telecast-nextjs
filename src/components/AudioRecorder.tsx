'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Slider,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import { 
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  ContentCut as CutIcon,
  Undo as UndoIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

interface SessionData {
  referenceId: string;
  tempFileName: string;
  tempUrl: string;
  tempPath: string;
  podcastId: string;
  originalFileName: string;
}

export default function AudioRecorder() {
  const theme = useTheme();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isTrimMode, setIsTrimMode] = useState(false);
  const [trimStartTime, setTrimStartTime] = useState<number | null>(null);
  const [trimEndTime, setTrimEndTime] = useState<number | null>(null);
  const [isSettingStart, setIsSettingStart] = useState(true);
  const [selectionComplete, setSelectionComplete] = useState(false);
  const [isPreviewingTrim, setIsPreviewingTrim] = useState(false);

  const wavesurferRef = useRef<any>(null);
  const wavesurferInstanceRef = useRef<any>(null);
  const regionsPluginRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isTrimModeRef = useRef(false);
  const isSettingStartRef = useRef(true);
  const selectedRegionRef = useRef<any>(null);
  const isApplyingTrimRef = useRef(false);

  // Gradient backgrounds
  const gradientBg = theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)';
  
  const glassBg = theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.05)'
    : 'rgba(255,255,255,0.9)';
  
  const glassBorder = theme.palette.mode === 'dark'
    ? '1px solid rgba(255,255,255,0.1)'
    : '1px solid rgba(0,0,0,0.1)';

  useEffect(() => {
    // Load session data on component mount
    const editSession = sessionStorage.getItem('editSession');
    console.log('Edit session found:', !!editSession);
    
    if (editSession) {
      try {
        const sessionData = JSON.parse(editSession);
        console.log('Parsed session data:', sessionData);
        setSessionData(sessionData);
        
        // Load audio from the temp URL
        if (sessionData.tempUrl) {
          console.log('Loading audio from temp URL:', sessionData.tempUrl);
          
                    // Add a timeout to prevent infinite loading
          const timeoutId = setTimeout(() => {
            console.error('Audio loading timeout');
            setError('Audio loading timed out. Please try again.');
            setIsLoading(false);
          }, 30000); // 30 second timeout
          
          if (sessionData.tempUrl) {
            loadAudio(sessionData.tempUrl).finally(() => {
              clearTimeout(timeoutId);
            });
          }
        } else {
          console.error('No tempUrl in session data');
          setError('No audio file found in session');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error parsing edit session:', error);
        setError('Invalid session data');
        setIsLoading(false);
      }
    } else {
      console.error('No edit session found in sessionStorage');
      setError('No edit session found. Please record or upload an audio file first.');
      setIsLoading(false);
    }
    
    // Cleanup function to revoke object URLs on unmount
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  // Watch for audioUrl changes and initialize WaveSurfer when available
  useEffect(() => {
    console.log('=== AUDIO URL EFFECT DEBUG ===');
    console.log('audioUrl:', audioUrl);
    console.log('isLoading:', isLoading);
    console.log('isApplyingTrim:', isApplyingTrimRef.current);
    console.log('Effect triggered');
    
    // Skip initialization if we're currently applying trim
    if (isApplyingTrimRef.current) {
      console.log('⏸️ Skipping WaveSurfer initialization - trim in progress');
      return;
    }
    
    if (audioUrl && !isLoading) {
      console.log('✅ Conditions met, initializing WaveSurfer');
      initializeWaveSurfer();
    } else {
      console.log('❌ Conditions not met:');
      console.log('  - audioUrl exists:', !!audioUrl);
      console.log('  - isLoading is false:', !isLoading);
    }
  }, [audioUrl, isLoading]);



  const initializeWaveSurfer = async () => {
    console.log('=== WAVESURFER INITIALIZATION DEBUG ===');
    console.log('audioUrl:', audioUrl);
    console.log('wavesurferRef.current:', wavesurferRef.current);
    console.log('isLoading:', isLoading);
    
    if (!audioUrl) {
      console.error('❌ No audioUrl provided to initializeWaveSurfer');
      return;
    }

    if (!wavesurferRef.current) {
      console.error('❌ wavesurferRef.current is null');
      return;
    }

    try {
      console.log('📦 Loading WaveSurfer library and plugins...');
      const WaveSurfer = (await import('wavesurfer.js')).default;
      
      // Try different ways to import the Regions plugin
      let RegionsPlugin;
      try {
        RegionsPlugin = (await import('wavesurfer.js/dist/plugins/regions')).default;
        console.log('✅ Regions plugin loaded via dist path');
      } catch (error) {
        try {
          RegionsPlugin = (await import('wavesurfer.js/plugins/regions')).default;
          console.log('✅ Regions plugin loaded via plugins path');
        } catch (error2) {
          console.error('❌ Failed to load Regions plugin:', error2);
          throw new Error('Regions plugin not available');
        }
      }
      
      console.log('✅ WaveSurfer library and plugins loaded successfully');
      console.log('📦 WaveSurfer library loaded successfully');
      console.log('🔌 Regions plugin:', RegionsPlugin);
      
      if (wavesurferInstanceRef.current) {
        console.log('🗑️ Destroying existing wavesurfer instance');
        wavesurferInstanceRef.current.destroy();
        wavesurferInstanceRef.current = null;
      }

      console.log('🏗️ Creating new wavesurfer instance with Regions plugin...');
      console.log('Container element:', wavesurferRef.current);
      
      const regionsPlugin = RegionsPlugin.create();
      console.log('🔌 Regions plugin created:', regionsPlugin);
      
      // Store the regions plugin reference
      regionsPluginRef.current = regionsPlugin;
      console.log('🔌 Regions plugin stored in ref:', regionsPluginRef.current);
      
      const wavesurferOptions = {
        container: wavesurferRef.current,
        waveColor: theme.palette.primary.main,
        progressColor: isTrimMode ? 'transparent' : theme.palette.secondary.main, // Hide progress in trim mode
        cursorColor: theme.palette.text.primary,
        barWidth: 2,
        barGap: 1,
        height: 100,
        plugins: [regionsPlugin],
        interact: !isTrimMode, // Disable default interactions in trim mode
        hideScrollbar: true,
        normalize: true
      };
      
      console.log('WaveSurfer options:', wavesurferOptions);
      
      const wavesurfer = WaveSurfer.create(wavesurferOptions);

      console.log('✅ WaveSurfer instance created');
      console.log('🎵 Loading audio into wavesurfer:', audioUrl);
      
      // Test if the audio URL is accessible
      try {
        const testResponse = await fetch(audioUrl);
        console.log('🔍 Audio URL test response:', testResponse.status, testResponse.statusText);
        if (!testResponse.ok) {
          throw new Error(`Audio URL test failed: ${testResponse.status} ${testResponse.statusText}`);
        }
        const testBlob = await testResponse.blob();
        console.log('✅ Audio URL is accessible, blob size:', testBlob.size, 'bytes');
      } catch (urlError) {
        console.error('❌ Audio URL test failed:', urlError);
        throw urlError;
      }

      wavesurfer.load(audioUrl);

      // Add timeout for WaveSurfer loading
      const timeoutId = setTimeout(() => {
        console.error('⏰ WaveSurfer loading timeout after 15 seconds');
        setError('WaveSurfer failed to load audio within 15 seconds');
        setIsLoading(false);
      }, 15000);

      wavesurfer.on('ready', () => {
        console.log('🎉 WaveSurfer ready event fired');
        console.log('Duration:', wavesurfer.getDuration());
        clearTimeout(timeoutId);
        setDuration(wavesurfer.getDuration());
        setIsLoading(false);
        
        // Ensure regions plugin is properly initialized after WaveSurfer is ready
        if (regionsPluginRef.current) {
          console.log('🔌 Regions plugin ready for use');
        }
      });

      wavesurfer.on('audioprocess', (currentTime) => {
        setCurrentTime(currentTime);
      });

      wavesurfer.on('play', () => {
        console.log('▶️ WaveSurfer play event');
        setIsPlaying(true);
      });

      wavesurfer.on('pause', () => {
        console.log('⏸️ WaveSurfer pause event');
        setIsPlaying(false);
      });

      wavesurfer.on('finish', () => {
        console.log('🏁 WaveSurfer finish event');
        setIsPlaying(false);
      });

      // Note: Using direct DOM click handler instead of WaveSurfer click event

      wavesurfer.on('error', (error: any) => {
        console.error('❌ WaveSurfer error event:', error);
        clearTimeout(timeoutId);
        setError(`WaveSurfer error: ${error?.message || 'Unknown error'}`);
        setIsLoading(false);
      });

      // Monitor region events and prevent automatic region creation
      // Note: region-created event is not available in this version of WaveSurfer

      // Store the wavesurfer instance
      wavesurferInstanceRef.current = wavesurfer;
      console.log('✅ WaveSurfer initialization complete');

    } catch (error: any) {
      console.error('❌ Failed to initialize WaveSurfer:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      setError(`WaveSurfer initialization failed: ${error?.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const loadAudio = async (url: string) => {
    try {
      console.log('Loading audio from URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('Audio array buffer size:', arrayBuffer.byteLength);
      
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log('Audio buffer decoded successfully');
      
      setAudioBuffer(audioBuffer);
      console.log('🎯 Setting audioUrl to:', url);
      setAudioUrl(url);
      console.log('✅ setAudioUrl called');
      console.log('✅ Audio loaded successfully, setting isLoading to false');
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error loading audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to load audio file: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (wavesurferInstanceRef.current) {
      if (isPlaying) {
        wavesurferInstanceRef.current.pause();
      } else {
        wavesurferInstanceRef.current.play();
      }
    }
  };

  const stopAudio = () => {
    if (wavesurferInstanceRef.current) {
      wavesurferInstanceRef.current.pause();
      wavesurferInstanceRef.current.setTime(0);
    }
  };

  const stopPreview = () => {
    if (wavesurferInstanceRef.current && isPreviewingTrim) {
      console.log('⏹️ Stopping preview manually');
      wavesurferInstanceRef.current.pause();
      setIsPreviewingTrim(false);
    }
  };



  function bufferToWavBlob(buffer: AudioBuffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const numFrames = buffer.length;
    
    // WAV file header
    const dataLength = numFrames * numChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(arrayBuffer);
    let offset = 0;
    
    // Write WAV header
    const writeString = (s: string) => {
      for (let i = 0; i < s.length; i++) {
        view.setUint8(offset + i, s.charCodeAt(i));
      }
      offset += s.length;
    };
    
    writeString('RIFF');
    view.setUint32(offset, 36 + dataLength, true); offset += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * numChannels * 2, true); offset += 4;
    view.setUint16(offset, numChannels * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
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

  const formatTime = (seconds: number) => {
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
      console.log('Edited audio uploaded to temp path:', result.tempPath);
      
      // Store the updated reference data for the broadcast page
      sessionStorage.setItem("broadcastReference", JSON.stringify({
        referenceId: sessionData.referenceId,
        tempFileName: result.tempFileName,
        tempUrl: result.tempUrl,
        tempPath: result.tempPath, // Use the actual uploaded file path
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
      // Enter trim mode - enable click selection
      console.log('✂️ Entering trim mode');
      console.log('Click to set start point, then click again to set end point');
      
      // Clear all previous state
      setSelectionComplete(false);
      setTrimStartTime(null);
      setTrimEndTime(null);
      setIsSettingStart(true);
      setIsPreviewingTrim(false);
      
      // Clear any existing visual elements
      console.log('🗑️ Clearing any existing visual elements');
      
      // Clear all existing regions
      if (regionsPluginRef.current) {
        try {
          console.log('🔍 Regions plugin available for clearing');
          const regions = regionsPluginRef.current.getRegions();
          console.log('🔍 Current regions before clearing:', Object.keys(regions));
          Object.keys(regions).forEach(id => {
            console.log('🗑️ Removing region:', id);
            regions[id].remove();
          });
          console.log('✅ All regions cleared');
          
                // Set up a periodic check to remove any automatic regions and ensure our region is visible
      const intervalId = setInterval(() => {
        if (regionsPluginRef.current) {
          const currentRegions = regionsPluginRef.current.getRegions();
          Object.keys(currentRegions).forEach(id => {
            if (id !== 'trim-selection') {
              console.log('🗑️ Removing automatic region during trim mode:', id);
              currentRegions[id].remove();
            }
          });
          
          // Force our trim-selection region to be visible
          const trimRegion = currentRegions['trim-selection'];
          if (trimRegion) {
            try {
              // Ensure the region element has proper styling
              const regionElement = trimRegion.element;
              if (regionElement) {
                regionElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                regionElement.style.border = '2px solid rgba(255, 0, 0, 1)';
                regionElement.style.zIndex = '1000';
              }
            } catch (error) {
              console.log('⚠️ Could not update region styling:', error);
            }
          }
        }
      }, 100); // Check every 100ms
      
      // Clear the interval when exiting trim mode
      setTimeout(() => {
        clearInterval(intervalId);
      }, 30000); // Stop after 30 seconds
          
        } catch (error: any) {
          console.log('Error clearing regions:', error);
        }
      } else {
        console.log('❌ Regions plugin not available for clearing');
      }
      
      // Reset WaveSurfer to default state (clear any custom styling)
      if (wavesurferInstanceRef.current) {
        try {
          // Ensure WaveSurfer is in a clean state
          wavesurferInstanceRef.current.setTime(0);
          console.log('🔄 Reset WaveSurfer to clean state');
        } catch (error: any) {
          console.log('Error resetting WaveSurfer:', error);
        }
      }
    } else {
      // Exit trim mode
      console.log('🚪 Exiting trim mode');
      
      // Clear all state
      setSelectionComplete(false);
      setTrimStartTime(null);
      setTrimEndTime(null);
      setIsSettingStart(true);
      setIsPreviewingTrim(false);
      
      // Clear any existing visual elements
      console.log('🗑️ Clearing any existing visual elements');
    }
  };

  const handleWaveformClick = (event: any) => {
    if (!isTrimMode || !wavesurferInstanceRef.current) return;
    
    // Prevent default behavior to avoid automatic region creation
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🎯 Waveform click event received:', event);
    
    // Get the waveform container element
    const waveformElement = wavesurferRef.current;
    if (!waveformElement) {
      console.error('❌ No waveform element found');
      return;
    }
    
    const rect = waveformElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickTime = (clickX / rect.width) * duration;
    
    console.log('🎯 Waveform clicked at time:', clickTime, 'seconds');
    console.log('📊 Click details:', {
      clientX: event.clientX,
      rectLeft: rect.left,
      rectWidth: rect.width,
      clickX,
      duration,
      clickTime
    });
    
    if (isSettingStart) {
      // Setting start point - don't create any region yet
      setTrimStartTime(clickTime);
      setIsSettingStart(false);
      console.log('📍 Start point set at:', formatTime(clickTime));
      console.log('⏳ Waiting for end point selection...');
      console.log('🔍 Current state - isSettingStart:', isSettingStart, 'trimStartTime:', trimStartTime);
      
      // Clear any previous selection state
      console.log('🗑️ Clearing previous selection state');
    } else {
      // Setting end point
      console.log('🎯 End point selection - trimStartTime:', trimStartTime, 'clickTime:', clickTime);
      if (trimStartTime && clickTime > trimStartTime) {
        setTrimEndTime(clickTime);
        setSelectionComplete(true);
        console.log('📍 End point set at:', formatTime(clickTime));
        console.log('✅ Selection complete:', formatTime(trimStartTime), 'to', formatTime(clickTime));
        console.log('📊 Selection duration:', formatTime(clickTime - trimStartTime));
        
        // Create visual region to highlight the selection
        try {
          console.log('🎨 Attempting to create visual region...');
          console.log('📊 Region details:', {
            start: trimStartTime,
            end: clickTime,
            duration: clickTime - trimStartTime,
            regionsPlugin: !!regionsPluginRef.current,
            wavesurferReady: !!wavesurferInstanceRef.current
          });
          
          // Check if regions plugin and wavesurfer are available
          if (!regionsPluginRef.current) {
            console.error('❌ Regions plugin is not available');
            return;
          }
          
          if (!wavesurferInstanceRef.current) {
            console.error('❌ WaveSurfer instance is not available');
            return;
          }
          
          // Access regions through the plugin
          const regions = regionsPluginRef.current.getRegions();
          console.log('🔍 Available regions:', regions);
          console.log('🔍 Regions object type:', typeof regions);
          console.log('🔍 Regions object keys:', Object.keys(regions));
          console.log('🔍 Regions object methods:', Object.getOwnPropertyNames(regions));
          
          // Clear any existing regions first
          try {
            const existingRegions = regionsPluginRef.current.getRegions();
            Object.keys(existingRegions).forEach(id => {
              existingRegions[id].remove();
            });
            console.log('🗑️ Cleared existing regions');
          } catch (clearError) {
            console.log('⚠️ Could not clear existing regions:', clearError);
          }
          
          // Create the region using the correct method
          let region: any;
          try {
            // Use the regions plugin's addRegion method
            region = regionsPluginRef.current.addRegion({
              start: trimStartTime,
              end: clickTime,
              color: 'rgba(255, 0, 0, 0.5)', // More visible red highlight
              borderColor: 'rgba(255, 0, 0, 1)', // Solid red border
              borderWidth: 2, // Thicker border
              drag: false, // Disable dragging
              resize: false, // Disable resizing
              id: 'trim-selection'
            });
            
            console.log('✅ Visual region created successfully:', region);
            
            // Force the region to be visible by updating its styling after a short delay
            setTimeout(() => {
              try {
                const regionElement = region.element;
                if (regionElement) {
                  regionElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                  regionElement.style.border = '2px solid rgba(255, 0, 0, 1)';
                  regionElement.style.zIndex = '1000';
                  console.log('🎨 Forced region styling update');
                }
              } catch (error) {
                console.log('⚠️ Could not force region styling:', error);
              }
            }, 50);
            
          } catch (regionError) {
            console.error('❌ Error creating region:', regionError);
            console.log('🔍 Trying alternative region creation method...');
            
            // Fallback: Try using the wavesurfer instance directly
            try {
              region = wavesurferInstanceRef.current.addRegion({
                start: trimStartTime,
                end: clickTime,
                color: 'rgba(255, 0, 0, 0.5)', // More visible red highlight
                borderColor: 'rgba(255, 0, 0, 1)', // Solid red border
                borderWidth: 2, // Thicker border
                drag: false,
                resize: false,
                id: 'trim-selection'
              });
              console.log('✅ Region created with wavesurfer instance:', region);
              
              // Force the region to be visible
              setTimeout(() => {
                try {
                  const regionElement = region.element;
                  if (regionElement) {
                    regionElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                    regionElement.style.border = '2px solid rgba(255, 0, 0, 1)';
                    regionElement.style.zIndex = '1000';
                    console.log('🎨 Forced region styling update (fallback)');
                  }
                } catch (error) {
                  console.log('⚠️ Could not force region styling (fallback):', error);
                }
              }, 50);
              
            } catch (createError) {
              console.error('❌ All region creation methods failed:', createError);
              return;
            }
          }
          console.log('🔍 Region properties:', {
            id: region.id,
            start: region.start,
            end: region.end,
            color: region.color,
            duration: region.end - region.start
          });
          
          // Verify the region is visible
          console.log('👁️ Region should be visible from', formatTime(region.start), 'to', formatTime(region.end));
        } catch (error: any) {
          console.error('❌ Error creating visual region:', error);
          console.error('Error details:', {
            name: error?.name,
            message: error?.message,
            stack: error?.stack
          });
        }
      } else {
        // Invalid end point (before start point), reset
        setTrimStartTime(clickTime);
        setIsSettingStart(false);
        console.log('🔄 Invalid end point, resetting to start point at:', formatTime(clickTime));
        
        // Clear any previous selection state
        console.log('🗑️ Clearing previous selection state');
      }
    }
  };

  const previewTrimRegion = () => {
    if (!trimStartTime || !trimEndTime || !wavesurferInstanceRef.current) return;
    
    console.log('👁️ Previewing trim region:', formatTime(trimStartTime), 'to', formatTime(trimEndTime));
    setIsPreviewingTrim(true);
    
    // Play only the selected region
    try {
      const wavesurfer = wavesurferInstanceRef.current;
      
      // Set up a timer to stop playback at the end time
      const previewDuration = (trimEndTime - trimStartTime) * 1000; // Convert to milliseconds
      const stopTimer = setTimeout(() => {
        console.log('⏹️ Preview finished, stopping playback');
        wavesurfer.pause();
        setIsPreviewingTrim(false);
      }, previewDuration);
      
      // Start playback from the start time
      wavesurfer.play(trimStartTime, trimEndTime);
      
      // Also listen for the finish event as a backup
      const handleFinish = () => {
        console.log('🏁 Preview finished via finish event');
        clearTimeout(stopTimer);
        setIsPreviewingTrim(false);
        // Remove the event listener to prevent memory leaks
        wavesurfer.un('finish', handleFinish);
      };
      
      wavesurfer.on('finish', handleFinish);
      
      // Listen for pause event in case user manually stops
      const handlePause = () => {
        console.log('⏸️ Preview paused manually');
        clearTimeout(stopTimer);
        setIsPreviewingTrim(false);
        // Remove the event listener to prevent memory leaks
        wavesurfer.un('pause', handlePause);
        wavesurfer.un('finish', handleFinish);
      };
      
      wavesurfer.on('pause', handlePause);
      
    } catch (error) {
      console.error('Error playing region:', error);
      setIsPreviewingTrim(false);
    }
  };

  const applyTrim = async () => {
    if (!trimStartTime || !trimEndTime || !audioBuffer) {
      console.error('❌ No trim points selected or no audio buffer');
      return;
    }

    try {
      console.log('✂️ Applying trim from', formatTime(trimStartTime), 'to', formatTime(trimEndTime));
      setIsLoading(true);
      isApplyingTrimRef.current = true;
      
      const startTime = trimStartTime;
      const endTime = trimEndTime;
      
      // Create a new audio context
      const audioContext = new AudioContext();
      const sampleRate = audioBuffer.sampleRate;
      
      // Calculate the sample ranges for the parts we want to keep
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const beforeLength = startSample; // Length of audio before the selection
      const afterLength = audioBuffer.length - endSample; // Length of audio after the selection
      const totalLength = beforeLength + afterLength; // Total length of the result
      
      // Create a new buffer for the trimmed audio (excluding the selected region)
      const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        totalLength,
        sampleRate
      );
      
      // Copy the audio before the selection
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        
        // Copy the part before the selection
        for (let i = 0; i < beforeLength; i++) {
          trimmedData[i] = channelData[i];
        }
        
        // Copy the part after the selection
        for (let i = 0; i < afterLength; i++) {
          trimmedData[beforeLength + i] = channelData[endSample + i];
        }
      }
      
      setAudioBuffer(trimmedBuffer);
      setDuration((beforeLength + afterLength) / sampleRate);
      
      // Update the waveform
      const blob = bufferToWavBlob(trimmedBuffer);
      const newUrl = URL.createObjectURL(blob);
      
      // Clean up the previous object URL to prevent memory leaks
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      
      // Reload WaveSurfer with the trimmed audio directly without triggering useEffect
      if (wavesurferInstanceRef.current) {
        try {
          // Clear any existing audio to prevent conflicts
          wavesurferInstanceRef.current.empty();
          
          // Load the new audio
          wavesurferInstanceRef.current.loadBlob(blob);
          
          // Update the URL after successful load to avoid triggering useEffect
          setAudioUrl(newUrl);
        } catch (loadError) {
          console.error('Error loading trimmed audio into WaveSurfer:', loadError);
          // Fallback: set the URL and let useEffect handle it
          setAudioUrl(newUrl);
        }
      } else {
        // Fallback: set the URL and let useEffect handle it
        setAudioUrl(newUrl);
      }
      
      // Exit trim mode
      setIsTrimMode(false);
      setSelectionComplete(false);
      setIsPreviewingTrim(false);
      
      // Clear any existing regions
      if (regionsPluginRef.current) {
        try {
          const regions = regionsPluginRef.current.getRegions();
          Object.keys(regions).forEach(id => {
            regions[id].remove();
          });
        } catch (error) {
          console.log('No regions to clear');
        }
      }
      
      setIsLoading(false);
      isApplyingTrimRef.current = false;
      console.log('✅ Trim applied successfully');
      
    } catch (error) {
      console.error('❌ Error applying trim:', error);
      setError(`Failed to apply trim: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
      isApplyingTrimRef.current = false;
    }
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
          maxWidth: 1200,
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
          >
            <Typography variant="body2">
              <strong>Audio file loaded:</strong> {sessionData.originalFileName || 'Unknown file'}
              {sessionData.tempUrl && (
                <span> • <a href={sessionData.tempUrl} target="_blank" rel="noopener">View original file</a></span>
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

        {/* Info Banner */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.10)' : 'rgba(33,150,243,0.10)',
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            borderRadius: 1,
            px: 2.5,
            py: 1.2,
            boxShadow: '0 1px 6px rgba(33,150,243,0.04)',
          mb: 2,
          }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontFamily: 'inherit', fontWeight: 500, fontSize: 16, lineHeight: 1.6 }}>
            Edit your audio with our professional editor. Trim, adjust volume, and preview your changes.
            </Typography>
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
              2
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

                {/* Audio Waveform */}
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 200, gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading WaveSurfer waveform...
            </Typography>
            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 200, gap: 2 }}>
            <Typography variant="body2" color="error" gutterBottom>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                if (audioUrl) {
                  initializeWaveSurfer();
                }
              }}
            >
              Retry WaveSurfer
            </Button>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 200 }}>
            <div 
              ref={wavesurferRef} 
              style={{ width: '100%', height: '100%' }}
              onClick={isTrimMode ? handleWaveformClick : undefined}
            />
            </Box>
          )}

        {/* Audio Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={togglePlayPause} disabled={isLoading}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
          
          <IconButton onClick={stopAudio} disabled={isLoading}>
            <StopIcon />
          </IconButton>
          
          <Typography variant="body2" color="text.secondary">
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </Box>

                {/* Trim Controls */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Button
              variant={isTrimMode ? "contained" : "outlined"}
              startIcon={<CutIcon />}
              onClick={toggleTrimMode}
              size="small"
            >
              {isTrimMode ? 'Exit Trim' : 'Trim'}
            </Button>
            
            {isTrimMode && (
              <Typography variant="body2" color="text.secondary">
                {isSettingStart 
                  ? 'Click on the waveform to set start point' 
                  : 'Click on the waveform to set end point'
                }
                <br />
                <Typography variant="caption" color="text.secondary">
                  The selected region will be removed, everything else will be kept
                </Typography>
              </Typography>
            )}
          </Box>
          
          {isTrimMode && (
        <Box sx={{
              p: 2, 
              bgcolor: 'rgba(33, 150, 243, 0.1)', 
              borderRadius: 1, 
              border: '1px solid rgba(33, 150, 243, 0.3)',
              mb: 2
            }}>
              <Typography variant="subtitle2" gutterBottom>
                {trimStartTime 
                  ? `Start: ${formatTime(trimStartTime)}` 
                  : 'Start: Not set'
                }
                {trimEndTime && ` • End: ${formatTime(trimEndTime)}`}
              </Typography>
              
              {trimStartTime && trimEndTime && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Duration: {formatTime(trimEndTime - trimStartTime)}
                </Typography>
              )}
              
              {selectionComplete && (
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, mb: 1 }}>
                  ✅ Selected region will be removed, rest will be kept
                </Typography>
              )}
              
              {selectionComplete && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {isPreviewingTrim ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={stopPreview}
                      color="error"
                    >
                      Stop Preview
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={previewTrimRegion}
                    >
                      Preview
                    </Button>
                  )}
                  
                  <Button
                    variant="contained"
                    size="small"
                    onClick={applyTrim}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Applying...' : 'Remove Selection'}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}