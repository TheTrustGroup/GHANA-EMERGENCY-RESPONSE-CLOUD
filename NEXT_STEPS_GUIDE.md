# 🚀 Next Steps Guide - Ghana Emergency Response Platform

**Current Status:** ✅ Application deployed to Vercel  
**Production URL:** https://ghana-emergency-response.vercel.app

---

## 📋 Immediate Actions (Do First)

### Step 1: Configure Environment Variables in Vercel

**Why:** Your app needs database, API keys, and secrets to function.

**How to do it:**

1. **Open Vercel Dashboard:**
   ```bash
   vercel dashboard
   ```
   Or visit: https://vercel.com/technologists-projects-d0a832f8/ghana-emergency-response

2. **Navigate to Settings:**
   - Click on your project
   - Go to **Settings** → **Environment Variables**

3. **Add these variables one by one:**

   #### Database (Required)
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
   ```
   - Get this from your PostgreSQL provider (Supabase, Railway, AWS RDS, etc.)

   #### Authentication (Required)
   ```
   NEXTAUTH_URL=https://ghana-emergency-response.vercel.app
   NEXTAUTH_SECRET=<generate-using-openssl-rand-base64-32>
   ```
   - Generate secret: `openssl rand -base64 32`

   #### Mapbox (Required for maps)
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
   ```
   - Get from: https://account.mapbox.com/access-tokens/

   #### Pusher (Required for real-time)
   ```
   PUSHER_APP_ID=your_app_id
   NEXT_PUBLIC_PUSHER_KEY=your_key
   PUSHER_SECRET=your_secret
   NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
   ```
   - Get from: https://dashboard.pusher.com/

   #### AWS S3 (Required for file uploads)
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=af-south-1
   AWS_S3_BUCKET_NAME=ghana-emergency-reports-prod
   ```
   - Get from: https://aws.amazon.com/

   #### Optional (But Recommended)
   ```
   SENTRY_DSN=your_sentry_dsn
   REDIS_URL=redis://host:6379
   ```

4. **Set Environment for each variable:**
   - Select: **Production**, **Preview**, and **Development**
   - Click **Save**

5. **Redeploy after adding variables:**
   ```bash
   vercel --prod
   ```

---

### Step 2: Set Up Production Database

**Options (Choose One):**

#### Option A: Supabase (Easiest - Free Tier Available)
1. Go to https://supabase.com
2. Create account → New Project
3. Copy connection string from Settings → Database
4. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`
5. Add to Vercel as `DATABASE_URL`

#### Option B: Railway (Simple)
1. Go to https://railway.app
2. New Project → Add PostgreSQL
3. Copy connection string
4. Add to Vercel as `DATABASE_URL`

#### Option C: AWS RDS (Enterprise)
1. Create RDS PostgreSQL instance
2. Configure security groups
3. Copy connection string
4. Add to Vercel as `DATABASE_URL`

**After setting up database:**

```bash
# Run migrations
npx prisma migrate deploy

# Or if using Prisma directly
npx prisma db push
```

---

### Step 3: Run Database Migrations

**In your local terminal:**

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="postgresql://..."

# Generate Prisma client
npm run db:generate

# Run migrations
npx prisma migrate deploy

# Or push schema (if no migrations)
npx prisma db push
```

**Or use Vercel CLI:**

```bash
# Set environment variable locally
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy
```

---

## 🔧 Configuration Steps

### Step 4: Set Up AWS S3 Bucket

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://ghana-emergency-reports-prod --region af-south-1
   ```

2. **Configure Bucket:**
   - Block public access (we use presigned URLs)
   - Enable versioning
   - Set lifecycle policies

3. **Create IAM User:**
   - Go to AWS IAM Console
   - Create user with S3 permissions
   - Generate access keys
   - Add to Vercel environment variables

---

### Step 5: Configure Pusher

1. **Create Pusher App:**
   - Go to https://dashboard.pusher.com/
   - Create new app
   - Choose cluster closest to Ghana (e.g., `eu`, `ap-southeast-1`)
   - Copy credentials
   - Add to Vercel environment variables

