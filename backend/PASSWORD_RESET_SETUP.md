# Password Reset Email Setup

This guide explains how to configure email sending for password reset functionality.

## How It Works

When a user requests a password reset:

1. They enter their email on `/forget-password` page
2. Backend generates a reset token and triggers `auth.password_reset` event
3. The subscriber (`src/subscribers/password-reset.ts`) handles sending the email
4. User receives email with reset link: `/reset-password?token=...&email=...`

## Email Configuration Options

The password reset subscriber supports multiple email sending methods (in order of priority):

### Option 1: MedusaJS Notification Provider (Recommended for Production)

Install a notification provider plugin:

```bash
npm install @medusajs/notification-sendgrid
# OR
npm install @medusajs/notification-mailgun
# OR any other MedusaJS notification provider
```

Then configure it in `medusa-config.ts`:

```typescript
plugins: [
  {
    resolve: "@medusajs/notification-sendgrid",
    options: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  },
];
```

### Option 2: Direct SMTP (Simple Setup)

Configure SMTP settings in your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourstore.com
SMTP_SECURE=false
```

**Note:** For Gmail, you'll need to:

1. Enable 2-factor authentication
2. Generate an "App Password" (not your regular password)
3. Use the app password in `SMTP_PASS`

**For other providers:**

- **SendGrid:** `smtp.sendgrid.net`, port `587`
- **Mailgun:** `smtp.mailgun.org`, port `587`
- **AWS SES:** `email-smtp.region.amazonaws.com`, port `587`
- **Outlook:** `smtp-mail.outlook.com`, port `587`

### Option 3: Development Mode (Console Log)

If no email configuration is provided, the reset link will be logged to the console. This is useful for development and testing.

You'll see output like:

```
================================================================================
🔐 PASSWORD RESET LINK (Development Mode)
================================================================================
Email: user@example.com
Reset URL: http://localhost:8000/reset-password?token=...&email=...
================================================================================
```

## Required Environment Variables

Add these to your `.env` file:

```env
# Storefront URL (required for reset links)
STOREFRONT_URL=http://localhost:8000
# OR
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# SMTP Configuration (if using Option 2)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourstore.com
SMTP_SECURE=false
```

## Installing Nodemailer (for Option 2)

If you're using SMTP directly, install nodemailer:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## Testing

1. Start your backend server
2. Navigate to `/forget-password` in your storefront
3. Enter a registered email address
4. Check:
   - Your email inbox (if configured)
   - Backend console logs (if in development mode)
5. Click the reset link to test the password reset flow

## Troubleshooting

### Emails not sending

- Check backend console for error messages
- Verify SMTP credentials are correct
- Ensure firewall/network allows SMTP connections
- Check spam folder

### Reset link not working

- Verify `STOREFRONT_URL` is set correctly
- Check that the token hasn't expired (24 hours)
- Ensure the reset password page route exists

### Development mode

- If you see console logs instead of emails, email is not configured
- This is normal for development - configure SMTP or notification provider for production
