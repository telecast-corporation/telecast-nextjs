// Script to check OAuth configuration
console.log('🔍 Checking OAuth Configuration...\n');

// Check environment variables
const envVars = {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
};

console.log('Environment Variables:');
Object.entries(envVars).forEach(([key, value]) => {
  if (key.includes('SECRET') || key.includes('CLIENT_SECRET')) {
    console.log(`  ${key}: ${value}`);
  } else {
    console.log(`  ${key}: ${value}`);
  }
});

console.log('\n📋 Required Google OAuth Redirect URIs:');
console.log('  Production: https://telecast.ca/api/auth/callback/google');
console.log('  Development: http://localhost:3000/api/auth/callback/google');

console.log('\n🔧 Next Steps:');
console.log('1. Go to Google Cloud Console → APIs & Services → Credentials');
console.log('2. Edit your OAuth 2.0 Client ID');
console.log('3. Add the redirect URIs listed above');
console.log('4. Save the changes');
console.log('5. Wait 5-10 minutes for changes to propagate');

console.log('\n⚠️  Important Notes:');
console.log('- Google OAuth changes can take up to 10 minutes to propagate');
console.log('- Make sure to add BOTH production and development URIs');
console.log('- The redirect URI must match exactly (including protocol and port)'); 