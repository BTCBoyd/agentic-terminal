# Hootsuite API Integration Setup

This document explains how to set up and use the Hootsuite API automation for posting to Facebook and LinkedIn.

## Overview

The Hootsuite API allows programmatic scheduling and publishing to social networks. This integration uses OAuth 2.0 authentication and supports:

- Listing connected social profiles (Facebook, LinkedIn, etc.)
- Publishing posts immediately
- Scheduling posts for future dates
- Managing scheduled messages

## Prerequisites

1. A Hootsuite account (boyd@arcadiab.com / Maxisuite_2009)
2. Access to the Hootsuite Developer Portal
3. A registered OAuth app (or use existing credentials)

## Step 1: Register an OAuth App (First Time Setup)

If you don't already have OAuth credentials:

1. Go to https://developer.hootsuite.com/
2. Sign in with your Hootsuite account (boyd@arcadiab.com)
3. Navigate to "My Apps" or "Create New App"
4. Fill in the app details:
   - App Name: "ArcadiaB Automation"
   - Redirect URI: `http://localhost:8080/callback` (or your preferred callback)
5. Save the **Client ID** and **Client Secret**

## Step 2: Obtain Access Token

### Option A: Authorization Code Flow (Recommended)

1. Construct the authorization URL:
```
https://platform.hootsuite.com/oauth2/auth?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=offline&
  state=RANDOM_STATE_STRING
```

2. Open this URL in a browser and authorize the app
3. Hootsuite will redirect to your callback URL with a `code` parameter
4. Exchange the code for tokens:

```bash
curl -X POST https://platform.hootsuite.com/oauth2/token \
  -H "Authorization: Basic $(echo -n 'CLIENT_ID:CLIENT_SECRET' | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=YOUR_REDIRECT_URI"
```

5. Save the `access_token` and `refresh_token` to `hootsuite-credentials.json`

### Option B: Member App Flow (If Available)

If your Hootsuite plan supports it, you can use member_app grant type for server-to-server authentication.

## Step 3: Configure Credentials

Edit `hootsuite-credentials.json` and fill in:

```json
{
  "clientId": "your_actual_client_id",
  "clientSecret": "your_actual_client_secret",
  "accessToken": "your_access_token",
  "refreshToken": "your_refresh_token"
}
```

## Step 4: Test the Connection

```bash
node hootsuite-post.mjs --list-profiles
```

This should show your connected Facebook and LinkedIn profiles.

## Usage Examples

### List Social Profiles
```bash
node hootsuite-post.mjs --list-profiles
```

### Post Immediately
```bash
node hootsuite-post.mjs --post "Hello World!" --profiles "123456,789012"
```

### Schedule a Post
```bash
node hootsuite-post.mjs --post "Scheduled content" --profiles "123456" --schedule "2026-03-15T14:00:00Z"
```

Note: Times must be in UTC (ISO-8601 format ending with Z)

### List Scheduled Messages
```bash
node hootsuite-post.mjs --list-messages --state SCHEDULED
```

### Refresh Token
```bash
node hootsuite-post.mjs --refresh-token
```

## Troubleshooting: Manual Posts Not Publishing

### Likely Issue: Token Expiry

If posts are entered in Hootsuite but not publishing, this typically means:

1. **Facebook/LinkedIn tokens have expired** - Social networks require periodic reauthorization
2. **Profile shows "Reauthentication Required"** - Check with `--list-profiles`

### How to Fix

#### Step 1: Check Profile Status
```bash
node hootsuite-post.mjs --list-profiles
```

Look for `⚠️ REAUTHENTICATION REQUIRED` warnings.

#### Step 2: Reconnect in Hootsuite Dashboard

1. Log into https://hootsuite.com with boyd@arcadiab.com
2. Go to your profile picture → "Social Networks"
3. Find the disconnected account (Facebook or LinkedIn)
4. Click "Reconnect" or "Refresh Connection"
5. Follow the authorization prompts

#### Step 3: Verify Connection

Run `--list-profiles` again to confirm `isReauthRequired` is now `false`.

### Other Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Access token expired. Use `--refresh-token` or re-authenticate |
| 403 Forbidden | Insufficient permissions. Check Hootsuite dashboard permissions |
| 429 Too Many Requests | Rate limit hit. Wait before retrying |
| 40024 Error | Facebook Groups posting is no longer supported via API |
| 40025 Error | Scheduled message limit reached. Delete old scheduled messages |

## Token Refresh

Access tokens expire after 30 days (2592000 seconds). The script supports automatic refresh:

```bash
node hootsuite-post.mjs --refresh-token
```

This will:
1. Use your `refreshToken` to get a new `accessToken`
2. Display the new tokens
3. You must manually update `hootsuite-credentials.json` with the new values

## API Limitations

- **Rate Limits**: Contact dev.support@hootsuite.com if you hit limits
- **Facebook Groups**: No longer supported via API (error 40024)
- **Pinterest**: Cannot be bundled with other networks in same message
- **Media**: Must be uploaded to Hootsuite first (via `/v1/media` endpoint)
- **Scheduling**: Maximum scheduled messages limit based on plan

## Security Notes

- Keep `hootsuite-credentials.json` secure and never commit it to git
- The refresh token is sensitive - treat it like a password
- If tokens are compromised, revoke them in the Hootsuite Developer Portal

## Reference

- Hootsuite API Docs: https://apidocs.hootsuite.com/
- OAuth 2.0 Spec: https://tools.ietf.org/html/rfc6749
- Support: dev.support@hootsuite.com

## Files

- `hootsuite-post.mjs` - Main automation script
- `hootsuite-credentials.json` - Your API credentials (keep secret!)
- `HOOTSUITE-SETUP.md` - This documentation
