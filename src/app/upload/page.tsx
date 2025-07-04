'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Redirect to broadcast page since upload is now integrated there
      router.push('/broadcast');
    }
  }, [status, router]);

  if (status === 'loading') {
    return null;
  }

  return null; // This page will redirect, so no content needed
} 