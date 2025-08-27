"use client";

import React, { useRef, useState, useEffect } from "react";
import { Box, Button, Typography, Paper, CircularProgress, IconButton } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";

export default function UploadPodcastPage() {
  const router = useRouter();
  const params = useParams();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [waveSurfer, setWaveSurfer] = useState<any>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const [waveReady, setWaveReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioFile && waveformRef.current) {
      setWaveReady(false);
      setLoading(true);
      // Clean up previous instance
      if (waveSurfer) {
        waveSurfer.destroy();
      }
      // Dynamically import and create wavesurfer instance
      import("wavesurfer.js").then((WaveSurferModule) => {
        const WaveSurfer = WaveSurferModule.default;
        const ws = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: "#2196f3",
          progressColor: "#1565c0",
          height: 80,
          cursorColor: "#1565c0",
          barWidth: 2,
          barGap: 1,
          interact: true,
        });
        setWaveSurfer(ws);
        const reader = new FileReader();
        reader.onload = (e) => {
          ws.loadBlob(new Blob([e.target?.result as ArrayBuffer], { type: audioFile.type }));
        };
        reader.readAsArrayBuffer(audioFile);
        ws.on("ready", () => {
          setWaveReady(true);
          setLoading(false);
        });
        ws.on("play", () => {
          setIsPlaying(true);
        });
        ws.on("pause", () => {
          setIsPlaying(false);
        });
        ws.on("finish", () => {
          setIsPlaying(false);
        });
      }).catch((err) => {
        console.error("Failed to load wavesurfer:", err);
        setError("Failed to load waveform library");
        setLoading(false);
      });
    }
    // Cleanup on unmount
    return () => {
      if (waveSurfer) {
        waveSurfer.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!audioFile) return;
    
    setUploading(true);
    setError("");

    try {
      console.log('[Upload] Draft flow start', {
        podcastId: params.id,
        file: { name: audioFile.name, type: audioFile.type, size: audioFile.size }
      });

      // Create draft and get upload URL
      const createDraftResp = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podcastId: params.id, contentType: audioFile.type || 'audio/wav' }),
      });
      console.log('[Upload] Create draft status', createDraftResp.status);
      if (!createDraftResp.ok) {
        const msg = await createDraftResp.text().catch(() => '');
        throw new Error(`Failed to create draft: ${msg}`);
      }
      const { draftId, uploadUrl } = await createDraftResp.json();
      if (!draftId || !uploadUrl) throw new Error('Invalid draft response');
      console.log('[Upload] Draft created', { draftId });

      // Upload file directly to GCS
      console.log('[Upload] PUT to signed URL');
      const putResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': audioFile.type || 'application/octet-stream' },
        body: audioFile,
      });
      console.log('[Upload] PUT status', putResp.status);
      if (!putResp.ok) {
        const text = await putResp.text().catch(() => '');
        throw new Error(`Failed to upload: ${putResp.status} ${text}`);
      }

      setUploading(false);
      console.log('[Upload] Navigating to /edit?draft=...');
      router.push(`/edit?draft=${encodeURIComponent(draftId)}`);
    } catch (err) {
      console.error("[Upload] Draft upload error", err);
      setError(err instanceof Error ? err.message : "Failed to upload audio file");
      setUploading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", py: 6, px: 2 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ color: "#2196f3", fontWeight: 700, mb: 3, textAlign: "center" }}>
          Upload Podcast Audio
        </Typography>
        <Box sx={{ textAlign: "center" }}>
          {!audioFile && (
            <>
              <Button
                variant="outlined"
                component="label"
                sx={{ py: 3, px: 4, borderStyle: "dashed", borderWidth: 2, minWidth: 300, height: 120, mb: 2 }}
              >
                Click to select audio file
                <input type="file" accept="audio/*" onChange={handleFileChange} hidden />
              </Button>
              <Typography variant="body2" color="text.secondary">
                Supported formats: MP3, WAV, M4A
              </Typography>
            </>
          )}

          {audioFile && (
            <>
              <Typography variant="body1" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
                ✓ Audio file loaded: {audioFile.name}
              </Typography>
              <Box 
                ref={waveformRef} 
                sx={{ 
                  width: "100%", 
                  minHeight: 90, 
                  mb: 2, 
                  borderRadius: 2, 
                  bgcolor: "rgba(33,150,243,0.05)", 
                  border: "1px solid #2196f3", 
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(33,150,243,0.08)"
                  }
                }} 
              />
              {loading && <CircularProgress sx={{ mt: 2 }} />}
              {waveReady && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <IconButton
                    onClick={() => waveSurfer.isPlaying() ? waveSurfer.pause() : waveSurfer.play()}
                    sx={{ 
                      border: "2px solid #2196f3",
                      color: "#2196f3",
                      width: 56,
                      height: 56,
                      "&:hover": { 
                        borderColor: "#1565c0", 
                        color: "#1565c0",
                        bgcolor: "rgba(33,150,243,0.08)"
                      }
                    }}
                  >
                    {isPlaying ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
                  </IconButton>
                </Box>
              )}
              <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "center" }}>
                <Button 
                  variant="contained" 
                  onClick={handleUpload}
                  disabled={uploading}
                  sx={{ 
                    bgcolor: "#2196f3", 
                    "&:hover": { bgcolor: "#1565c0" },
                    minWidth: 120
                  }}
                >
                  {uploading ? <CircularProgress size={20} color="inherit" /> : "Proceed to Edit"}
                </Button>
                <Button variant="outlined" onClick={() => setAudioFile(null)}>
                  Choose another file
                </Button>
              </Box>
            </>
          )}

          {error && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(244, 67, 54, 0.1)", borderRadius: 1, border: "1px solid rgba(244, 67, 54, 0.3)" }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
} 