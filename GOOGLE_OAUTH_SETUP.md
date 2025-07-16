# Google OAuth Setup Guide

## Overview
Your application already has Google OAuth partially implemented. I've updated the authentication flow to automatically create accounts for new Google users. Here's how to complete the setup.

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/telecast"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Google OAuth (Required for Google Signup)
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Step 1: Set up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Save and note your Client ID and Client Secret

## Step 2: Generate NextAuth Secret

Generate a secure random string for NEXTAUTH_SECRET:

```bash
# Option 1: Use openssl
openssl rand -base64 32

# Option 2: Use node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 3: Update Environment Variables

Replace the placeholder values in your `.env.local` file with your actual credentials.

## Step 4: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Run the OAuth configuration check:
   ```bash
   node check-oauth-config.js
   ```

3. Visit your signup page and try the "Continue with Google" button

## How Google Signup Works

### For New Users:
1. User clicks "Continue with Google"
2. Google OAuth flow redirects to Google
3. User authorizes your app
4. Google redirects back with user data
5. NextAuth automatically creates a new user account
6. User is logged in and redirected to the main page

### For Existing Users:
1. User clicks "Continue with Google"
2. Google OAuth flow redirects to Google
3. User authorizes your app
4. Google redirects back with user data
5. NextAuth finds existing user and logs them in
6. User is redirected to the main page

## Features Implemented

✅ **Automatic Account Creation**: New Google users get accounts created automatically
✅ **Existing User Login**: Existing users can sign in with Google
✅ **Email Verification**: Google accounts are automatically verified
✅ **Profile Sync**: User name and profile image are synced from Google
✅ **Session Management**: Proper JWT-based sessions
✅ **Error Handling**: Comprehensive error messages for different scenarios

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**:
   - Make sure the redirect URI in Google Console exactly matches your callback URL
   - Include the protocol (http/https) and port number

2. **"Client ID not found" error**:
   - Verify your GOOGLE_CLIENT_ID is correct
   - Make sure you're using the Client ID, not the Client Secret

3. **"Missing environment variables"**:
   - Check that all required environment variables are set
   - Restart your development server after updating .env.local

4. **Database errors**:
   - Run `npx prisma migrate dev` to apply pending migrations
   - Ensure your database is running and accessible

### Testing the Setup:

1. Clear your browser cookies/session
2. Visit your signup page
3. Click "Continue with Google"
4. Complete the Google OAuth flow
5. You should be automatically logged in and redirected to the main page

## Security Notes

- Never commit your `.env.local` file to version control
- Use different OAuth credentials for development and production
- Regularly rotate your NEXTAUTH_SECRET
- Monitor your Google Cloud Console for any suspicious activity

## Next Steps

After setting up Google OAuth, you can:

1. Customize the user experience (welcome messages, onboarding)
2. Add additional OAuth providers (GitHub, Facebook, etc.)
3. Implement user profile management
4. Add premium features and subscription handling 