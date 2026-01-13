# Environment Variables Setup Status

## ✅ Completed

### Database
- ✅ **DATABASE_URL** - Added to Production, Preview, Development
  - Connection: `postgresql://postgres:dnkc3gJRCCdo6nfY@db.clgewinupgvihlyaaevb.supabase.co:5432/postgres`
  - Status: Database schema pushed successfully

### Authentication
- ✅ **NEXTAUTH_URL** - Added to Production
  - Value: `https://ghana-emergency-response.vercel.app`
- ✅ **NEXTAUTH_SECRET** - Added to Production, Preview, Development
  - Value: `lGmnSP9/kFI6mjDgp2yrzimATxs9lDocEz1ZN0FEdtM=`
  - Status: Generated securely

## ⚠️ Still Needed

### Maps (Required)
- ✅ **NEXT_PUBLIC_MAPBOX_TOKEN** - Added to Production, Preview, Development
  - Status: Configured

### Real-time (Required)
- ✅ **PUSHER_APP_ID** - Added to Production, Preview, Development
- ✅ **NEXT_PUBLIC_PUSHER_KEY** - Added to Production, Preview, Development
- ✅ **PUSHER_SECRET** - Added to Production, Preview, Development
- ✅ **NEXT_PUBLIC_PUSHER_CLUSTER** - Added to Production, Preview, Development (eu)
  - Status: Configured

### File Storage (Required) - Using Supabase Storage
- ✅ **NEXT_PUBLIC_SUPABASE_URL** - Added to Production, Preview, Development
  - Value: `https://clgewinupgvihlyaaevb.supabase.co`
- ✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Added to Production, Preview, Development
- ✅ **SUPABASE_SERVICE_ROLE_KEY** - Added to Production, Preview, Development
- ✅ **Storage Bucket** - `incident-reports` bucket created

### Optional (Recommended)
- [ ] **SENTRY_DSN** - For error tracking
- [ ] **REDIS_URL** - For rate limiting and caching

## Quick Add Commands

### Add Mapbox Token
```bash
echo "pk.your_token_here" | vercel env add NEXT_PUBLIC_MAPBOX_TOKEN production
```

### Add Pusher Credentials
```bash
echo "your_app_id" | vercel env add PUSHER_APP_ID production
echo "your_key" | vercel env add NEXT_PUBLIC_PUSHER_KEY production
echo "your_secret" | vercel env add PUSHER_SECRET production
echo "your_cluster" | vercel env add NEXT_PUBLIC_PUSHER_CLUSTER production
```

### Add AWS Credentials
```bash
echo "your_access_key" | vercel env add AWS_ACCESS_KEY_ID production
echo "your_secret_key" | vercel env add AWS_SECRET_ACCESS_KEY production
echo "af-south-1" | vercel env add AWS_REGION production
echo "your-bucket-name" | vercel env add AWS_S3_BUCKET_NAME production
```

## Next Steps

1. **Add remaining environment variables** (see above)
2. **Redeploy:**
   ```bash
   vercel --prod
   ```
3. **Test production URL:**
   - https://ghana-emergency-response.vercel.app

## View Current Environment Variables

```bash
vercel env ls
```

## Update NEXTAUTH_URL for Preview/Development

```bash
echo "http://localhost:3000" | vercel env add NEXTAUTH_URL development
echo "https://ghana-emergency-response-git-*.vercel.app" | vercel env add NEXTAUTH_URL preview
```
