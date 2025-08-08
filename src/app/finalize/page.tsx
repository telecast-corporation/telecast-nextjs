'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Paper, Typography, TextField, Checkbox, FormControlLabel, Button, Grid, Alert, Slider, IconButton } from '@mui/material';
import { PlayArrow as PlayIcon, Pause as PauseIcon } from '@mui/icons-material';

interface Metadata {
  episodeTitle: string;
  episodeDescription: string;
  episodeNumber: string;
  seasonNumber: string;
  keywords: string;
  explicit: boolean;
  publishDate: string;
}

const DEFAULT_METADATA: Metadata = {
  episodeTitle: '',
  episodeDescription: '',
  episodeNumber: '',
  seasonNumber: '',
  keywords: '',
  explicit: false,
  publishDate: new Date().toISOString().split('T')[0],
};

export default function FinalizePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [draftId, setDraftId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata>(DEFAULT_METADATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview player state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    const q = searchParams.get('draft');
    let id = q || null;
    if (!id) {
      try { id = sessionStorage.getItem('currentDraftId'); } catch {}
    }
    setDraftId(id);
  }, [searchParams]);

  // Load preview URL from draft (prefer edited, fallback to original)
  useEffect(() => {
    (async () => {
      if (!draftId) return;
      try {
        setLoadingPreview(true);
        let res = await fetch(`/api/drafts/${encodeURIComponent(draftId)}/read-url?which=edited`);
        if (!res.ok) {
          res = await fetch(`/api/drafts/${encodeURIComponent(draftId)}/read-url?which=original`);
        }
        if (!res.ok) throw new Error('Failed to get preview URL');
        const data = await res.json();
        setPreviewUrl(data.readUrl || null);
      } catch (e: any) {
        setPreviewUrl(null);
        setError(e?.message || 'Failed to load preview');
      } finally {
        setLoadingPreview(false);
      }
    })();
  }, [draftId]);

  // Initialize and manage audio element lifecycle
  useEffect(() => {
    if (!previewUrl) {
      if (audioEl) {
        try { audioEl.pause(); } catch {}
      }
      setAudioEl(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }
    const el = new Audio(previewUrl);
    const onTime = () => setCurrentTime(el.currentTime || 0);
    const onMeta = () => setDuration(el.duration || 0);
    const onEnd = () => setIsPlaying(false);
    const onErr = () => setError('Failed to play audio');
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('ended', onEnd);
    el.addEventListener('error', onErr);
    setAudioEl(el);
    return () => {
      try { el.pause(); } catch {}
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('ended', onEnd);
      el.removeEventListener('error', onErr);
    };
  }, [previewUrl]);

  const togglePlayPause = () => {
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
      setIsPlaying(false);
    } else {
      audioEl.play();
      setIsPlaying(true);
    }
  };

  const onSeek = (_: Event, value: number | number[]) => {
    if (!audioEl) return;
    const v = Array.isArray(value) ? value[0] : value;
    audioEl.currentTime = v;
    setCurrentTime(v);
  };

  const onChange = (field: keyof Metadata, value: string | boolean) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleFinalize = async () => {
    try {
      setSubmitting(true);
      setError(null);
      if (!draftId) {
        setError('No draft found. Please upload or record your audio again.');
        setSubmitting(false);
        return;
      }
      if (!metadata.episodeTitle || !metadata.episodeDescription) {
        setError('Please fill in Episode Title and Description.');
        setSubmitting(false);
        return;
      }
      const resp = await fetch(`/api/drafts/${encodeURIComponent(draftId)}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: metadata.episodeTitle,
          description: metadata.episodeDescription,
          explicit: metadata.explicit,
          keywords: metadata.keywords ? metadata.keywords.split(',').map(k => k.trim()) : [],
          publishDate: metadata.publishDate || new Date().toISOString().split('T')[0],
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to finalize draft');
      }
      const data = await resp.json();
      try { sessionStorage.removeItem('currentDraftId'); } catch {}
      router.push(`/distribute?podcastId=${encodeURIComponent(data.podcastId)}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to finalize');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 6, px: { xs: 2, sm: 4 } }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 2 }}>
          Finalize Episode
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Preview your audio, fill in episode details, then publish to Telecast.
        </Typography>

        {!draftId && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            No draft found. Please go back to the editor and try again.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Preview */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Preview</Typography>
          {loadingPreview && (
            <Typography variant="body2" color="text.secondary">Loading preview…</Typography>
          )}
          {!loadingPreview && !previewUrl && (
            <Typography variant="body2" color="text.secondary">No preview available.</Typography>
          )}
          {previewUrl && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={togglePlayPause} disabled={!audioEl}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <Slider
                value={Math.min(currentTime, duration || 0)}
                min={0}
                max={duration || 0}
                onChange={onSeek}
                sx={{ flex: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, textAlign: 'right' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Metadata form */}
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Episode Title" fullWidth required value={metadata.episodeTitle} onChange={e => onChange('episodeTitle', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Episode Description" fullWidth multiline minRows={4} required value={metadata.episodeDescription} onChange={e => onChange('episodeDescription', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Episode Number" fullWidth type="number" value={metadata.episodeNumber} onChange={e => onChange('episodeNumber', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Season Number" fullWidth type="number" value={metadata.seasonNumber} onChange={e => onChange('seasonNumber', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Keywords (comma-separated)" fullWidth value={metadata.keywords} onChange={e => onChange('keywords', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Publish Date" fullWidth type="date" value={metadata.publishDate} onChange={e => onChange('publishDate', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={metadata.explicit} onChange={e => onChange('explicit', e.target.checked)} />} label="Explicit Content" />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => router.push('/edit')}>Back to Edit</Button>
            <Button variant="contained" onClick={handleFinalize} disabled={!draftId || submitting}>
              {submitting ? 'Publishing…' : 'Publish to Telecast'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
} 