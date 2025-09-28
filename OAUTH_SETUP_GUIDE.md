# Google OAuth Setup Guide

## Current Issue
Getting error: "The server cannot process the request because it is malformed"

## Step 1: Verify Supabase Google OAuth Configuration

1. Go to [Supabase Authentication Providers](https://supabase.com/dashboard/project/ztrseijpesnmztuugmsi/auth/providers)
2. Find the Google provider and ensure it's **enabled**
3. Check that you have both:
   - **Client ID** (should look like: `xxxxx.apps.googleusercontent.com`)
   - **Client Secret** (should be a long random string)
4. If missing, you need to get these from Google Cloud Console (see Step 2)

## Step 2: Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if needed)
3. Navigate to **APIs & Services > Credentials**
4. If you don't have an OAuth 2.0 Client ID, click **Create Credentials > OAuth 2.0 Client ID**

### Configure OAuth Client:
- **Application type**: Web application
- **Name**: Vuelix (or any name you prefer)

### Authorized JavaScript origins:
Add these URLs:
```
https://preview--vuelix-web-craft.lovable.app
http://localhost:3000
https://ztrseijpesnmztuugmsi.supabase.co
```

### Authorized redirect URIs:
Add this exact URL:
```
https://ztrseijpesnmztuugmsi.supabase.co/auth/v1/callback
```

## Step 3: Update Supabase URL Configuration

1. Go to [Supabase Authentication URL Configuration](https://supabase.com/dashboard/project/ztrseijpesnmztuugmsi/auth/url-configuration)
2. Set **Site URL** to: `https://preview--vuelix-web-craft.lovable.app`
3. Add these **Redirect URLs**:
   ```
   https://preview--vuelix-web-craft.lovable.app/**
   http://localhost:3000/**
   ```

## Step 4: OAuth Consent Screen (if not done)

1. In Google Cloud Console, go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill required fields:
   - App name: Vuelix
   - User support email: your email
   - Developer contact: your email
4. Add required scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Add your domain under **Authorized domains**: `lovable.app`

## Step 5: Testing

After configuration:
1. Clear browser cache/cookies
2. Try Google sign-in again
3. Check browser console for detailed error messages
4. Check Supabase logs for authentication errors

## Common Issues

- **Redirect URI mismatch**: Ensure redirect URI in Google matches exactly what Supabase expects
- **JavaScript origins**: Must include your app's domain
- **Client ID/Secret**: Must be copied exactly from Google to Supabase
- **Consent screen**: Must be configured and not in testing mode with restricted users

## Next Steps

1. Complete the configuration above
2. Test the Google OAuth flow
3. If still having issues, check the enhanced error messages in the app