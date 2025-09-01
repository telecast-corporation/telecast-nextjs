import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Audio proxy test endpoint is working',
    timestamp: new Date().toISOString()
  });
}