---

### Step 6: Configure Mapbox

1. **Get Mapbox Token:**
   - Go to https://account.mapbox.com/access-tokens/
   - Create new token
   - Set scopes: `styles:read`, `fonts:read`, `datasets:read`
   - Add to Vercel as `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## 🧪 Testing Steps

### Step 7: Test Production Deployment

1. **Visit your production URL:**
   ```
   https://ghana-emergency-response.vercel.app
   ```

2. **Test critical flows:**
   - [ ] Homepage loads
   - [ ] Sign up works
   - [ ] Sign in works
   - [ ] Dashboard loads (after login)
   - [ ] Report emergency works
   - [ ] Maps display correctly
   - [ ] File uploads work

3. **Check logs if issues:**
   ```bash
   vercel logs https://ghana-emergency-response.vercel.app
   ```

---

## 🎯 Post-Deployment Tasks

### Step 8: Set Up Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to Settings → Domains
   - Add your domain (e.g., `emergency.gov.gh`)
   - Follow DNS configuration instructions

2. **Update NEXTAUTH_URL:**
   - Change to your custom domain
   - Redeploy

---

### Step 9: Set Up Monitoring

1. **Sentry (Error Tracking):**
   - Sign up at https://sentry.io
   - Create Next.js project
   - Add `SENTRY_DSN` to Vercel
   - Install: `npm install @sentry/nextjs`

2. **Uptime Monitoring:**
   - Use UptimeRobot (free): https://uptimerobot.com
   - Monitor your production URL
   - Set up alerts

---

### Step 10: Create Admin User

**Option 1: Using Prisma Studio**
```bash
# Connect to production database
export DATABASE_URL="postgresql://..."
npx prisma studio
```

**Option 2: Using Seed Script**
```bash
# Create seed script for admin
npm run db:seed
```

**Option 3: Using API (if registration is open)**
- Register through the app
- Manually update role in database to `SYSTEM_ADMIN`

---

## 📊 Quick Reference Commands

### Vercel Commands
```bash
# View deployments
vercel ls

# View logs
vercel logs

# Open dashboard
vercel dashboard

# Redeploy
vercel --prod

# Pull environment variables
vercel env pull .env.production
```

### Database Commands
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npx prisma migrate deploy

# Push schema (dev)
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

### Build & Test Commands
```bash
# Build locally
npm run build

# Type check
npm run type-check

# Run tests
npm test

# Start production server locally
npm start
```

---

## 🚨 Troubleshooting

### Issue: Database Connection Error
**Solution:**
- Check `DATABASE_URL` is correct in Vercel
- Verify database allows connections from Vercel IPs
- Check database is running

### Issue: Maps Not Loading
**Solution:**
- Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set
- Check token has correct scopes
- Verify token hasn't expired

### Issue: Real-time Not Working
**Solution:**
- Check all Pusher variables are set
- Verify cluster matches in all variables
- Check Pusher app is not paused

### Issue: File Uploads Failing
**Solution:**
- Verify AWS credentials are correct
- Check S3 bucket exists and is accessible
- Verify IAM user has S3 permissions

---

## ✅ Checklist

Before going live, ensure:

- [ ] All environment variables configured in Vercel
- [ ] Production database set up and accessible
- [ ] Database migrations run successfully
- [ ] S3 bucket created and configured
- [ ] Pusher app created and configured
- [ ] Mapbox token obtained
- [ ] Admin user created
- [ ] Production URL tested
- [ ] All critical flows tested
- [ ] Monitoring set up
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Project Dashboard:** https://vercel.com/technologists-projects-d0a832f8/ghana-emergency-response

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Production URL loads without errors
- ✅ Users can sign up and sign in
- ✅ Emergency reports can be created
- ✅ Maps display correctly
- ✅ Real-time updates work
- ✅ File uploads succeed
- ✅ All dashboards accessible

---

**Last Updated:** $(date)  
**Status:** Ready for Production Configuration
