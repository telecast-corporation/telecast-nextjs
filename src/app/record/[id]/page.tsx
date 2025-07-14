"use client";

import React, { useRef, useState, useEffect } from "react";
import { Box, Button, Typography, Paper, CircularProgress, IconButton } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { Mic, Stop, PlayArrow, Pause } from "@mui/icons-material";

export default function RecordPodcastPage() {
  const router = useRouter();
  const params = useParams();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [waveSurfer, setWaveSurfer] = useState<any>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize recording timer
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (audioBlob && waveformRef.current) {
      setLoading(true);
      setError("");
      
      // Clean up previous instance
      if (waveSurfer) {
        waveSurfer.destroy();
        setWaveSurfer(null);
      }
      
      // Dynamically import and create wavesurfer instance
      import("wavesurfer.js").then((WaveSurferModule) => {
        try {
          const WaveSurfer = WaveSurferModule.default;
          const ws = WaveSurfer.create({
            container: waveformRef.current!,
            waveColor: "#2196f3",
            progressColor: "#1565c0",
            height: 80,
            responsive: true,
            normalize: true,
            cursorWidth: 0,
          });
          
          setWaveSurfer(ws);
          
          // Convert blob to array buffer for wavesurfer
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              ws.loadBlob(audioBlob);
            }
          };
          reader.readAsArrayBuffer(audioBlob);
          
          ws.on("ready", () => {
            console.log("Waveform ready");
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
          
          ws.on("error", (err: any) => {
            console.error("Waveform error:", err);
            setError("Failed to render waveform");
            setLoading(false);
          });
          
          ws.on("loading", () => {
            console.log("Waveform loading...");
          });
          
        } catch (err) {
          console.error("Failed to create wavesurfer:", err);
          setError("Failed to create waveform");
          setLoading(false);
        }
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
  }, [audioBlob]);

  const startRecording = async () => {
    try {
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        setError("MediaRecorder is not supported in this browser.");
        return;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Get supported MIME types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4') 
        ? 'audio/mp4' 
        : 'audio/wav';

      console.log('Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('Recording stopped, chunks:', chunks.length);
        const blob = new Blob(chunks, { type: mimeType });
        console.log('Created blob:', blob.size, 'bytes');
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setIsPlaying(false); // Ensure button shows pause state initially
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError("Recording failed. Please try again.");
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      setError("");
      console.log('Recording started');
    } catch (err) {
      console.error('Recording error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError("Microphone access denied. Please allow microphone permissions and try again.");
        } else if (err.name === 'NotFoundError') {
          setError("No microphone found. Please connect a microphone and try again.");
        } else {
          setError(`Recording failed: ${err.message}`);
        }
      } else {
        setError("Failed to access microphone. Please check permissions.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (waveSurfer) {
      waveSurfer.play();
      setIsPlaying(true);
    } else if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (waveSurfer) {
      waveSurfer.pause();
      setIsPlaying(false);
    } else if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleProceedToEdit = async () => {
    if (audioBlob) {
      setUploading(true);
      setError("");
      
      try {
        // Convert blob to file
        const audioFile = new File([audioBlob], "recorded-audio.wav", {
          type: "audio/wav",
          lastModified: Date.now(),
        });
        
        // Generate reference ID for this recording
        const referenceResponse = await fetch("/api/podcast/reference", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            podcastId: params.id,
          }),
        });

        if (!referenceResponse.ok) {
          throw new Error("Failed to generate reference ID");
        }

        const referenceData = await referenceResponse.json();
        const referenceId = referenceData.referenceId;
        
        const formData = new FormData();
        formData.append("file", audioFile);
        formData.append("podcastId", params.id);
        formData.append("referenceId", referenceId);

        const response = await fetch("/api/podcast/upload/temp", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const result = await response.json();
        console.log("Temporary upload successful:", result);
        
        // Store reference info for the edit page
        sessionStorage.setItem("editSession", JSON.stringify({
          referenceId: referenceId,
          tempFileName: result.tempFileName,
          tempUrl: result.tempUrl,
          tempPath: result.tempPath,
          podcastId: params.id,
          originalFileName: audioFile.name,
        }));
        
        // Navigate to edit page
        setUploading(false);
        router.push("/edit");
      } catch (err) {
        console.error("Upload error:", err);
        setError(err instanceof Error ? err.message : "Failed to upload audio file");
        setUploading(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", py: 6, px: 2 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ color: "#2196f3", fontWeight: 700, mb: 3, textAlign: "center" }}>
          Record Podcast Audio
        </Typography>
        
        <Box sx={{ textAlign: "center", mb: 4 }}>
          {!audioBlob && (
            <Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Click the microphone to start recording your podcast
              </Typography>
              
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mb: 3 }}>
                <IconButton
                  onClick={startRecording}
                  disabled={isRecording}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: isRecording ? "#f44336" : "#2196f3",
                    color: "white",
                    "&:hover": {
                      bgcolor: isRecording ? "#d32f2f" : "#1565c0",
                    },
                    "&:disabled": {
                      bgcolor: "#ccc",
                    },
                  }}
                >
                  <Mic sx={{ fontSize: 40 }} />
                </IconButton>
                
                {isRecording && (
                  <IconButton
                    onClick={stopRecording}
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: "#f44336",
                      color: "white",
                      "&:hover": {
                        bgcolor: "#d32f2f",
                      },
                    }}
                  >
                    <Stop sx={{ fontSize: 30 }} />
                  </IconButton>
                )}
              </Box>
              
              {isRecording && (
                <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
                  Recording: {formatTime(recordingTime)}
                </Typography>
              )}
            </Box>
          )}

          {audioBlob && (
            <>
              <Typography variant="body1" color="success.main" sx={{ fontWeight: 600, mb: 2 }}>
                ✓ Recording completed! ({formatTime(recordingTime)})
              </Typography>
              
              <Box ref={waveformRef} sx={{ width: "100%", minHeight: 90, mb: 2, borderRadius: 2, bgcolor: "rgba(33,150,243,0.05)", border: "1px solid #2196f3" }} />
              
              {loading && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Generating waveform...
                  </Typography>
                </Box>
              )}
              
              {!loading && !waveSurfer && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(255, 152, 0, 0.1)", borderRadius: 1, border: "1px solid rgba(255, 152, 0, 0.3)" }}>
                  <Typography variant="body2" color="warning.main">
                    Waveform preview not available, but audio playback works
                  </Typography>
                </Box>
              )}
              
                              {!loading && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 2 }}>
                      <IconButton
                        onClick={isPlaying ? pauseAudio : playAudio}
                        sx={{
                          bgcolor: "#2196f3",
                          color: "white",
                          "&:hover": { bgcolor: "#1565c0" },
                        }}
                      >
                        {isPlaying ? <Pause /> : <PlayArrow />}
                      </IconButton>
                    </Box>
                  
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                    <Button
                      variant="contained"
                      onClick={handleProceedToEdit}
                      disabled={uploading}
                      sx={{
                        bgcolor: "#2196f3",
                        "&:hover": { bgcolor: "#1565c0" },
                        minWidth: 120,
                      }}
                    >
                      {uploading ? <CircularProgress size={20} color="inherit" /> : "Proceed to Edit"}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioUrl(null);
                        setRecordingTime(0);
                        if (waveSurfer) {
                          waveSurfer.destroy();
                          setWaveSurfer(null);
                        }
                      }}
                    >
                      Restart
                    </Button>
                  </Box>
                </Box>
              )}
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
 
 