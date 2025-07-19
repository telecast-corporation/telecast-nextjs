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