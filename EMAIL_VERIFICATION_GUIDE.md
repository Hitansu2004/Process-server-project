# Email Verification & Authentication Guide

## Overview
ProcessServe now supports three authentication methods:
1. **Google OAuth** - One-click sign-in with Google account
2. **Gmail Registration** - Direct registration with Gmail (no OTP required)
3. **Other Email Registration** - Registration with OTP verification for non-Gmail addresses

## Features Implemented

### 1. Google OAuth Login
- Users can sign in/register using their Google account
- Automatic user creation on first login
- No password required

### 2. Email OTP Verification
- **Gmail users**: Can register directly without OTP
- **Non-Gmail users**: Must verify email with OTP before registration
- OTP valid for 10 minutes
- 6-digit secure code sent to email

### 3. Email Notifications
- **OTP Email**: Professional HTML email with verification code
- **Welcome Email**: Sent after successful registration
- Sent from: `hitansu0007@gmail.com`

## How It Works

### For Gmail Users (@gmail.com):
1. Enter registration details
2. Click "Create Admin Account"
3. Account created immediately
4. Welcome email sent

### For Non-Gmail Users:
1. Enter registration details
2. Click "Send OTP & Continue"
3. Check email for 6-digit OTP
4. Enter OTP on verification screen
5. Click "Verify & Register"
6. Account created
7. Welcome email sent

### For Google OAuth Users:
1. Click "Sign in with Google" button
2. Select Google account
3. Automatic registration/login
4. Redirected to dashboard

## API Endpoints

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully to user@example.com",
  "email": "user@example.com"
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Email verified successfully",
  "verified": true,
  "email": "user@example.com"
}
```

### Google OAuth
```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "google-id-token-here",
  "tenantId": "optional-tenant-id",
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "userId": "user-id",
  "isSuperAdmin": false
}
```

### Regular Registration
```http
POST /api/auth/register/admin
Content-Type: application/json

{
  "tenantId": "tenant-1",
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

**Note**: For non-Gmail users, email must be verified with OTP first.

## Email Configuration

The system uses Gmail SMTP to send emails:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: hitansu0007@gmail.com
    password: kmrjacrsemwm  # App password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

## Security Features

1. **OTP Expiration**: OTPs expire after 10 minutes
2. **One-Time Use**: OTPs are marked as used after verification
3. **Email Validation**: Prevents registration without verification
4. **Duplicate Prevention**: Checks if email already exists
5. **Secure Passwords**: Minimum 6 characters required

## Database Schema

### email_verifications Table
```sql
CREATE TABLE email_verifications (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  is_verified TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_email_otp (email, otp, is_verified)
);
```

### global_users Table (Updated)
```sql
ALTER TABLE global_users 
ADD COLUMN google_id VARCHAR(255) NULL UNIQUE;
```

## Testing

### Test OTP Flow:
1. Navigate to: `http://localhost:3002/register`
2. Enter details with non-Gmail email (e.g., `test@yahoo.com`)
3. Click "Send OTP & Continue"
4. Check email inbox for OTP
5. Enter OTP and verify
6. Complete registration

### Test Gmail Flow:
1. Navigate to: `http://localhost:3002/register`
2. Enter details with Gmail (e.g., `test@gmail.com`)
3. Click "Create Admin Account"
4. Registration completes immediately

### Test Google OAuth:
1. Navigate to: `http://localhost:3002/login`
2. Click "Sign in with Google"
3. Select Google account
4. Automatic login/registration

## Email Templates

### OTP Email
- Professional HTML design
- Large, clear OTP display
- 10-minute validity notice
- Security warning
- ProcessServe branding

### Welcome Email
- Congratulations message
- Feature highlights
- Call-to-action
- Support information

## Troubleshooting

### OTP Not Received
- Check spam/junk folder
- Verify email address is correct
- Wait 1-2 minutes for delivery
- Try resending OTP

### OTP Invalid/Expired
- OTPs expire after 10 minutes
- Request new OTP
- Ensure correct 6-digit code

### Gmail SMTP Issues
- Verify app password is correct
- Ensure "Less secure app access" is enabled (if needed)
- Check Gmail account settings

### Google OAuth Issues
- Verify Google Client ID is configured
- Check authorized redirect URIs
- Ensure OAuth consent screen is configured

## Production Considerations

1. **Environment Variables**: Move sensitive data to environment variables
2. **Rate Limiting**: Implement OTP request rate limiting
3. **Email Service**: Consider using SendGrid, AWS SES, or similar for production
4. **Monitoring**: Track OTP delivery success rates
5. **Analytics**: Monitor authentication method usage
6. **Security**: Implement CAPTCHA for OTP requests

## Support

For issues or questions, contact the development team or refer to:
- Backend logs: `backend/auth-service.log`
- Email service logs: Check for email sending errors
- Database: Check `email_verifications` table for OTP records
