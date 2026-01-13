# Supabase Storage Setup Guide

## Your Supabase Project
**URL:** https://clgewinupgvihlyaaevb.supabase.co

## Step 1: Get Your API Keys

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Get API Keys:**
   - Go to **Settings** → **API**
   - You'll see:
     - **Project URL:** `https://clgewinupgvihlyaaevb.supabase.co` ✅ (You have this)
     - **anon public** key (starts with `eyJ...`) - Copy this
     - **service_role** key (starts with `eyJ...`) - Copy this (keep secret!)

## Step 2: Create Storage Bucket

1. **Go to Storage:**
   - Click **Storage** in left sidebar
   - Click **"Create a new bucket"**

2. **Configure Bucket:**
   - **Name:** `incident-reports`
   - **Public bucket:** ✅ **Yes** (so files can be accessed via URL)
   - **File size limit:** 10 MB (or leave default)
   - **Allowed MIME types:** Leave empty (allows all)
   - Click **"Create bucket"**

3. **Set Bucket Policies (Optional but Recommended):**
   - Click on the bucket
   - Go to **Policies** tab
   - Add policy for authenticated uploads (if needed)

## Step 3: Add Environment Variables to Vercel

Once you have the keys, I'll add them. You need:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Step 4: Update Code

I'll update the upload code to use Supabase Storage instead of AWS S3.

---

**Next:** Share your Supabase API keys and I'll complete the setup!
