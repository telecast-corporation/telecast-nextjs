'use client';

import { AudioProvider } from '@/contexts/AudioContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      {children}
    </AudioProvider>
  );
} 