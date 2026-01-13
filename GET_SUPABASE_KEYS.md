# Get Your Supabase API Keys - Quick Guide

## Your Supabase Project
**URL:** https://clgewinupgvihlyaaevb.supabase.co

## Step 1: Go to Supabase Dashboard

1. Visit: https://supabase.com/dashboard
2. Sign in with your account
3. Select your project (the one with your database)

## Step 2: Get API Keys

1. **Click on Settings** (gear icon in left sidebar)
2. **Click on API** (under Project Settings)

You'll see:

### Project URL ✅ (Already have this)
```
https://clgewinupgvihlyaaevb.supabase.co
```

### API Keys (You need these)

#### 1. anon public key
- **Label:** `anon` `public`
- **Description:** Public key for client-side operations
- **Starts with:** `eyJ...`
- **Copy this entire key**

#### 2. service_role key (IMPORTANT - Keep Secret!)
- **Label:** `service_role` `secret`
- **Description:** Server-side key with admin privileges
- **Starts with:** `eyJ...`
- **⚠️ WARNING:** Never expose this in client-side code!
- **Copy this entire key**

## Step 3: Create Storage Bucket

1. **Click on Storage** in left sidebar
2. **Click "Create a new bucket"**
3. **Configure:**
   - **Name:** `incident-reports`
   - **Public bucket:** ✅ **Yes** (so files can be accessed via URL)
   - **File size limit:** 10 MB (or leave default)
   - **Allowed MIME types:** Leave empty (allows all)
4. **Click "Create bucket"**

## Step 4: Share Your Keys

Once you have:
- ✅ `anon public` key
- ✅ `service_role` key

Share them with me and I'll:
1. Add them to Vercel environment variables
2. Test the upload functionality
3. Redeploy the application

---

## Quick Reference

**Where to find keys:**
- Dashboard → Settings → API

**What you need:**
1. `NEXT_PUBLIC_SUPABASE_URL` ✅ (Already added: https://clgewinupgvihlyaaevb.supabase.co)
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public key)
3. `SUPABASE_SERVICE_ROLE_KEY` (service_role key)

**Storage bucket:**
- Name: `incident-reports`
- Public: Yes

---

**Ready?** Share your API keys and I'll complete the setup! 🔑
