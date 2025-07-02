'use client';

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/plugins/regions';
import TimelinePlugin from 'wavesurfer.js/plugins/timeline';
import {
  Box, IconButton, Button, Typography, useTheme, Stack
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  ContentCut as CutIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const AudioEditor: React.FC = () => {
  const theme = useTheme();
  const waveformRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [region, setRegion] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [undoStack, setUndoStack] = useState<Blob[]>([]);
  const [redoStack, setRedoStack] = useState<Blob[]>([]);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
      progressColor: theme.palette.mode === 'dark' ? '#42a5f5' : '#1565c0',
      backgroundColor: 'transparent',
      height: 100,
      responsive: true,
      plugins: [
        RegionsPlugin.create({
          dragSelection: true,
        }),
        TimelinePlugin.create({
          container: timelineRef.current,
        }),
      ],
    });
    wavesurfer.current.on('region-updated', (reg: any) => setRegion(reg));
    wavesurfer.current.on('region-created', (reg: any) => setRegion(reg));
    wavesurfer.current.on('region-removed', () => setRegion(null));
    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));
    return () => {
      wavesurfer.current && wavesurfer.current.destroy();
    };
    // eslint-disable-next-line
  }, [theme.palette.mode]);

  // Load audio blob into wavesurfer
  useEffect(() => {
    if (audioBlob && wavesurfer.current) {
      const url = URL.createObjectURL(audioBlob);
      wavesurfer.current.load(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  // --- Recording ---
  const startRecording = async () => {
    setAudioChunks([]);
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    recorder.ondataavailable = (e) => {
      setAudioChunks((prev) => [...prev, e.data]);
    };
    recorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      setUndoStack([]);
      setRedoStack([]);
      setAudioBlob(blob);
      setIsRecording(false);
    };
    recorder.start();
  };
  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  // --- Toolbar Actions ---
  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };
  const handleStop = () => {
    if (wavesurfer.current) {
      wavesurfer.current.stop();
    }
  };
  const handleZoomIn = () => {
    if (wavesurfer.current) {
      const newZoom = Math.min(zoomLevel + 1, 10);
      wavesurfer.current.zoom(newZoom * 50);
      setZoomLevel(newZoom);
    }
  };
  const handleZoomOut = () => {
    if (wavesurfer.current) {
      const newZoom = Math.max(zoomLevel - 1, 1);
      wavesurfer.current.zoom(newZoom * 50);
      setZoomLevel(newZoom);
    }
  };
  const handleTrim = () => {
    if (wavesurfer.current && region) {
      const originalBuffer = wavesurfer.current.backend.buffer;
      const sampleRate = originalBuffer.sampleRate;
      const start = Math.floor(region.start * sampleRate);
      const end = Math.floor(region.end * sampleRate);
      const trimmed = originalBuffer.getChannelData(0).slice(start, end);
      const newBuffer = wavesurfer.current.backend.ac.createBuffer(1, trimmed.length, sampleRate);
      newBuffer.copyToChannel(trimmed, 0, 0);
      wavesurfer.current.loadDecodedBuffer(newBuffer);
      setRegion(null);
      // Save for undo
      if (audioBlob) setUndoStack((prev) => [audioBlob, ...prev]);
      setRedoStack([]);
    }
  };
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const prev = undoStack[0];
      setRedoStack((r) => [audioBlob!, ...r]);
      setAudioBlob(prev);
      setUndoStack((u) => u.slice(1));
    }
  };
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[0];
      setUndoStack((u) => [audioBlob!, ...u]);
      setAudioBlob(next);
      setRedoStack((r) => r.slice(1));
    }
  };
  const handleDeleteRegion = () => {
    if (wavesurfer.current && region) {
      region.remove();
      setRegion(null);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', mt: 6, p: { xs: 1, sm: 3 }, bgcolor: 'background.default', borderRadius: 4, boxShadow: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 3 }}>
        <IconButton color={isRecording ? 'error' : 'primary'} onClick={isRecording ? stopRecording : startRecording} size="large" title={isRecording ? 'Stop Recording' : 'Record'}>
          {isRecording ? <StopIcon sx={{ fontSize: 32 }} /> : <MicIcon sx={{ fontSize: 32 }} />}
        </IconButton>
        <IconButton color="primary" onClick={handlePlayPause} size="large" title="Play/Pause">
          {isPlaying ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayIcon sx={{ fontSize: 32 }} />}
        </IconButton>
        <IconButton color="primary" onClick={handleStop} size="large" title="Stop">
          <StopIcon sx={{ fontSize: 32 }} />
        </IconButton>
        <IconButton color="primary" onClick={handleTrim} size="large" title="Trim Selection">
          <CutIcon sx={{ fontSize: 28 }} />
        </IconButton>
        <IconButton color="primary" onClick={handleUndo} size="large" title="Undo">
          <UndoIcon sx={{ fontSize: 28 }} />
        </IconButton>
        <IconButton color="primary" onClick={handleRedo} size="large" title="Redo">
          <RedoIcon sx={{ fontSize: 28 }} />
        </IconButton>
        <IconButton color="primary" onClick={handleZoomIn} size="large" title="Zoom In">
          <ZoomInIcon sx={{ fontSize: 28 }} />
              </IconButton>
        <IconButton color="primary" onClick={handleZoomOut} size="large" title="Zoom Out">
          <ZoomOutIcon sx={{ fontSize: 28 }} />
              </IconButton>
        <IconButton color="error" onClick={handleDeleteRegion} size="large" title="Delete Region">
          <DeleteIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Stack>
      <Box ref={timelineRef} sx={{ width: '100%', minHeight: 30, mb: 1 }} />
      <Box ref={waveformRef} sx={{ width: '100%', minHeight: 120, bgcolor: theme.palette.mode === 'dark' ? '#232526' : '#f5f7fa', borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(60,60,60,0.08)', p: 2 }} />
      {!audioBlob && (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
          Record something to see the waveform and start editing!
                  </Typography>
      )}
    </Box>
  );
};

export default AudioEditor; 