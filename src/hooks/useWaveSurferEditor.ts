import { useEffect, useRef, useState } from 'react';

export interface UseWaveSurferEditorResult {
  isInitialized: boolean;
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
  play: () => void;
  pause: () => void;
  stop: () => void;
  loadUrl: (url: string) => Promise<void>;
  loadBlob: (blob: Blob) => Promise<void>;
  addRegion: (start: number, end: number) => any | null;
  clearRegions: () => void;
}

export function useWaveSurferEditor(
  containerRef: React.RefObject<HTMLDivElement>
): UseWaveSurferEditorResult {
  const wavesurferRef = useRef<any>(null);
  const regionsPluginRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function waitForContainer(maxMs: number = 2000): Promise<void> {
      const start = Date.now();
      while (isMounted && !containerRef.current && Date.now() - start < maxMs) {
        await new Promise((r) => setTimeout(r, 50));
      }
    }

    async function init() {
      try {
        await waitForContainer();
        if (!isMounted || !containerRef.current) return;

        const WaveSurfer = (await import('wavesurfer.js')).default;
        let RegionsPlugin: any;
        try {
          RegionsPlugin = (await import('wavesurfer.js/dist/plugins/regions')).default;
        } catch {
          RegionsPlugin = (await import('wavesurfer.js/plugins/regions')).default;
        }
        const regions = RegionsPlugin.create();
        regionsPluginRef.current = regions;
        const ws = WaveSurfer.create({
          container: containerRef.current,
          waveColor: '#2196f3',
          progressColor: '#1565c0',
          height: 100,
          normalize: true,
          plugins: [regions],
          interact: true,
          hideScrollbar: true,
        });
        wavesurferRef.current = ws;
        if (isMounted) setIsInitialized(true);
        ws.on('ready', () => {
          if (!isMounted) return;
          setDuration(ws.getDuration());
          setIsReady(true);
        });
        ws.on('audioprocess', (t: number) => { if (isMounted) setCurrentTime(t); });
        ws.on('play', () => isMounted && setIsPlaying(true));
        ws.on('pause', () => isMounted && setIsPlaying(false));
        ws.on('finish', () => isMounted && setIsPlaying(false));
        ws.on('error', (e: any) => isMounted && setError(e?.message || 'WaveSurfer error'));
      } catch (e: any) {
        setError(e?.message || 'Failed to initialize audio');
      }
    }
    init();
    return () => {
      isMounted = false;
      try { wavesurferRef.current?.destroy(); } catch {}
      wavesurferRef.current = null;
      regionsPluginRef.current = null;
      setIsInitialized(false);
      setIsReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = () => wavesurferRef.current?.play();
  const pause = () => wavesurferRef.current?.pause();
  const stop = () => { if (wavesurferRef.current) { wavesurferRef.current.pause(); wavesurferRef.current.setTime(0); } };

  const loadUrl = async (url: string): Promise<void> => {
    if (!wavesurferRef.current) throw new Error('Audio not initialized');
    setIsReady(false);
    setError(null);
    return new Promise<void>((resolve, reject) => {
      const ws = wavesurferRef.current;
      const onReady = () => { ws.un('error', onError); resolve(); };
      const onError = (e: any) => { ws.un('ready', onReady); reject(e); };
      ws.once('ready', onReady);
      ws.once('error', onError);
      ws.empty();
      ws.load(url);
    });
  };

  const loadBlob = async (blob: Blob): Promise<void> => {
    if (!wavesurferRef.current) throw new Error('Audio not initialized');
    setIsReady(false);
    setError(null);
    return new Promise<void>((resolve, reject) => {
      const ws = wavesurferRef.current;
      const onReady = () => { ws.un('error', onError); resolve(); };
      const onError = (e: any) => { ws.un('ready', onReady); reject(e); };
      ws.once('ready', onReady);
      ws.once('error', onError);
      ws.empty();
      ws.loadBlob(blob);
    });
  };

  const addRegion = (start: number, end: number) => {
    if (!regionsPluginRef.current) return null;
    try {
      const existing = regionsPluginRef.current.getRegions();
      Object.keys(existing).forEach(id => existing[id].remove());
      return regionsPluginRef.current.addRegion({ start, end, color: 'rgba(255,0,0,0.3)', drag: false, resize: false, id: 'trim-selection' });
    } catch { return null; }
  };

  const clearRegions = () => {
    if (!regionsPluginRef.current) return;
    try { const existing = regionsPluginRef.current.getRegions(); Object.keys(existing).forEach(id => existing[id].remove()); } catch {}
  };

  return { isInitialized, isReady, isPlaying, currentTime, duration, error, play, pause, stop, loadUrl, loadBlob, addRegion, clearRegions };
} 