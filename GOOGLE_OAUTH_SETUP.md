# Google OAuth Setup Guide

## Prerequisites
You have an app password from Google: `kmrj acrs emwm`

However, **App Passwords are NOT used for OAuth 2.0**. App passwords are for legacy applications that don't support modern OAuth.

## Steps to Setup Google OAuth

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project "Process Serve"
3. Navigate to "APIs & Services" > "Credentials"

### 2. Create OAuth 2.0 Client ID

1. Click "Create Credentials" > "OAuth client ID"
2. If prompted, configure the OAuth consent screen:
   - User Type: External (for testing) or Internal (for organization only)
   - App name: ProcessServe
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`
   
3. Application type: **Web application**
4. Name: ProcessServe Web Client

5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:3001
   http://localhost:3002
   http://localhost:3003
   http://localhost:3004
   ```

6. **Authorized redirect URIs:**
   ```
   http://localhost:8080/api/auth/oauth2/callback/google
   http://localhost:3000
   http://localhost:3002
   ```

7. Click "Create"

### 3. Copy Credentials

After creation, you'll receive:
- **Client ID**: Something like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abcdefghijklmnop`

### 4. Configure Backend

Edit `/backend/auth-service/src/main/resources/application.yml`:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: YOUR_CLIENT_ID_HERE
            client-secret: YOUR_CLIENT_SECRET_HERE
```

### 5. Configure Frontend

Create `/frontend/admin-panel/.env.local`:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

### 6. Run Database Migration

```bash
cd /Users/hparichha/Documents/repo\ test\ 2/Process-server-project
mysql -u dbuser -p processserve_db < database/add_google_oauth.sql
```

Enter password: `dbuser!!`

### 7. Rebuild Backend

```bash
cd backend/auth-service
mvn clean install
```

### 8. Restart Services

Stop and restart your backend services for changes to take effect.

### 9. Test Google OAuth

1. Navigate to http://localhost:3002/login
2. Click "Sign in with Google" button
3. Select your Google account
4. Grant permissions
5. You should be redirected to the dashboard

## Security Notes

1. **Never commit `.env.local` or `application.yml` with real credentials to Git**
2. Add `.env.local` to `.gitignore`
3. For production:
   - Use environment variables
   - Enable HTTPS
   - Update authorized origins/redirects to production URLs
   - Review and approve OAuth consent screen for public use

## Troubleshooting

### "redirect_uri_mismatch" Error
- Verify the redirect URI in Google Console matches exactly: `http://localhost:8080/api/auth/oauth2/callback/google`

### "invalid_client" Error
- Check that client ID and secret are correctly copied
- Ensure no extra spaces or line breaks

### Google Button Not Showing
- Check browser console for errors
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- Restart Next.js dev server after adding environment variables

## App Password vs OAuth 2.0

**Your app password `kmrj acrs emwm` is NOT needed for this OAuth implementation.**

- App Passwords: Used for SMTP, IMAP, POP3 (email access)
- OAuth 2.0: Used for web/mobile app authentication with Google Sign-In

For this ProcessServe implementation, you need the OAuth 2.0 Client ID and Secret, not the app password.
