'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  Slider,
} from '@mui/material';
import { PlayArrow as PlayIcon, Pause as PauseIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

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

export default function BroadcastPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [metadata, setMetadata] = useState<Metadata>(DEFAULT_METADATA);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [finalizedPodcastId, setFinalizedPodcastId] = useState<string | null>(null);
  const [finalizedEpisodeId, setFinalizedEpisodeId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = typeof window !== 'undefined' ? (window as any)._broadcastAudioRef || null : null;
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(audioRef);

  const formatTime = (sec: number) => {
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    const m = Math.floor(sec / 60).toString();
    return `${m}:${s}`;
  };

  useEffect(() => {
    const q = searchParams.get('draft');
    let id = q || null;
    if (!id) {
      try { id = sessionStorage.getItem('currentDraftId'); } catch {}
    }
    setDraftId(id);
  }, [searchParams]);

  // Pre-publish preview from draft
  useEffect(() => {
    (async () => {
      if (!draftId) return;
      // Fetch draft info to get podcastId so feeds can be shown pre-publish
      try {
        const info = await fetch(`/api/drafts/${encodeURIComponent(draftId)}`);
        if (info.ok) {
          const dj = await info.json();
          if (dj.podcastId) setFinalizedPodcastId(dj.podcastId);
        }
      } catch {}
      if (finalizedPodcastId) return;
      try {
        let res = await fetch(`/api/drafts/${encodeURIComponent(draftId)}/read-url?which=edited`);
        if (!res.ok) res = await fetch(`/api/drafts/${encodeURIComponent(draftId)}/read-url?which=original`);
        if (res.ok) {
          const data = await res.json();
          setPreviewUrl(data.readUrl || null);
        }
      } catch {}
    })();
  }, [draftId, finalizedPodcastId]);

  // Keep audio element in sync with previewUrl
  useEffect(() => {
    if (!previewUrl) return;
    const el = new Audio(previewUrl);
    el.addEventListener('loadedmetadata', () => setDuration(el.duration || 0));
    el.addEventListener('timeupdate', () => setCurrentTime(el.currentTime || 0));
    el.addEventListener('ended', () => setIsPlaying(false));
    setAudioEl(el);
    // store globally to avoid recreation on fast re-renders
    try { (window as any)._broadcastAudioRef = el; } catch {}
    return () => {
      try {
        el.pause();
        el.src = '';
      } catch {}
    };
  }, [previewUrl]);

  const onChange = (field: keyof Metadata, value: string | boolean) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleFinalize = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
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
      setFinalizedPodcastId(data.podcastId || null);
      setFinalizedEpisodeId(data.episodeId || null);
      setSuccessMsg('Your episode has been published to Telecast.');
      // Fetch preview URL for latest episode
      if (data.podcastId) {
        try {
          const p = await fetch(`/api/podcast/${encodeURIComponent(data.podcastId)}/preview`);
          if (p.ok) {
            const jp = await p.json();
            setPreviewUrl(jp.previewUrl);
          }
        } catch {}
      }
      try { sessionStorage.removeItem('currentDraftId'); } catch {}
    } catch (e: any) {
      setError(e?.message || 'Failed to finalize');
    } finally {
      setSubmitting(false);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://telecast.ca';
  const feedUrl = (platform: 'spotify' | 'apple' | 'podcastindex') =>
    finalizedPodcastId ? `${baseUrl}/api/podcast/${encodeURIComponent(finalizedPodcastId)}/rss/${platform}` : '';

  return (
    <Box sx={{ minHeight: '100vh', py: 6, px: { xs: 2, sm: 4 }, bgcolor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#f8fafc' }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 2, color: theme.palette.primary.main }}>
          Broadcast Your Podcast
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Finalize your draft and submit to platforms.
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
        {successMsg && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMsg}
          </Alert>
        )}

        {/* Episode Metadata */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Episode Details
          </Typography>
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

        {/* Platform Feeds & Submission */}
        {previewUrl && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Preview
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                color="primary"
                onClick={() => {
                  if (!audioEl) return;
                  if (isPlaying) {
                    audioEl.pause();
                    setIsPlaying(false);
                  } else {
                    audioEl.play();
                    setIsPlaying(true);
                  }
                }}
                disabled={!audioEl}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <Slider
                min={0}
                max={duration || 0}
                value={Math.min(currentTime, duration || 0)}
                onChange={(_, v) => {
                  if (!audioEl) return;
                  const val = Array.isArray(v) ? v[0] : v;
                  audioEl.currentTime = Number(val);
                  setCurrentTime(Number(val));
                }}
                sx={{ flex: 1 }}
                disabled={!audioEl}
              />
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 88, textAlign: 'right' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Box>
          </Paper>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700}>Spotify</Typography>
                <Typography variant="body2" sx={{ mt: 1, wordBreak: 'break-all' }}>
                  {finalizedPodcastId ? feedUrl('spotify') : 'Create a podcast to get your feed URL.'}
                </Typography>
                <Button sx={{ mt: 2 }} variant="outlined" size="small" onClick={() => window.open('https://podcasters.spotify.com/submit', '_blank')}>
                  Open Spotify for Podcasters
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700}>Apple Podcasts</Typography>
                <Typography variant="body2" sx={{ mt: 1, wordBreak: 'break-all' }}>
                  {finalizedPodcastId ? feedUrl('apple') : 'Create a podcast to get your feed URL.'}
                </Typography>
                <Button sx={{ mt: 2 }} variant="outlined" size="small" onClick={() => window.open('https://podcastsconnect.apple.com/my-podcasts/new', '_blank')}>
                  Open Apple Podcasts Connect
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700}>Podcast Index</Typography>
                <Typography variant="body2" sx={{ mt: 1, wordBreak: 'break-all' }}>
                  {finalizedPodcastId ? feedUrl('podcastindex') : 'Create a podcast to get your feed URL.'}
                </Typography>
                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  size="small"
                  disabled={!finalizedPodcastId}
                  onClick={async () => {
                    if (!finalizedPodcastId) return;
                    try {
                      const res = await fetch(`/api/podcast/${encodeURIComponent(finalizedPodcastId)}/podcast-index/submit`, { method: 'POST' });
                      if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error || 'Submit failed');
                      }
                      alert('Submitted to Podcast Index successfully!');
                    } catch (err: any) {
                      alert(`Failed to submit to Podcast Index: ${err?.message || 'Unknown error'}`);
                    }
                  }}
                >
                  Submit to Podcast Index
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
} 