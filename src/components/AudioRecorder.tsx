'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Button, Paper, Typography, CircularProgress, Alert, IconButton } from '@mui/material';
import { PlayArrow as PlayIcon, Pause as PauseIcon, Stop as StopIcon, ContentCut as CutIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWaveSurferEditor } from '@/hooks/useWaveSurferEditor';

export default function AudioRecorder() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = typeof window !== 'undefined' ? (searchParams.get('draft') || null) : null;

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTrimMode, setIsTrimMode] = useState(false);
  const [trimStartTime, setTrimStartTime] = useState<number | null>(null);
  const [trimEndTime, setTrimEndTime] = useState<number | null>(null);
  const [isSettingStart, setIsSettingStart] = useState(true);
  const [selectionComplete, setSelectionComplete] = useState(false);
  const [isApplyingTrim, setIsApplyingTrim] = useState(false);

  const wavesurferContainerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, isReady, isPlaying, currentTime, duration, error: wsError, play, pause, stop, loadUrl, addRegion, clearRegions, loadBlob } = useWaveSurferEditor(wavesurferContainerRef);

  useEffect(() => {
    console.log('[Editor] isInitialized', isInitialized, 'isReady', isReady);
  }, [isInitialized, isReady]);

  const gradientBg = theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)';
  
  const glassBg = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)';
  const glassBorder = theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)';

  useEffect(() => {
    if (wsError) setError(wsError);
  }, [wsError]);

  useEffect(() => {
    (async () => {
      if (!draftId) {
        setError('No draft found. Please upload or record first.');
        setIsLoading(false);
        return;
      }
      if (!isInitialized) {
        // Wait for wavesurfer to initialize before loading URL
        return;
      }
      try {
        let res = await fetch(`/api/drafts/${encodeURIComponent(draftId)}/read-url?which=edited`);
        if (!res.ok) {
          console.error('[Editor] read-url edited status', res.status);
          const txt = await res.text().catch(() => '');
          console.error('[Editor] read-url edited body', txt);
          res = await fetch(`/api/drafts/${encodeURIComponent(draftId)}/read-url?which=original`);
        }
        if (!res.ok) {
          console.error('[Editor] read-url original status', res.status);
          const txt = await res.text().catch(() => '');
          console.error('[Editor] read-url original body', txt);
          throw new Error('Failed to get draft read URL');
        }
        const data = await res.json();
        console.log('[Editor] obtained readUrl', !!data.readUrl);
        await loadUrl(data.readUrl);
        console.log('[Editor] loadUrl resolved');
        setIsLoading(false);
      } catch (e) {
        setError('Failed to load draft audio');
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, isInitialized]);

  const togglePlayPause = () => { isPlaying ? pause() : play(); };
  const stopAudio = () => stop();

  function bufferToWavBlobFromUrl(url: string): Promise<Blob> {
    return fetch(url)
      .then(r => r.arrayBuffer())
      .then(async (arrayBuffer) => {
      const audioContext = new AudioContext();
        const decoded = await audioContext.decodeAudioData(arrayBuffer);
        const numChannels = decoded.numberOfChannels;
        const sampleRate = decoded.sampleRate;
        const numFrames = decoded.length;
    const dataLength = numFrames * numChannels * 2;
        const out = new ArrayBuffer(44 + dataLength);
        const view = new DataView(out);
    let offset = 0;
        const writeString = (s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i)); offset += s.length; };
        writeString('RIFF'); view.setUint32(offset, 36 + dataLength, true); offset += 4;
        writeString('WAVE'); writeString('fmt '); view.setUint32(offset, 16, true); offset += 4;
        view.setUint16(offset, 1, true); offset += 2; view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * numChannels * 2, true); offset += 4;
        view.setUint16(offset, numChannels * 2, true); offset += 2; view.setUint16(offset, 16, true); offset += 2;
        writeString('data'); view.setUint32(offset, dataLength, true); offset += 4;
    for (let i = 0; i < numFrames; i++) {
          for (let ch = 0; ch < numChannels; ch++) {
            let sample = decoded.getChannelData(ch)[i];
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
        return new Blob([out], { type: 'audio/wav' });
      });
  }

  const handleSaveAndUpload = async () => {
    setIsSaving(true);
    try {
      if (!draftId) throw new Error('No draft found');
      // Save edited audio: we don’t manipulate buffer here; assume server consumes the same source URL.
      // If trim is applied, a real implementation would re-render audio. Here, we upload the current URL as WAV.
      const urlRes = await fetch(`/api/drafts/${encodeURIComponent(draftId)}/read-url?which=${selectionComplete ? 'edited' : 'original'}`);
      const urlData = await urlRes.json();
      const wavBlob = await bufferToWavBlobFromUrl(urlData.readUrl);

      const uploadUrlResp = await fetch(`/api/drafts/${encodeURIComponent(draftId)}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ which: 'edited', contentType: 'audio/wav' }),
      });
      if (!uploadUrlResp.ok) throw new Error('Failed to get edited upload URL');
      const { uploadUrl } = await uploadUrlResp.json();
      const putResp = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'audio/wav' }, body: wavBlob });
      if (!putResp.ok) throw new Error('Failed to upload edited audio');
      
      setIsSaving(false);
      try { sessionStorage.setItem('currentDraftId', draftId); } catch {}
      router.push(`/finalize?draft=${encodeURIComponent(draftId)}`);
    } catch (e) {
      setError('Failed to save edited audio');
      setIsSaving(false);
    }
  };

  const handleWaveformClick = (event: any) => {
    if (!isTrimMode || !wavesurferContainerRef.current) return;
    const rect = wavesurferContainerRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickTime = (clickX / rect.width) * duration;
    if (isSettingStart) {
      setTrimStartTime(clickTime);
      setIsSettingStart(false);
    } else {
      if (trimStartTime && clickTime > trimStartTime) {
        setTrimEndTime(clickTime);
        setSelectionComplete(true);
        clearRegions();
        addRegion(trimStartTime, clickTime);
      } else {
        setTrimStartTime(clickTime);
        setIsSettingStart(false);
      }
    }
  };

  const handleApplyTrim = async () => {
    try {
      setIsApplyingTrim(true);
      if (!trimStartTime || !trimEndTime) return;
      // Get current audio as WAV from the signed URL and cut the selected region out
      const urlRes = await fetch(`/api/drafts/${encodeURIComponent(draftId!)}/read-url?which=original`);
      const { readUrl } = await urlRes.json();
      const arrayBuffer = await fetch(readUrl).then(r => r.arrayBuffer());
      const ctx = new AudioContext();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      const sampleRate = buffer.sampleRate;
      const startSample = Math.floor(trimStartTime * sampleRate);
      const endSample = Math.floor(trimEndTime * sampleRate);
      const beforeLength = startSample;
      const afterLength = buffer.length - endSample;
      const totalLength = beforeLength + afterLength;
      const out = ctx.createBuffer(buffer.numberOfChannels, totalLength, sampleRate);
      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const src = buffer.getChannelData(ch);
        const dst = out.getChannelData(ch);
        for (let i = 0; i < beforeLength; i++) dst[i] = src[i];
        for (let i = 0; i < afterLength; i++) dst[beforeLength + i] = src[endSample + i];
      }
      // Encode to WAV
      const wavArrayBuffer = (() => {
        const numChannels = out.numberOfChannels;
        const numFrames = out.length;
        const dataLength = numFrames * numChannels * 2;
        const ab = new ArrayBuffer(44 + dataLength);
        const view = new DataView(ab);
        let offset = 0;
        const writeString = (s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i)); offset += s.length; };
        writeString('RIFF'); view.setUint32(offset, 36 + dataLength, true); offset += 4;
        writeString('WAVE'); writeString('fmt '); view.setUint32(offset, 16, true); offset += 4;
        view.setUint16(offset, 1, true); offset += 2; view.setUint16(offset, numChannels, true); offset += 2;
        view.setUint32(offset, sampleRate, true); offset += 4;
        view.setUint32(offset, sampleRate * numChannels * 2, true); offset += 4;
        view.setUint16(offset, numChannels * 2, true); offset += 2; view.setUint16(offset, 16, true); offset += 2;
        writeString('data'); view.setUint32(offset, dataLength, true); offset += 4;
        for (let i = 0; i < numFrames; i++) {
          for (let ch = 0; ch < numChannels; ch++) {
            let sample = out.getChannelData(ch)[i];
            sample = Math.max(-1, Math.min(1, sample));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
          }
        }
        return ab;
      })();
      const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
      await loadBlob(wavBlob);
      // Clear any highlighted region after applying trim
      clearRegions();
      // Reset trim state
      setIsTrimMode(false);
      setSelectionComplete(false);
      setTrimStartTime(null);
      setTrimEndTime(null);
    } catch (e) {
      setError('Failed to apply trim');
    } finally {
      setIsApplyingTrim(false);
    }
  };

  const handleClearSelection = () => {
    clearRegions();
    setSelectionComplete(false);
    setTrimStartTime(null);
    setTrimEndTime(null);
    setIsSettingStart(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: gradientBg, p: { xs: 1, sm: 3 } }}>
      <Paper elevation={1} sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1200, width: '100%', borderRadius: 2, background: glassBg, border: glassBorder }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 600 }}>
            Edit your audio file, then continue to Finalize.
            </Typography>
          <Button variant="contained" color="primary" onClick={handleSaveAndUpload} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Continue to Finalize'}
          </Button>
        </Box>

        <Box sx={{ position: 'relative', minHeight: 200 }}>
          <div ref={wavesurferContainerRef} style={{ width: '100%', height: '200px' }} onClick={isTrimMode ? handleWaveformClick : undefined} />
          {isLoading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, bgcolor: 'transparent' }}>
            <CircularProgress />
              <Typography variant="body2" color="text.secondary">Loading waveform...</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <IconButton onClick={togglePlayPause} disabled={!isReady}><>{isPlaying ? <PauseIcon /> : <PlayIcon />}</></IconButton>
          <IconButton onClick={stopAudio} disabled={!isReady}><StopIcon /></IconButton>
          <Typography variant="body2" color="text.secondary">{formatTime(currentTime)} / {formatTime(duration)}</Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Button variant={isTrimMode ? 'contained' : 'outlined'} startIcon={<CutIcon />} onClick={() => setIsTrimMode(v => !v)} size="small">
              {isTrimMode ? 'Exit Trim' : 'Trim'}
            </Button>
            {isTrimMode && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isSettingStart ? 'Click to set start point' : 'Click to set end point'}
              </Typography>
            )}
          </Box>
          
        {isTrimMode && selectionComplete && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Selection: {formatTime(trimStartTime || 0)} - {formatTime(trimEndTime || 0)}</Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button variant="contained" size="small" onClick={handleApplyTrim} disabled={!isReady || isApplyingTrim}>{isApplyingTrim ? 'Applying…' : 'Apply Trim'}</Button>
              <Button variant="outlined" size="small" onClick={handleClearSelection} disabled={isApplyingTrim}>Clear Selection</Button>
            </Box>
            </Box>
          )}
      </Paper>
    </Box>
  );
}