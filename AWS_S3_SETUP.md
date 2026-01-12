# Quick AWS S3 Setup Guide

Since you already have Mapbox and Pusher, here's a quick guide to set up AWS S3 for file uploads.

## Step 1: Create AWS Account (if you don't have one)

1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow signup (requires credit card, but free tier available)

## Step 2: Create S3 Bucket

1. Go to https://s3.console.aws.amazon.com/
2. Click "Create bucket"
3. **Bucket name:** `ghana-emergency-reports` (must be globally unique - add your name/numbers if taken)
4. **Region:** Choose closest to Ghana:
   - `af-south-1` (Cape Town) - Recommended
   - `us-east-1` (N. Virginia) - Alternative
5. **Block Public Access:** Keep enabled (we use presigned URLs, so this is fine)
6. Click "Create bucket"

## Step 3: Create IAM User for S3 Access

1. Go to https://console.aws.amazon.com/iam/
2. Click "Users" → "Create user"
3. **User name:** `ghana-emergency-s3`
4. Click "Next"

5. **Set Permissions:**
   - Click "Attach policies directly"
   - Search for: `AmazonS3FullAccess`
   - Select it
   - Click "Next" → "Create user"

6. **Create Access Keys:**
   - Click on the user you just created
   - Go to "Security credentials" tab
   - Scroll to "Access keys"
   - Click "Create access key"
   - Select "Application running outside AWS"
   - Click "Next" → "Create access key"
   - **IMPORTANT:** Copy both:
     - **Access key ID** (starts with `AKIA...`)
     - **Secret access key** (long string - copy immediately, can't view again!)

## Step 4: Add to Your .env.local File

Open your `.env.local` file and add:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID="AKIAXXXXXXXXXXXXXXXX"
AWS_SECRET_ACCESS_KEY="your-secret-access-key-here"
AWS_REGION="af-south-1"
AWS_S3_BUCKET="ghana-emergency-reports"
```

**Note:** The code uses `AWS_S3_BUCKET` (not `AWS_S3_BUCKET_NAME`)

## Step 5: Verify Setup

Run this command to test:

```bash
npm run dev
```

Then try uploading a file in the citizen reporting flow.

## Cost

- **Free Tier:** 5GB storage, 20,000 GET requests/month
- **After Free Tier:** ~$0.023/GB storage, $0.005/1,000 requests

For MVP, you'll likely stay in free tier.

## Troubleshooting

### "Access Denied" Error
- Check IAM user has `AmazonS3FullAccess` policy
- Verify access keys are correct
- Check bucket name matches exactly

### "Bucket Not Found" Error
- Verify bucket name is correct
- Check region matches
- Ensure bucket exists in AWS console

### "Invalid Credentials" Error
- Re-check access key ID and secret access key
- Make sure no extra spaces in `.env.local`
- Restart dev server after changing env vars

---

**Once AWS S3 is configured, you're ready to test!**
