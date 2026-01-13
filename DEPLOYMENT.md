# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables (Vercel)
```bash
CRITICAL VARIABLES:
✅ DATABASE_URL - PostgreSQL connection string
✅ NEXTAUTH_SECRET - Random 32+ character string
✅ NEXTAUTH_URL - https://your-domain.vercel.app
✅ NEXT_PUBLIC_PUSHER_KEY - Pusher app key
✅ PUSHER_SECRET - Pusher app secret
✅ PUSHER_APP_ID - Pusher app ID
✅ NEXT_PUBLIC_PUSHER_CLUSTER - Pusher cluster (e.g., mt1)

OPTIONAL BUT RECOMMENDED:
- NEXT_PUBLIC_GOOGLE_MAPS_KEY
- NEXT_PUBLIC_MAPBOX_TOKEN
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SENTRY_DSN (error tracking)
```

### 2. Database Setup
```bash
# Run migrations
npx prisma migrate deploy

# Seed initial data (agencies, demo users)
npx tsx prisma/seed.ts

# Verify
npx prisma studio
```

### 3. Build Verification
```bash
# Test build locally
npm run build
npm run start

# Test on http://localhost:3000
```

### 4. Security Checklist
```bash
✅ All console.log removed (except console.error)
✅ No debugger statements
✅ No exposed API keys
✅ HTTPS enforced
✅ CORS properly configured
✅ Rate limiting enabled
✅ Input validation on all endpoints
✅ SQL injection prevention (Prisma)
✅ XSS prevention (React)
✅ CSRF protection (NextAuth)
```

### 5. Performance Optimization
```bash
✅ Images optimized
✅ Code splitting enabled
✅ Lazy loading implemented
✅ Database indexes created
✅ API caching configured
✅ Compression enabled
```

### 6. Monitoring Setup
```bash
# Recommended services:
- Vercel Analytics (built-in)
- Sentry (error tracking)
- Uptime Robot (uptime monitoring)
- LogRocket (session replay)
```

## Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Step 3: Verify Deployment
```bash
✅ Visit site URL
✅ Test citizen registration
✅ Test sign in (all roles)
✅ Test incident reporting
✅ Test real-time updates
✅ Test mobile experience
✅ Check error logs in Vercel
```

### Step 4: Post-Deployment
```bash
# Monitor for 24 hours
# Check error rates
# Monitor performance
# Gather user feedback
```

## Rollback Procedure

If critical issues occur:
```bash
# 1. Immediate rollback in Vercel
# Go to Deployments → Previous deployment → Promote to Production

# 2. Fix issue locally

# 3. Test thoroughly

# 4. Re-deploy
```

## Support & Maintenance

### Daily Tasks
- Check error logs
- Monitor uptime
- Review user feedback

### Weekly Tasks
- Review analytics
- Update dependencies
- Backup database

### Monthly Tasks
- Security audit
- Performance review
- Feature updates
