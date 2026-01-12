# How to Create Production Environment File

## Step-by-Step Guide

### Step 1: Copy the Template

Open your terminal in the project directory and run:

```bash
cp env.production.example .env.production
```

This creates a new file called `.env.production` from the template.

---

### Step 2: Open the File

Open `.env.production` in your code editor. You can use:

```bash
# Using VS Code
code .env.production

# Using nano (terminal editor)
nano .env.production

# Using vim
vim .env.production
```

---

### Step 3: Fill in the Values

Replace all the placeholder values with your actual production credentials. Here's what you need:

#### A. Generated Secrets (Already Available)

From Step 1.1, you have these secrets. Copy them into the file:

```bash
NEXTAUTH_SECRET="WchT/IDXCZG11cLQQqB6g2wYPnXT+/kcTQphWjITino="
ENCRYPTION_MASTER_KEY="gmUWDG6oVbXJ0p8GDTno6xXGdJddcMpU4R/qf5NANig="
```

#### B. Database Connection (You'll get this in Phase 2)

For now, you can use a placeholder. You'll update this when you set up your production database:

```bash
DATABASE_URL="postgresql://user:password@host:5432/ghana_emergency_prod?schema=public"
```

#### C. Application URL

Replace with your actual domain (or use placeholder for now):

```bash
NEXTAUTH_URL="https://emergency.gov.gh"  # or your actual domain
```

#### D. API Keys (You Need to Obtain These)

**1. Mapbox Token:**
- Go to: https://account.mapbox.com/access-tokens/
- Sign up/login
- Create a new access token
- Copy it to: `NEXT_PUBLIC_MAPBOX_TOKEN="your-token-here"`

**2. Pusher Credentials:**
- Go to: https://dashboard.pusher.com/
- Sign up/login
- Create a new app
- Copy App ID, Key, Secret, and Cluster
- Fill in:
  ```bash
  PUSHER_APP_ID="your-app-id"
  NEXT_PUBLIC_PUSHER_KEY="your-key"
  PUSHER_SECRET="your-secret"
  NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster"
  ```

**3. AWS Credentials (for S3 file storage):**
- Go to: https://aws.amazon.com/
- Create an AWS account
- Create IAM user with S3 permissions
- Generate access keys
- Fill in:
  ```bash
  AWS_ACCESS_KEY_ID="your-access-key"
  AWS_SECRET_ACCESS_KEY="your-secret-key"
  AWS_REGION="af-south-1"  # or your preferred region
  AWS_S3_BUCKET_NAME="ghana-emergency-reports-prod"
  ```

**4. Email Service:**
Choose one provider:

**Option A: AWS SES (Recommended for AWS users)**
```bash
AWS_SES_REGION="af-south-1"
EMAIL_FROM="noreply@emergency.gov.gh"
```

**Option B: SendGrid**
- Go to: https://sendgrid.com/
- Sign up and get API key
```bash
SENDGRID_API_KEY="your-api-key"
EMAIL_FROM="noreply@emergency.gov.gh"
```

**5. SMS Service:**
Choose one provider:

**Option A: Africa's Talking (Recommended for Ghana)**
- Go to: https://account.africastalking.com/
- Sign up and get credentials
```bash
SMS_PROVIDER="africas_talking"
AFRICASTALKING_API_KEY="your-api-key"
AFRICASTALKING_USERNAME="your-username"
```

**Option B: Twilio**
- Go to: https://www.twilio.com/
- Sign up and get credentials
```bash
SMS_PROVIDER="twilio"
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="your-phone-number"
```

**6. Redis (for rate limiting):**
- You'll set this up in Phase 2
- For now, use placeholder:
```bash
REDIS_URL="redis://host:6379"
REDIS_PASSWORD="B2WO/3F6WyVn2JeSqbuz/n389VoOd7Tg"  # Use the generated password
```

**7. Monitoring (Optional but Recommended):**
- Sentry: https://sentry.io/
- Sign up and get DSN
```bash
SENTRY_DSN="your-sentry-dsn"
SENTRY_ENVIRONMENT="production"
```

