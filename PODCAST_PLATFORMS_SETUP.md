# Podcast Platform OAuth Setup Guide

This guide will help you set up OAuth authentication for broadcasting to Spotify, Apple Podcasts, and Google Podcasts.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Existing variables (keep these)
DATABASE_URL="postgresql://username:password@localhost:5432/telecast"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# New podcast platform variables
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"
GOOGLE_PODCAST_CLIENT_ID="your-google-podcast-client-id"
GOOGLE_PODCAST_CLIENT_SECRET="your-google-podcast-client-secret"
```

## Platform Setup Instructions

### 1. Spotify Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/auth/podcast-platforms/spotify/callback`
4. Copy Client ID and Client Secret to your `.env.local`

**Note**: Spotify doesn't have a direct podcast API, but we can create playlists. For actual podcast distribution, you'll need to apply for Spotify's podcast partner program.

### 2. Apple Podcasts Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create a new App ID
3. Enable "Sign In with Apple" capability
4. Create a Services ID for your app
5. Add redirect URI: `http://localhost:3000/api/auth/podcast-platforms/apple/callback`
6. Copy Client ID and Client Secret to your `.env.local`

**Note**: Apple Podcasts Connect API requires special access. The current implementation provides a foundation for when you get approved access.

### 3. Google Podcasts Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/api/auth/podcast-platforms/google/callback`
6. Copy Client ID and Client Secret to your `.env.local`

**Note**: Google Podcasts pulls from YouTube, so we upload episodes as YouTube videos.

## How It Works

### Persistent Authentication Flow

1. **User clicks "Connect"** on a platform card (one-time setup)
2. **OAuth redirect** to platform's authorization page
3. **User authorizes** the application
4. **Callback** stores access token and refresh token in database
5. **Platform status** updates to show "Connected"
6. **Tokens are automatically refreshed** when needed
7. **User never needs to re-authenticate** unless they disconnect

### Broadcasting Flow

#### Standard Broadcasting
1. **User fills out** episode information
2. **User selects** platforms to broadcast to
3. **Episode is finalized** and saved to Telecast
4. **Platform APIs** are called with episode data
5. **Results are shown** to user

#### Quick Broadcasting
1. **User clicks "Quick Broadcast"** button on any episode
2. **System automatically** uses previously connected platforms
3. **Episode is broadcast** to all remembered platforms
4. **No additional setup** required after initial connection

### Token Management

- **Automatic Refresh**: Tokens are refreshed 5 minutes before expiration
- **Persistent Sessions**: Users stay connected indefinitely
- **Graceful Degradation**: If refresh fails, user is prompted to reconnect
- **Secure Storage**: All tokens are encrypted in the database

### Platform-Specific Features

#### Spotify
- Creates playlists with episode information
- Requires Spotify podcast partner program for actual podcast distribution
- Uses Spotify Web API

#### Apple Podcasts
- Currently provides mock responses
- Requires Apple Podcasts Connect API access
- Would upload episodes to iTunes Connect

#### Google Podcasts
- Uploads episodes as YouTube videos
- Uses YouTube Data API v3
- Episodes appear in Google Podcasts via YouTube

## Database Schema

The system uses the existing `Account` table to store platform connections:

```sql
-- Each user can have multiple platform connections
Account {
  id: String
  userId: String
  provider: String (spotify, apple, google_podcast)
  providerAccountId: String
  access_token: String
  refresh_token: String
  expires_at: Int
  scope: String
}
```

## API Endpoints

### Authentication
- `GET /api/auth/podcast-platforms/[platform]` - Start OAuth flow
- `GET /api/auth/podcast-platforms/[platform]/callback` - OAuth callback
- `GET /api/auth/podcast-platforms/status` - Check connection status (with auto-refresh)
- `DELETE /api/auth/podcast-platforms/[platform]/disconnect` - Disconnect platform
- `POST /api/auth/podcast-platforms/remember` - Remember platform preferences

### Broadcasting
- `POST /api/broadcast/platforms` - Broadcast episode to selected platforms
- `POST /api/broadcast/quick` - Quick broadcast using remembered platforms

## Security Considerations

1. **Access tokens** are stored encrypted in the database
2. **Token expiration** is handled automatically
3. **User ownership** is verified for all operations
4. **OAuth state** prevents CSRF attacks
5. **Environment variables** should never be committed to version control

## Testing

1. **Start development server**: `npm run dev`
2. **Visit broadcast page**: `http://localhost:3000/broadcast`
3. **Click "Connect"** on platform cards
4. **Complete OAuth flow** for each platform
5. **Test broadcasting** with a sample episode

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check that redirect URIs match exactly in platform settings
   - Include protocol (http/https) and port number

2. **"Client ID not found"**
   - Verify environment variables are set correctly
   - Restart development server after updating `.env.local`

3. **"Access denied"**
   - Check that user is authenticated
   - Verify episode ownership

4. **"Platform not connected"**
   - Complete OAuth flow for the platform
   - Check platform status API response

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```bash
DEBUG=true
```

This will log OAuth flows and API calls to the console.

## Production Deployment

1. **Update redirect URIs** to your production domain
2. **Use production OAuth credentials** for each platform
3. **Set up proper SSL certificates** (required for OAuth)
4. **Configure environment variables** in your hosting platform
5. **Test OAuth flows** in production environment

## Next Steps

1. **Apply for platform partnerships** (Spotify, Apple)
2. **Implement token refresh** for long-lived sessions
3. **Add analytics** for broadcast success rates
4. **Create dashboard** for managing platform connections
5. **Add bulk operations** for multiple episodes

## Support

For issues with specific platforms:
- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3) 