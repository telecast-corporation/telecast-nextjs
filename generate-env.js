#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔧 Google OAuth Environment Setup Helper\n');

// Generate NextAuth secret
const nextAuthSecret = crypto.randomBytes(32).toString('base64');

console.log('📋 Required Environment Variables:');
console.log('=====================================\n');

console.log('# Database (update with your actual database URL)');
console.log('DATABASE_URL="postgresql://username:password@localhost:5432/telecast"\n');

console.log('# NextAuth Configuration');
console.log(`NEXTAUTH_URL="http://localhost:3000"`);
console.log(`NEXTAUTH_SECRET="${nextAuthSecret}"\n`);

console.log('# Google OAuth (Required for Google Signup)');
console.log('# Get these from Google Cloud Console → APIs & Services → Credentials');
console.log('GOOGLE_CLIENT_ID="your-google-client-id-here"');
console.log('GOOGLE_CLIENT_SECRET="your-google-client-secret-here"\n');

console.log('# Base URL');
console.log('NEXT_PUBLIC_BASE_URL="http://localhost:3000"\n');

console.log('📝 Instructions:');
console.log('1. Copy the above variables to your .env.local file');
console.log('2. Replace placeholder values with your actual credentials');
console.log('3. Get Google OAuth credentials from: https://console.cloud.google.com/');
console.log('4. Add redirect URIs: http://localhost:3000/api/auth/callback/google');
console.log('5. Restart your development server after updating .env.local\n');

console.log('✅ NextAuth Secret generated automatically above');
console.log('🔑 Google OAuth credentials need to be obtained from Google Cloud Console'); 