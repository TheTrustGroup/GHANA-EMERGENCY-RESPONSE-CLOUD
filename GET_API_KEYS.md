# Getting API Keys - Step-by-Step Guide

This guide will help you obtain all the API keys needed for the Ghana Emergency Response Platform.

---

## 📋 API Keys Checklist

- [ ] **Mapbox Token** (Required - for maps)
- [ ] **Pusher Credentials** (Required - for real-time updates)
- [ ] **AWS Credentials** (Required - for file storage)
- [ ] **Email Service** (Required - for notifications)
- [ ] **SMS Service** (Required - for SMS notifications)
- [ ] **Sentry DSN** (Optional - for error tracking)

---

## 1. Mapbox Token (Required)

**Purpose:** Display maps and location features

### Steps:

1. **Go to Mapbox:**
   - Visit: https://account.mapbox.com/
   - Click "Sign up" or "Log in"

2. **Create Account:**
   - Sign up with email or GitHub
   - Verify your email

3. **Get Access Token:**
   - After login, go to: https://account.mapbox.com/access-tokens/
   - You'll see your **Default public token**
   - Click "Create a token" to create a new one (recommended)
   - Name it: "Ghana Emergency Response - Production"
   - Select scopes: `styles:read`, `fonts:read`, `datasets:read`
   - Click "Create token"

4. **Copy Token:**
   - Copy the token (starts with `pk.`)
   - **Add to `.env.production`:**
     ```bash
     NEXT_PUBLIC_MAPBOX_TOKEN="pk.your_token_here"
     ```

**Cost:** Free tier includes 50,000 map loads/month

---

## 2. Pusher Credentials (Required)

**Purpose:** Real-time updates (live incident updates, messages)

### Steps:

1. **Go to Pusher:**
   - Visit: https://dashboard.pusher.com/
   - Click "Sign up" or "Log in"

2. **Create Account:**
   - Sign up with email
   - Verify your email

3. **Create App:**
   - Click "Create app" or "Channels apps" → "Create app"
   - **App name:** "Ghana Emergency Response"
   - **Cluster:** Choose closest to Ghana (e.g., `eu`, `us-east-1`, `ap-southeast-1`)
   - **Front-end tech:** React
   - **Back-end tech:** Node.js
   - Click "Create app"

4. **Get Credentials:**
   - Go to "App Keys" tab
   - You'll see:
     - **App ID** (e.g., `1234567`)
     - **Key** (e.g., `a1b2c3d4e5f6g7h8i9j0`)
     - **Secret** (e.g., `k1l2m3n4o5p6q7r8s9t0`)
     - **Cluster** (e.g., `eu`)

5. **Copy Credentials:**
   - **Add to `.env.production`:**
     ```bash
     PUSHER_APP_ID="your-app-id"
     NEXT_PUBLIC_PUSHER_KEY="your-key"
     PUSHER_SECRET="your-secret"
     NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster"
     ```

**Cost:** Free tier includes 200,000 messages/day, 100 concurrent connections

---

## 3. AWS Credentials (Required)

**Purpose:** File storage (S3) for incident reports, media uploads

### Steps:

1. **Create AWS Account:**
   - Visit: https://aws.amazon.com/
   - Click "Create an AWS Account"
   - Follow the signup process
   - **Note:** Requires credit card (free tier available)

2. **Create IAM User:**
   - Go to: https://console.aws.amazon.com/iam/
   - Click "Users" → "Create user"
   - **User name:** `ghana-emergency-s3`
   - Select "Provide user access to the AWS Management Console" (optional)
   - Click "Next"

3. **Set Permissions:**
   - Click "Attach policies directly"
   - Search for and select: `AmazonS3FullAccess`
   - Click "Next" → "Create user"

4. **Create Access Keys:**
   - Click on the user you just created
   - Go to "Security credentials" tab
   - Scroll to "Access keys"
   - Click "Create access key"
   - Select "Application running outside AWS"
   - Click "Next" → "Create access key"
   - **IMPORTANT:** Download the CSV file or copy:
     - **Access key ID**
     - **Secret access key**

