// Utility functions for audio processing and conversion

// Convert AudioBuffer to WAV format
export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  
  // WAV header size (44 bytes)
  const headerSize = 44;
  const dataSize = length * numChannels * 2; // 16-bit samples
  const fileSize = headerSize + dataSize - 8;
  
  const arrayBuffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(arrayBuffer);
  
  // Write WAV header
  let offset = 0;
  
  // RIFF chunk descriptor
  view.setUint32(offset, 0x52494646, false); // "RIFF"
  offset += 4;
  view.setUint32(offset, fileSize, true); // File size
  offset += 4;
  view.setUint32(offset, 0x57415645, false); // "WAVE"
  offset += 4;
  
  // fmt sub-chunk
  view.setUint32(offset, 0x666D7420, false); // "fmt "
  offset += 4;
  view.setUint32(offset, 16, true); // Subchunk1Size (16 for PCM)
  offset += 4;
  view.setUint16(offset, 1, true); // AudioFormat (1 for PCM)
  offset += 2;
  view.setUint16(offset, numChannels, true); // NumChannels
  offset += 2;
  view.setUint32(offset, sampleRate, true); // SampleRate
  offset += 4;
  view.setUint32(offset, sampleRate * numChannels * 2, true); // ByteRate
  offset += 4;
  view.setUint16(offset, numChannels * 2, true); // BlockAlign
  offset += 2;
  view.setUint16(offset, 16, true); // BitsPerSample
  offset += 2;
  
  // data sub-chunk
  view.setUint32(offset, 0x64617461, false); // "data"
  offset += 4;
  view.setUint32(offset, dataSize, true); // Subchunk2Size
  offset += 4;
  
  // Write audio data
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample * 0x7FFF, true); // Convert to 16-bit
      offset += 2;
    }
  }
  
  return arrayBuffer;
}

// Convert any audio file to WAV format
export async function convertAudioToWav(audioFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const wavBuffer = audioBufferToWav(audioBuffer);
        const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        resolve(wavBlob);
      } catch (error) {
        reject(error);
      } finally {
        audioContext.close();
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.readAsArrayBuffer(audioFile);
  });
}

// Convert recorded audio blob to WAV format
export async function convertRecordedAudioToWav(audioBlob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const wavBuffer = audioBufferToWav(audioBuffer);
        const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        resolve(wavBlob);
      } catch (error) {
        reject(error);
      } finally {
        audioContext.close();
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read recorded audio'));
    reader.readAsArrayBuffer(audioBlob);
  });
} 