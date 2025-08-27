'use client';

import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else {
        // Redirect to finalize page
        router.push('/finalize');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return null;
  }

  return null; // This page will redirect, so no content needed
} 