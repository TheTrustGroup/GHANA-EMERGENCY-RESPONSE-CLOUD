# Create Supabase Storage Bucket - Quick Steps

## Your Supabase Project
**URL:** https://clgewinupgvihlyaaevb.supabase.co

## Steps to Create Bucket

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage:**
   - Click **Storage** in the left sidebar

3. **Create New Bucket:**
   - Click **"Create a new bucket"** button
   
4. **Configure Bucket:**
   - **Name:** `incident-reports` (exactly this name - it's hardcoded in the app)
   - **Public bucket:** ✅ **Yes** (check this box - files need to be publicly accessible)
   - **File size limit:** 10 MB (or leave default)
   - **Allowed MIME types:** Leave empty (allows all file types)
   
5. **Click "Create bucket"**

6. **Verify:**
   - You should see `incident-reports` in your buckets list
   - Status should show as "Public"

## That's It! ✅

Once the bucket is created, file uploads will work automatically.

## Test It

After creating the bucket:
1. Redeploy: `vercel --prod`
2. Try uploading a file in the app
3. Check the bucket in Supabase to see uploaded files

---

**Need help?** The bucket name must be exactly `incident-reports` (case-sensitive).
