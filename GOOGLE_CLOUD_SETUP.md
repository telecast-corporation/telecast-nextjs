# Google Cloud Setup Guide for Audio Playback

## Overview
This application uses Google Cloud Storage to store and serve audio files. The authentication issue you're experiencing is likely due to missing or incorrectly configured environment variables.

## Required Environment Variables

You need to set up the following environment variables in your `.env.local` file:

```bash
# Google Cloud Project Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_PODCAST_BUCKET_NAME=your-podcast-bucket-name
GOOGLE_CLOUD_PROFILE_BUCKET_NAME=your-profile-bucket-name
```

## Step-by-Step Setup

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your **Project ID**

### 2. Enable Google Cloud Storage API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Cloud Storage"
3. Enable the "Cloud Storage API"

### 3. Create a Service Account
1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name like "telecast-storage-service"
4. Add the following roles:
   - **Storage Object Admin** (for full bucket access)
   - **Storage Object Viewer** (for read access)
5. Click "Create and Continue"
6. Click "Done"

### 4. Generate Service Account Key
1. Click on your newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file

### 5. Extract Credentials from JSON
Open the downloaded JSON file and extract these values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 6. Create Storage Buckets
1. Go to "Cloud Storage" > "Buckets"
2. Create two buckets:
   - One for podcasts (e.g., `telecast-podcasts`)
   - One for profile images (e.g., `telecast-profiles`)
3. Make sure the buckets are in the same region as your application

### 7. Configure Environment Variables
Create a `.env.local` file in your project root with:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_PODCAST_BUCKET_NAME=telecast-podcasts
GOOGLE_CLOUD_PROFILE_BUCKET_NAME=telecast-profiles
```

**Important Notes:**
- The `GOOGLE_CLOUD_PRIVATE_KEY` must include the `\n` characters for line breaks
- Wrap the private key in quotes
- Make sure there are no extra spaces or characters

### 8. Test the Configuration
Run the test script to verify your setup:

```bash
npm run test-google-cloud
```

## Troubleshooting

### Common Issues

1. **"Missing Google Cloud environment variables"**
   - Check that all required variables are set in `.env.local`
   - Restart your development server after adding environment variables

2. **"Invalid private key"**
   - Make sure the private key includes `\n` for line breaks
   - Verify the key is properly formatted with BEGIN/END markers

3. **"Bucket not found"**
   - Verify the bucket names are correct
   - Ensure the service account has access to the buckets

4. **"Permission denied"**
   - Check that the service account has the correct IAM roles
   - Verify the project ID is correct

### Debug Mode
The application now includes enhanced logging. Check your console for:
- ✅ Green checkmarks for successful configuration
- ❌ Red X marks for configuration errors
- 📁 Bucket and project information

## Security Best Practices

1. **Never commit your `.env.local` file** - it's already in `.gitignore`
2. **Use least privilege** - only grant necessary permissions to the service account
3. **Rotate keys regularly** - generate new service account keys periodically
4. **Use environment-specific configurations** - different settings for dev/staging/prod

## Production Deployment

For production (Vercel, etc.), add these environment variables in your deployment platform's settings. The private key should be added as-is without the `\n` characters (the platform will handle line breaks automatically).
