export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string | number): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Check if a user has cancelled their premium subscription in the current billing period
 * @param premiumExpiresAt - The date when premium expires
 * @returns boolean indicating if the user has cancelled in current period
 */
export function hasCancelledInCurrentPeriod(premiumExpiresAt: Date | null): boolean {
  if (!premiumExpiresAt) return false;
  
  const now = new Date();
  const expiryDate = new Date(premiumExpiresAt);
  
  // If premium expires within 24 hours, consider it as cancelled in current period
  return expiryDate < new Date(now.getTime() + 24 * 60 * 60 * 1000);
}

/**
 * Convert audio URLs to proxy URLs for better CORS handling
 * @param audioUrl - The original audio URL
 * @returns The proxy URL or original URL if already a proxy/external URL
 */
export function getAudioProxyUrl(audioUrl: string): string {
  if (!audioUrl) return '';
  
  // If it's already a proxy URL, return as is
  if (audioUrl.includes('/api/audio/')) {
    return audioUrl;
  }
  
  // If it's already a full URL (signed URL), use it directly
  if (audioUrl.startsWith('http')) {
    return audioUrl;
  }
  
  // If it's a file path (stored in database), convert to proxy URL
  if (audioUrl.startsWith('podcasts/')) {
    return `/api/audio/${encodeURIComponent(audioUrl)}`;
  }
  
  // For any other URL, return as is
  return audioUrl;
} 

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}