# File Storage Alternatives - Easy Setup Guide

Since AWS signup is difficult, here are **much easier alternatives** for file uploads:

---

## 🏆 **BEST OPTION: Supabase Storage** (Recommended)

**Why:** You're already using Supabase for database - same account, same dashboard!

### Setup Steps (5 minutes):

1. **Go to your Supabase project:**
   - Visit: https://supabase.com/dashboard
   - Select your project (the one with your database)

2. **Enable Storage:**
   - Click **Storage** in left sidebar
   - Click **Create a new bucket**
   - **Name:** `incident-reports`
   - **Public bucket:** ✅ Yes (or No if you want private)
   - Click **Create bucket**

3. **Get API Keys:**
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** (e.g., `https://clgewinupgvihlyaaevb.supabase.co`)
     - **anon public** key (starts with `eyJ...`)

4. **Add to Vercel:**
   ```bash
   # Add these environment variables
   echo "https://clgewinupgvihlyaaevb.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
   echo "your-anon-key" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   echo "your-service-role-key" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
   ```

5. **Update code** (I'll help you with this - minimal changes needed)

**Cost:** Free tier includes 1GB storage, 2GB bandwidth/month

---

## 🥈 **Option 2: Cloudflare R2** (S3-Compatible, No Egress Fees)

**Why:** S3-compatible API, so minimal code changes. No egress fees!

### Setup Steps:

1. **Sign up:** https://dash.cloudflare.com/sign-up
   - Much easier than AWS - just email/password

2. **Create R2 Bucket:**
   - Go to **R2** → **Create bucket**
   - Name: `ghana-emergency-reports`
   - Click **Create**

3. **Create API Token:**
   - Go to **Manage R2 API Tokens**
   - Click **Create API token**
   - Permissions: **Object Read & Write**
   - Copy **Access Key ID** and **Secret Access Key**

4. **Add to Vercel:**
   ```bash
   echo "your-access-key" | vercel env add AWS_ACCESS_KEY_ID production
   echo "your-secret-key" | vercel env add AWS_SECRET_ACCESS_KEY production
   echo "auto" | vercel env add AWS_REGION production
   echo "your-account-id.r2.cloudflarestorage.com" | vercel env add AWS_S3_BUCKET_NAME production
   echo "https://your-account-id.r2.cloudflarestorage.com" | vercel env add AWS_ENDPOINT production
   ```

**Cost:** Free tier includes 10GB storage, unlimited egress

---

## 🥉 **Option 3: Cloudinary** (Easiest for Images/Videos)

**Why:** Super simple API, great for images/videos, excellent free tier

### Setup Steps:

1. **Sign up:** https://cloudinary.com/users/register/free
   - Just email/password

2. **Get credentials:**
   - After signup, go to Dashboard
   - Copy:
     - **Cloud name**
     - **API Key**
     - **API Secret**

3. **Add to Vercel:**
   ```bash
   echo "your-cloud-name" | vercel env add CLOUDINARY_CLOUD_NAME production
   echo "your-api-key" | vercel env add CLOUDINARY_API_KEY production
   echo "your-api-secret" | vercel env add CLOUDINARY_API_SECRET production
   ```

4. **Update code** (requires code changes - I can help)

**Cost:** Free tier includes 25GB storage, 25GB bandwidth/month

---

## 🎯 **Option 4: DigitalOcean Spaces** (S3-Compatible)

**Why:** S3-compatible, simpler than AWS, good pricing

### Setup Steps:

1. **Sign up:** https://www.digitalocean.com/
   - Email/password, credit card required

2. **Create Space:**
   - Go to **Spaces** → **Create a Space**
   - Name: `ghana-emergency-reports`
   - Region: Choose closest to Ghana
   - Click **Create**

3. **Generate API Key:**
   - Go to **API** → **Spaces Keys**
   - Generate new key
   - Copy **Access Key** and **Secret Key**

4. **Add to Vercel:**
   ```bash
   echo "your-access-key" | vercel env add AWS_ACCESS_KEY_ID production
   echo "your-secret-key" | vercel env add AWS_SECRET_ACCESS_KEY production
   echo "nyc3" | vercel env add AWS_REGION production
   echo "ghana-emergency-reports" | vercel env add AWS_S3_BUCKET_NAME production
   echo "https://nyc3.digitaloceanspaces.com" | vercel env add AWS_ENDPOINT production
   ```

**Cost:** $5/month for 250GB storage + bandwidth

---

## 📊 Comparison

| Service | Ease of Setup | Cost | S3-Compatible | Best For |
|---------|--------------|------|----------------|----------|
| **Supabase Storage** | ⭐⭐⭐⭐⭐ | Free tier | ✅ Yes | Already using Supabase |
| **Cloudflare R2** | ⭐⭐⭐⭐ | Free tier | ✅ Yes | No egress fees |
| **Cloudinary** | ⭐⭐⭐⭐⭐ | Free tier | ❌ No | Images/videos only |
| **DigitalOcean Spaces** | ⭐⭐⭐⭐ | $5/month | ✅ Yes | Simple S3 alternative |

---

## 🚀 **My Recommendation: Supabase Storage**

Since you're already using Supabase:
- ✅ Same account/login
- ✅ Same dashboard
- ✅ S3-compatible API (minimal code changes)
- ✅ Free tier is generous
- ✅ Easy to set up (5 minutes)

---

## Next Steps

**If you choose Supabase Storage:**
1. I'll update the code to use Supabase Storage
2. Add the environment variables
3. Test file uploads
4. Deploy!

**If you choose another option:**
- Let me know which one
- I'll help you set it up and update the code

---

**Which option would you like to use?** I recommend Supabase Storage since you're already using it! 🎯
