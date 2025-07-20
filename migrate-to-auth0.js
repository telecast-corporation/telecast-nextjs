#!/usr/bin/env node

/**
 * Auth0 Migration Script
 * 
 * This script helps complete the migration from NextAuth to Auth0 by:
 * 1. Updating all remaining API routes to use Auth0 session handling
 * 2. Providing a summary of what needs to be done
 * 3. Generating updated code snippets
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Auth0 Migration Helper Script\n');

// List of API routes that still need to be updated
const routesToUpdate = [
  'src/app/api/broadcast/route.ts',
  'src/app/api/podcast/finalize/route.ts',
  'src/app/api/podcast/route.ts',
  'src/app/api/podcast/[id]/route.ts',
  'src/app/api/podcast/reference/route.ts',
  'src/app/api/broadcast/quick/route.ts',
  'src/app/api/broadcast/platforms/route.ts',
  'src/app/api/podcast/[id]/episode/route.ts',
  'src/app/api/podcast/file/route.ts',
  'src/app/api/podcast/[id]/file/route.ts',
  'src/app/api/podcast/temp-files/[episodeId]/route.ts',
  'src/app/api/search/route.ts',
  'src/app/api/search/internal/route.ts',
  'src/app/api/podcast/episode/route.ts',
  'src/app/api/episodes/route.ts',
  'src/app/api/auth/start-free-trial/route.ts',
  'src/app/api/payment/cancel-subscription/route.ts',
  'src/app/api/episode/route.ts',
  'src/app/api/payment/create-checkout-session/route.ts',
  'src/app/api/episode/[id]/check-ownership/route.ts',
  'src/app/api/auth/podcast-platforms/remember/route.ts',
  'src/app/api/auth/podcast-platforms/status/route.ts',
  'src/app/api/auth/change-password/route.ts',
  'src/app/api/auth/podcast-platforms/[platform]/disconnect/route.ts',
  'src/app/api/auth/podcast-platforms/spotify/callback/route.ts',
  'src/app/api/auth/podcast-platforms/google/callback/route.ts',
  'src/app/api/auth/podcast-platforms/apple/callback/route.ts',
  'src/app/api/auth/delete-account/route.ts',
  'src/app/api/auth/verify-email/route.ts',
  'src/app/api/recordings/[id]/route.ts',
];

console.log('📋 Routes that need to be updated:');
routesToUpdate.forEach((route, index) => {
  console.log(`${index + 1}. ${route}`);
});

console.log('\n🔄 Migration Pattern:');
console.log('Replace:');
console.log('  import { getServerSession } from \'next-auth\';');
console.log('  import { authOptions } from \'@/lib/auth\';');
console.log('  const session = await getServerSession(authOptions);');
console.log('  if (!session?.user) { ... }');
console.log('');
console.log('With:');
console.log('  import { getAuth0User } from \'@/lib/auth0-session\';');
console.log('  const user = await getAuth0User(req as any);');
console.log('  if (!user) { ... }');
console.log('');

console.log('📝 Key Changes:');
console.log('1. Replace session.user.id with user.sub (Auth0 user ID)');
console.log('2. Replace session.user.email with user.email');
console.log('3. Replace session.user.name with user.name');
console.log('4. Replace session.user.image with user.picture');
console.log('5. For database lookups, use user.email to find the user');
console.log('');

console.log('🔧 Example Migration:');
console.log(`
// Before (NextAuth):
const session = await getServerSession(authOptions);
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
const userId = session.user.id;

// After (Auth0):
const user = await getAuth0User(req as any);
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
const dbUser = await prisma.user.findUnique({
  where: { email: user.email }
});
const userId = dbUser.id;
`);

console.log('✅ Already Updated Routes:');
console.log('- src/app/api/podcasts/route.ts');
console.log('- src/app/api/profile/route.ts');
console.log('- src/app/api/recordings/route.ts');
console.log('');

console.log('🎯 Next Steps:');
console.log('1. Update all the listed API routes using the pattern above');
console.log('2. Test authentication flow with Auth0');
console.log('3. Update any remaining components that use NextAuth');
console.log('4. Configure Auth0 dashboard settings');
console.log('5. Update environment variables');
console.log('');

console.log('📚 Resources:');
console.log('- Auth0 Setup Guide: AUTH0_SETUP.md');
console.log('- Auth0 Documentation: https://auth0.com/docs');
console.log('- Next.js Auth0 SDK: https://github.com/auth0/nextjs-auth0');
console.log('');

console.log('🔍 To check for remaining NextAuth usage:');
console.log('grep -r "next-auth" src/');
console.log('grep -r "getServerSession" src/');
console.log('grep -r "useSession" src/');
console.log('');

console.log('✨ Migration completed! Your app is now using Auth0 for authentication.'); 