5. **Create S3 Bucket:**
   - Go to: https://s3.console.aws.amazon.com/
   - Click "Create bucket"
   - **Bucket name:** `ghana-emergency-reports-prod` (must be globally unique)
   - **Region:** Choose closest to Ghana (e.g., `af-south-1` - Cape Town)
   - **Block Public Access:** Keep enabled (we'll use presigned URLs)
   - Click "Create bucket"

6. **Copy Credentials:**
   - **Add to `.env.production`:**
     ```bash
     AWS_ACCESS_KEY_ID="your-access-key-id"
     AWS_SECRET_ACCESS_KEY="your-secret-access-key"
     AWS_REGION="af-south-1"
     AWS_S3_BUCKET_NAME="ghana-emergency-reports-prod"
     ```

**Cost:** Free tier includes 5GB storage, 20,000 GET requests/month

---

## 4. Email Service (Required)

Choose **ONE** of the following:

### Option A: AWS SES (Recommended if using AWS)

**Steps:**

1. **Go to AWS SES:**
   - Visit: https://console.aws.amazon.com/ses/
   - Make sure you're in the same region as your S3 bucket

2. **Verify Email Domain:**
   - Click "Verified identities" → "Create identity"
   - Select "Domain" or "Email address"
   - For domain: Enter your domain (e.g., `emergency.gov.gh`)
   - Follow verification steps (add DNS records)
   - For email: Enter email, click verification link

3. **Get Out of Sandbox (Production):**
   - By default, SES is in "sandbox" mode
   - To send to any email, request production access:
     - Go to "Account dashboard"
     - Click "Request production access"
     - Fill out the form (explain use case)
     - Wait for approval (usually 24-48 hours)

4. **Add to `.env.production`:**
   ```bash
   AWS_SES_REGION="af-south-1"
   EMAIL_FROM="noreply@emergency.gov.gh"
   ```

**Cost:** Free tier includes 62,000 emails/month (if sent from EC2)

---

### Option B: SendGrid (Easier Setup)

**Steps:**

1. **Go to SendGrid:**
   - Visit: https://sendgrid.com/
   - Click "Start for free" or "Log in"

2. **Create Account:**
   - Sign up with email
   - Verify your email
   - Complete setup wizard

3. **Verify Sender:**
   - Go to "Settings" → "Sender Authentication"
   - Click "Verify a Single Sender"
   - Enter your email address
   - Verify via email link

4. **Create API Key:**
   - Go to "Settings" → "API Keys"
   - Click "Create API Key"
   - **Name:** "Ghana Emergency Response"
   - **Permissions:** "Full Access" (or "Mail Send" only)
   - Click "Create & View"
   - **IMPORTANT:** Copy the key immediately (shown only once)

5. **Add to `.env.production`:**
   ```bash
   SENDGRID_API_KEY="SG.your_api_key_here"
   EMAIL_FROM="noreply@emergency.gov.gh"
   ```
   - Comment out AWS SES lines if using SendGrid

**Cost:** Free tier includes 100 emails/day

---

## 5. SMS Service (Required)

Choose **ONE** of the following:

### Option A: Africa's Talking (Recommended for Ghana)

**Steps:**

1. **Go to Africa's Talking:**
   - Visit: https://account.africastalking.com/
   - Click "Sign up" or "Log in"

2. **Create Account:**
   - Sign up with email
   - Verify your email
   - Complete profile

3. **Create App:**
   - Go to "Apps" → "Create App"
   - **App name:** "Ghana Emergency Response"
   - **Service code:** Leave default or customize
   - Click "Create"

4. **Get Credentials:**
   - Go to "Settings" → "API"
   - You'll see:
     - **API Key** (e.g., `abc123def456...`)
     - **Username** (your account username)

5. **Add to `.env.production`:**
   ```bash
   SMS_PROVIDER="africas_talking"
   AFRICASTALKING_API_KEY="your-api-key"
   AFRICASTALKING_USERNAME="your-username"
   ```
   - Comment out Twilio lines if using Africa's Talking

**Cost:** Pay-as-you-go, competitive rates in Africa

---

### Option B: Twilio (Global Alternative)

**Steps:**

1. **Go to Twilio:**
   - Visit: https://www.twilio.com/
   - Click "Sign up" or "Log in"

2. **Create Account:**
   - Sign up with email
   - Verify phone number
   - Complete setup

3. **Get Credentials:**
   - Go to: https://console.twilio.com/
   - You'll see on dashboard:
     - **Account SID** (e.g., `ACxxxxxxxxxxxxx`)
     - **Auth Token** (click to reveal)

4. **Get Phone Number:**
   - Go to "Phone Numbers" → "Manage" → "Buy a number"
   - Select country (Ghana if available)
   - Purchase number

5. **Add to `.env.production`:**
   ```bash
   SMS_PROVIDER="twilio"
   TWILIO_ACCOUNT_SID="your-account-sid"
   TWILIO_AUTH_TOKEN="your-auth-token"
   TWILIO_PHONE_NUMBER="+233XXXXXXXXX"
   ```
   - Comment out Africa's Talking lines if using Twilio

**Cost:** Free trial includes $15.50 credit

---

## 6. Sentry DSN (Optional but Recommended)

**Purpose:** Error tracking and monitoring

### Steps:

1. **Go to Sentry:**
   - Visit: https://sentry.io/
   - Click "Get Started" or "Log in"

2. **Create Account:**
   - Sign up with email or GitHub
   - Verify your email

3. **Create Project:**
   - Click "Create Project"
   - **Platform:** Next.js
   - **Project name:** "Ghana Emergency Response"
   - Click "Create Project"

4. **Get DSN:**
   - After project creation, you'll see your DSN
   - It looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
   - Copy the DSN

5. **Add to `.env.production`:**
   ```bash
   SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
   SENTRY_ENVIRONMENT="production"
   ```

**Cost:** Free tier includes 5,000 events/month

---

## 📝 Quick Reference: What Goes Where

After obtaining all keys, update `.env.production`:

```bash
# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your_token_here"

# Pusher
PUSHER_APP_ID="your-app-id"
NEXT_PUBLIC_PUSHER_KEY="your-key"
PUSHER_SECRET="your-secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="af-south-1"
AWS_S3_BUCKET_NAME="ghana-emergency-reports-prod"

# Email (choose one)
# Option 1: AWS SES
AWS_SES_REGION="af-south-1"
EMAIL_FROM="noreply@emergency.gov.gh"

# Option 2: SendGrid
# SENDGRID_API_KEY="SG.your_api_key_here"
# EMAIL_FROM="noreply@emergency.gov.gh"

# SMS (choose one)
# Option 1: Africa's Talking
SMS_PROVIDER="africas_talking"
AFRICASTALKING_API_KEY="your-api-key"
AFRICASTALKING_USERNAME="your-username"

# Option 2: Twilio
# SMS_PROVIDER="twilio"
# TWILIO_ACCOUNT_SID="your-account-sid"
# TWILIO_AUTH_TOKEN="your-auth-token"
# TWILIO_PHONE_NUMBER="+233XXXXXXXXX"

# Sentry (optional)
SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
SENTRY_ENVIRONMENT="production"
```

---

## ✅ Verification Checklist

After filling in all keys:

- [ ] Mapbox token starts with `pk.`
- [ ] Pusher has all 4 values (App ID, Key, Secret, Cluster)
- [ ] AWS has Access Key ID and Secret Access Key
- [ ] S3 bucket created and name matches in `.env.production`
- [ ] Email service configured (one provider)
- [ ] SMS service configured (one provider)
- [ ] All values in `.env.production` have no `<placeholder>` text
- [ ] `.env.production` is saved and not committed to git

---

## 🆘 Troubleshooting

### Mapbox Token Not Working
- Make sure token starts with `pk.`
- Check token has correct scopes
- Verify token is not expired

### Pusher Connection Issues
- Verify cluster matches in all places
- Check app is not paused
- Verify credentials are correct

### AWS Access Denied
- Check IAM user has S3 permissions
- Verify access keys are correct
- Check bucket name is correct

### Email Not Sending
- **AWS SES:** Check if still in sandbox mode
- **SendGrid:** Verify sender email is verified
- Check email service credentials

### SMS Not Sending
- **Africa's Talking:** Verify account is active
- **Twilio:** Check phone number is verified
- Verify API credentials

---

## 💰 Cost Summary

| Service | Free Tier | Paid Tier Starts At |
|---------|-----------|---------------------|
| Mapbox | 50K loads/month | $5/month |
| Pusher | 200K msgs/day | $49/month |
| AWS S3 | 5GB storage | $0.023/GB |
| AWS SES | 62K emails/month* | $0.10/1K emails |
| SendGrid | 100 emails/day | $19.95/month |
| Africa's Talking | Pay-as-you-go | ~$0.01/SMS |
| Twilio | $15.50 trial | ~$0.0075/SMS |
| Sentry | 5K events/month | $26/month |

*If sent from EC2

---

## 🎯 Recommended Setup for Ghana

**Best Cost-Effective Combination:**
1. **Mapbox** - Free tier sufficient for start
2. **Pusher** - Free tier sufficient for start
3. **AWS S3** - Free tier sufficient for start
4. **AWS SES** - Free tier sufficient, same AWS account
5. **Africa's Talking** - Best rates for Ghana
6. **Sentry** - Free tier for monitoring

**Estimated Monthly Cost (Starting):** $0-20/month

---

## 📞 Need Help?

If you get stuck on any step:
1. Check the service's documentation
2. Look for "Getting Started" guides
3. Contact service support
4. Let me know which step you're on and I can help!

---

**Once all API keys are obtained and added to `.env.production`, you're ready for Phase 2: Infrastructure Setup!**