---

### Step 4: Verify the File

After filling in all values, your `.env.production` file should:
- ✅ Have no placeholder values (or clearly marked placeholders)
- ✅ Have all required fields filled
- ✅ Use the generated secrets from Step 1.1
- ✅ Be saved in the project root directory

---

### Step 5: Verify It's Not Committed to Git

Check that `.env.production` is in `.gitignore`:

```bash
grep -q "\.env\.production" .gitignore && echo "✅ File is in .gitignore" || echo "❌ File is NOT in .gitignore"
```

**IMPORTANT:** Never commit `.env.production` to git. It contains sensitive secrets.

---

## Quick Start (Using Placeholders)

If you don't have all API keys yet, you can create the file with placeholders:

```bash
# Copy template
cp env.production.example .env.production

# Edit and replace at minimum:
# - NEXTAUTH_SECRET (use generated secret)
# - ENCRYPTION_MASTER_KEY (use generated secret)
# - NEXTAUTH_URL (your domain or placeholder)
# - All other values can be placeholders for now
```

You can update the API keys later as you obtain them.

---

## Example: Minimal Working .env.production

Here's a minimal version that will work (with placeholders):

```bash
# Database (placeholder - update in Phase 2)
DATABASE_URL="postgresql://user:password@localhost:5432/ghana_emergency_prod?schema=public"

# Authentication (use generated secrets)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="WchT/IDXCZG11cLQQqB6g2wYPnXT+/kcTQphWjITino="

# Encryption (use generated secret)
ENCRYPTION_MASTER_KEY="gmUWDG6oVbXJ0p8GDTno6xXGdJddcMpU4R/qf5NANig="

# Mapbox (placeholder - get from https://account.mapbox.com/)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.placeholder_token_here"

# Pusher (placeholder - get from https://dashboard.pusher.com/)
PUSHER_APP_ID="placeholder"
NEXT_PUBLIC_PUSHER_KEY="placeholder"
PUSHER_SECRET="placeholder"
NEXT_PUBLIC_PUSHER_CLUSTER="mt1"

# AWS S3 (placeholder - get from AWS)
AWS_ACCESS_KEY_ID="placeholder"
AWS_SECRET_ACCESS_KEY="placeholder"
AWS_REGION="af-south-1"
AWS_S3_BUCKET_NAME="ghana-emergency-reports-prod"

# Email (placeholder)
EMAIL_FROM="noreply@emergency.gov.gh"

# SMS (placeholder)
SMS_PROVIDER="africas_talking"
AFRICASTALKING_API_KEY="placeholder"
AFRICASTALKING_USERNAME="placeholder"

# Redis (placeholder - update in Phase 2)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="B2WO/3F6WyVn2JeSqbuz/n389VoOd7Tg"

# Application
NODE_ENV="production"
PORT="3000"
LOG_LEVEL="info"
```

---

## Troubleshooting

### File Not Found Error
If you get "file not found" when copying:
```bash
# Make sure you're in the project root
cd /Users/raregem.zillion/Desktop/GHANA\ EMERGENCY\ RESPONSE\ CLOUD
ls env.production.example  # Should show the file
```

### Permission Denied
If you can't edit the file:
```bash
chmod 644 .env.production
```

### File Already Exists
If `.env.production` already exists:
```bash
# Backup existing file
mv .env.production .env.production.backup
# Copy template
cp env.production.example .env.production
```

---

## Next Steps

Once you've created `.env.production`:
1. ✅ Verify all generated secrets are in place
2. ✅ Add placeholder values for API keys you don't have yet
3. ✅ Update API keys as you obtain them
4. ✅ Proceed to Phase 2: Infrastructure Setup

---

## Security Reminders

⚠️ **CRITICAL:**
- Never commit `.env.production` to git
- Never share secrets in chat/email
- Store secrets in a password manager
- Rotate secrets every 90 days
- Use different keys for dev/staging/production

---

**Need Help?** If you're stuck on any step, let me know which API key you're trying to obtain and I can provide more specific guidance.

