# Auth0 Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Auth0 Configuration
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
APP_BASE_URL='http://localhost:3000'
AUTH0_DOMAIN='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your_client_id'
AUTH0_CLIENT_SECRET='your_client_secret'

# Optional: For API authorization
AUTH0_AUDIENCE='your_auth_api_identifier'
AUTH0_SCOPE='openid profile email read:shows'
```

## Generate AUTH0_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -hex 32
```

## Auth0 Dashboard Setup

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application or use existing one
3. Set Application Type to "Regular Web Application"
4. Configure the following URLs:

### Allowed Callback URLs:
```
http://localhost:3000/auth/callback
```

### Allowed Logout URLs:
```
http://localhost:3000
```

### Allowed Web Origins:
```
http://localhost:3000
```

## Social Connections

To enable Google OAuth:
1. Go to Authentication > Social
2. Enable Google
3. Configure Google OAuth credentials
4. Add Google connection to your application

## Custom Claims (Optional)

To add custom claims like premium status, you can use Auth0 Actions or Rules to add custom fields to the user profile.

## Testing

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000/auth/login` to test login
3. Visit `http://localhost:3000/auth/logout` to test logout

## Auto-configured Routes

The Auth0 middleware automatically configures these routes:
- `/auth/login` - Login page
- `/auth/logout` - Logout endpoint
- `/auth/callback` - OAuth callback
- `/auth/profile` - User profile
- `/auth/access-token` - Access token endpoint 
# Auth0 Configuration
AUTH0_SECRET='your-auth0-secret-key-here'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-auth0-client-id'
AUTH0_CLIENT_SECRET='your-auth0-client-secret'
AUTH0_AUDIENCE='https://your-tenant.auth0.com/api/v2/'

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_PRIVATE_KEY="your-private-key"
GOOGLE_CLOUD_CLIENT_EMAIL="your-client-email"
GOOGLE_CLOUD_BUCKET_NAME="your-bucket-name"

# Podcast Platform OAuth (for broadcasting)
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"
GOOGLE_PODCAST_CLIENT_ID="your-google-podcast-client-id"
GOOGLE_PODCAST_CLIENT_SECRET="your-google-podcast-client-secret"

# External APIs
YOUTUBE_API_KEY="your-youtube-api-key"
GOOGLE_BOOKS_API_KEY="your-google-books-api-key"
PODCASTINDEX_API_KEY="your-podcastindex-api-key"
PODCASTINDEX_API_SECRET="your-podcastindex-api-secret"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# Email
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
```

## Auth0 Dashboard Setup

### 1. Create Auth0 Application
1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application
3. Choose "Regular Web Application"
4. Configure settings:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`

### 2. Configure Email Templates
1. Go to "Branding" > "Universal Login"
2. Customize your login page branding
3. Go to "Email Templates" to customize:
   - **Verification Email**: Sent when users sign up
   - **Password Reset**: Sent when users request password reset
   - **Welcome Email**: Sent after successful verification

### 3. Configure Email Provider
1. Go to "Authentication" > "Database"
2. Enable "Requires Email Verification"
3. Configure email provider (Auth0 provides free email service)
4. Or connect your own SMTP provider for custom emails

### 4. Configure Social Connections
1. Go to "Authentication" > "Social"
2. Enable and configure:
   - **Google** (for user authentication)
   - **Spotify** (for podcast broadcasting)
   - **Apple** (for podcast broadcasting)

### 5. Configure Rules for Premium Features
Create rules for custom user metadata and premium features:

```javascript
function (user, context, callback) {
  // Add custom claims
  const namespace = 'https://telecast.com';
  
  context.idToken[namespace + '/premium'] = user.user_metadata.premium || false;
  context.idToken[namespace + '/premium_expires_at'] = user.user_metadata.premium_expires_at || null;
  context.idToken[namespace + '/used_free_trial'] = user.user_metadata.used_free_trial || false;
  context.idToken[namespace + '/user_id'] = user.user_id;
  
  callback(null, user, context);
}
```

### 6. Configure Password Policy
1. Go to "Authentication" > "Database"
2. Set password policy:
   - Minimum length: 8 characters
   - Require uppercase letters
   - Require lowercase letters
   - Require numbers
   - Require special characters

### 7. Configure MFA (Optional)
1. Go to "Authentication" > "Multi-factor"
2. Enable MFA methods:
   - SMS
   - Push notifications
   - Authenticator apps

## Email Verification & Password Reset

### Email Verification
Auth0 automatically handles email verification:
- Users receive verification email upon signup
- Verification link expires after 24 hours
- Users can request new verification emails
- Verification status is tracked in user profile

### Password Reset
Auth0 provides built-in password reset:
- Users can request password reset from login page
- Reset link sent via email
- Link expires after 24 hours
- Secure token-based reset process

### Custom Email Templates
You can customize email templates in Auth0 Dashboard:
1. Go to "Email Templates"
2. Edit templates for:
   - Verification Email
   - Password Reset
   - Welcome Email
3. Use variables like `{{user.name}}`, `{{user.email}}`

## Migration Steps

### 1. Update Authentication Context
Replace NextAuth with Auth0 in your authentication context.

### 2. Update API Routes
Replace NextAuth session handling with Auth0 session handling.

### 3. Update Frontend Components
Replace NextAuth hooks with Auth0 hooks.

### 4. Test Authentication Flow
Verify login, logout, email verification, and password reset work correctly.

## Benefits of Auth0 Migration

1. **Unified Authentication**: Single sign-on across all platforms
2. **Social Connections**: Built-in support for multiple providers
3. **Email Features**: Built-in email verification and password reset
4. **Enterprise Features**: MFA, risk-based authentication
5. **Scalability**: Handles high traffic and complex auth flows
6. **Security**: SOC2, GDPR compliant
7. **Developer Experience**: Less code to maintain

## Testing Email Features

### Test Email Verification
1. Sign up with a new email
2. Check email for verification link
3. Click link to verify account
4. Verify user can now log in

### Test Password Reset
1. Go to login page
2. Click "Forgot your password?"
3. Enter email address
4. Check email for reset link
5. Click link and set new password
6. Verify user can log in with new password 