"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Box, Button, Typography, Paper, CircularProgress } from "@mui/material";

// Dynamically import wavesurfer.js to avoid SSR issues
const WaveSurfer = dynamic(() => import("wavesurfer.js"), { ssr: false });

export default function UploadPodcastPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [waveSurfer, setWaveSurfer] = useState<any>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const [waveReady, setWaveReady] = useState(false);

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
        const ws = WaveSurferModule.default.create({
          container: waveformRef.current!,
          waveColor: "#2196f3",
          progressColor: "#1565c0",
          height: 80,
          responsive: true,
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
        ws.on("error", (err: any) => {
          setError("Failed to render waveform");
          setLoading(false);
        });
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
              <Box ref={waveformRef} sx={{ width: "100%", minHeight: 90, mb: 2, borderRadius: 2, bgcolor: "rgba(33,150,243,0.05)", border: "1px solid #2196f3" }} />
              {loading && <CircularProgress sx={{ mt: 2 }} />}
              {waveReady && (
                <audio controls src={URL.createObjectURL(audioFile)} style={{ width: "100%", marginTop: 16 }} />
              )}
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setAudioFile(null)}>
                Choose another file
              </Button>
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