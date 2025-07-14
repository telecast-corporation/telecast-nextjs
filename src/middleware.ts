import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Exclude Stripe webhook from auth
  if (request.nextUrl.pathname.startsWith('/api/payment/webhook')) {
    return NextResponse.next();
  }

  // ... your existing auth logic ...
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/settings/:path*',
    // Add other protected routes here
  ],
}; 