# Add Database URL to Vercel - Quick Guide

## Your Database Connection String
```
postgresql://postgres:dnkc3gJRCCdo6nfY@db.clgewinupgvihlyaaevb.supabase.co:5432/postgres
```

## Method 1: Via Vercel Dashboard (Recommended)

1. **Open Vercel Dashboard:**
   ```bash
   vercel dashboard
   ```
   Or visit: https://vercel.com/technologists-projects-d0a832f8/ghana-emergency-response

2. **Navigate to:**
   - Click on your project
   - Go to **Settings** → **Environment Variables**

3. **Add Variable:**
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:dnkc3gJRCCdo6nfY@db.clgewinupgvihlyaaevb.supabase.co:5432/postgres`
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

## Method 2: Via Vercel CLI (Interactive)

```bash
vercel env add DATABASE_URL production
# When prompted, paste: postgresql://postgres:dnkc3gJRCCdo6nfY@db.clgewinupgvihlyaaevb.supabase.co:5432/postgres
# Mark as sensitive: Yes (y)
```

## Method 3: Via Vercel CLI (Non-Interactive)

```bash
echo "postgresql://postgres:dnkc3gJRCCdo6nfY@db.clgewinupgvihlyaaevb.supabase.co:5432/postgres" | vercel env add DATABASE_URL production
```

## After Adding to Vercel

1. **Run Database Migrations:**
   ```bash
   export DATABASE_URL="postgresql://postgres:dnkc3gJRCCdo6nfY@db.clgewinupgvihlyaaevb.supabase.co:5432/postgres"
   npx prisma migrate deploy
   ```

2. **Or Push Schema:**
   ```bash
   npx prisma db push
   ```

3. **Verify Connection:**
   ```bash
   npx prisma studio
   ```

4. **Redeploy to Vercel:**
   ```bash
   vercel --prod
   ```

## Next Steps

After adding DATABASE_URL, you still need:
- [ ] NEXTAUTH_SECRET
- [ ] NEXTAUTH_URL
- [ ] NEXT_PUBLIC_MAPBOX_TOKEN
- [ ] Pusher credentials
- [ ] AWS S3 credentials

See NEXT_STEPS_GUIDE.md for complete setup.
