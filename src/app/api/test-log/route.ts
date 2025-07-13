import { NextResponse } from 'next/server';

export async function GET() {
  console.log("Test log endpoint called at:", new Date().toISOString());
  return NextResponse.json({ message: "Test log endpoint called", timestamp: new Date().toISOString() });
} 