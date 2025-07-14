import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Test log endpoint called", timestamp: new Date().toISOString() });
} 