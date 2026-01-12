# Ghana Emergency Response Platform - Deployment Guide

This guide provides step-by-step instructions to deploy the platform to production with best practices and security recommendations.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Security Configuration](#security-configuration)
5. [Infrastructure Setup](#infrastructure-setup)
6. [Application Deployment](#application-deployment)
7. [Monitoring & Logging](#monitoring--logging)
8. [Performance Optimization](#performance-optimization)
9. [Backup & Disaster Recovery](#backup--disaster-recovery)
10. [Go-Live Checklist](#go-live-checklist)

---

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Code coverage meets requirements (70%+)
- [ ] No critical security vulnerabilities (`npm audit`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

### ✅ Documentation
- [ ] API documentation complete
- [ ] User guides prepared
- [ ] Admin documentation ready
- [ ] Emergency procedures documented

---

## 1. Environment Setup

### Step 1.1: Create Production Environment Variables

**Action:** Create `.env.production` file (DO NOT commit to git)

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/ghana_emergency_prod?schema=public"

# NextAuth
NEXTAUTH_URL="https://emergency.gov.gh"
NEXTAUTH_SECRET="<generate-strong-secret-32-chars-min>"

# Encryption
ENCRYPTION_MASTER_KEY="<generate-strong-key-32-chars>"

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="<your-production-mapbox-token>"

# Pusher (Real-time)
PUSHER_APP_ID="<production-app-id>"
NEXT_PUBLIC_PUSHER_KEY="<production-key>"
PUSHER_SECRET="<production-secret>"
NEXT_PUBLIC_PUSHER_CLUSTER="<cluster>"

# AWS S3 (File Storage)
AWS_ACCESS_KEY_ID="<production-key>"
AWS_SECRET_ACCESS_KEY="<production-secret>"
AWS_REGION="af-south-1"
AWS_S3_BUCKET_NAME="ghana-emergency-reports-prod"

# Email Service (Choose one)
# Option 1: AWS SES
AWS_SES_REGION="af-south-1"
EMAIL_FROM="noreply@emergency.gov.gh"

# Option 2: SendGrid
SENDGRID_API_KEY="<production-key>"

# Option 3: Africa's Talking
AFRICASTALKING_API_KEY="<production-key>"
AFRICASTALKING_USERNAME="<username>"

# SMS Service
SMS_PROVIDER="africas_talking" # or "twilio"
SMS_API_KEY="<production-key>"

# Redis (Rate Limiting & Caching)
REDIS_URL="redis://host:6379"
REDIS_PASSWORD="<production-password>"

# Monitoring
SENTRY_DSN="<production-dsn>" # Optional but recommended
```

**Best Practices:**
- Use a password manager to store secrets
- Rotate secrets every 90 days
- Use different keys for dev/staging/production
- Never commit `.env.production` to git

### Step 1.2: Generate Secure Secrets

**Action:** Generate strong secrets for production

```bash
# Generate NEXTAUTH_SECRET (32+ characters)
openssl rand -base64 32

# Generate ENCRYPTION_MASTER_KEY (32+ characters)
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

---

## 2. Database Setup

### Step 2.1: Set Up Production Database

**Recommended:** PostgreSQL 15+ on managed service (AWS RDS, DigitalOcean, or Azure)

**Action:** Create production database

```bash
# Connect to your database server
psql -h <host> -U postgres

# Create database
CREATE DATABASE ghana_emergency_prod;

# Create dedicated user
CREATE USER emergency_app WITH PASSWORD '<strong-password>';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ghana_emergency_prod TO emergency_app;
```

### Step 2.2: Run Database Migrations

**Action:** Apply Prisma migrations

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Generate Prisma client
npm run db:generate

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db pull
```

### Step 2.3: Seed Initial Data (Optional)

**Action:** Seed essential data (agencies, admin users)

```bash
# Create seed script for production
npm run db:seed:prod
```

**Best Practices:**
- Enable automated backups (daily)
- Set up read replicas for scaling
- Configure connection pooling (PgBouncer)
- Enable SSL/TLS connections
- Set up database monitoring

---

## 3. Security Configuration

### Step 3.1: SSL/TLS Certificates

**Action:** Set up HTTPS with valid certificates

**Recommended:** Use Let's Encrypt (free) or AWS Certificate Manager

```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d emergency.gov.gh -d www.emergency.gov.gh
```

### Step 3.2: Security Headers

**Action:** Verify security headers are configured

The platform already includes:
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- X-XSS-Protection

**Verify with:**
```bash
curl -I https://emergency.gov.gh | grep -i security
```

### Step 3.3: Firewall Configuration

**Action:** Configure firewall rules

```bash
# Allow only necessary ports
# HTTP (80) - Redirect to HTTPS
# HTTPS (443) - Main application
# SSH (22) - Server access (restrict by IP)
# Database (5432) - Only from application servers
```

### Step 3.4: API Rate Limiting

**Action:** Configure Redis for rate limiting

```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: requirepass <strong-password>
# Set: bind 127.0.0.1

# Restart Redis
sudo systemctl restart redis
```

**Update code:** Replace in-memory rate limiter with Redis in `src/lib/security/rate-limiter.ts`

### Step 3.5: File Upload Security

**Action:** Configure S3 bucket with proper permissions

```bash
# Create S3 bucket
aws s3 mb s3://ghana-emergency-reports-prod --region af-south-1

# Set bucket policy (block public access)
aws s3api put-public-access-block \
  --bucket ghana-emergency-reports-prod \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket ghana-emergency-reports-prod \
  --versioning-configuration Status=Enabled
```

---

## 4. Infrastructure Setup

### Step 4.1: Choose Deployment Platform

**Recommended Options:**

#### Option A: Vercel (Easiest for Next.js)
- ✅ Automatic deployments
- ✅ Built-in CDN
- ✅ Serverless functions
- ✅ Free tier available

**Action:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: AWS (Most Scalable)
- ✅ EC2 for servers
- ✅ RDS for database
- ✅ S3 for storage
- ✅ CloudFront for CDN
- ✅ Route 53 for DNS

**Action:** Follow AWS deployment guide

#### Option C: DigitalOcean (Balanced)
- ✅ Droplets for servers
- ✅ Managed PostgreSQL
- ✅ Spaces for storage
- ✅ Load balancer

**Action:** Create droplet and deploy

### Step 4.2: Set Up Domain & DNS

**Action:** Configure DNS records

```
A Record:     @ -> <server-ip>
CNAME:        www -> emergency.gov.gh
CNAME:        api -> api.emergency.gov.gh (if using subdomain)
```

### Step 4.3: Configure Reverse Proxy (Nginx)

**Action:** Set up Nginx configuration

```nginx
# /etc/nginx/sites-available/emergency.gov.gh
server {
    listen 80;
    server_name emergency.gov.gh www.emergency.gov.gh;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name emergency.gov.gh www.emergency.gov.gh;

    ssl_certificate /etc/letsencrypt/live/emergency.gov.gh/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/emergency.gov.gh/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size limit
    client_max_body_size 50M;
}
```

---

## 5. Application Deployment

### Step 5.1: Build Production Bundle

**Action:** Create optimized production build

```bash
# Install dependencies
npm ci --production=false

# Run tests
npm test

# Type check
npm run type-check

# Build
npm run build
```

### Step 5.2: Deploy Application

**Action:** Deploy to production server

```bash
# Using PM2 (Process Manager)
npm install -g pm2

# Start application
pm2 start npm --name "ghana-emergency" -- start

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

**PM2 Ecosystem File (`ecosystem.config.js`):**
```javascript
module.exports = {
  apps: [{
    name: 'ghana-emergency',
    script: 'npm',
    args: 'start',
    instances: 2, // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

### Step 5.3: Set Up CI/CD Pipeline

**Action:** Configure automated deployments

**GitHub Actions Example (`.github/workflows/deploy.yml`):**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/ghana-emergency
            git pull
            npm ci --production
            npm run build
            pm2 restart ghana-emergency
```

---

## 6. Monitoring & Logging

### Step 6.1: Set Up Application Monitoring

**Recommended:** Sentry for error tracking

**Action:** Configure Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Step 6.2: Set Up Logging

**Action:** Configure structured logging

**Recommended:** Use Winston or Pino

```bash
npm install winston
```

**Create `src/lib/logger.ts`:**
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Step 6.3: Set Up Uptime Monitoring

**Recommended Services:**
- UptimeRobot (free tier)
- Pingdom
- StatusCake

**Action:** Configure monitoring for:
- Main application URL
- API endpoints
- Database connectivity
- External services (Mapbox, Pusher)

---

## 7. Performance Optimization

### Step 7.1: Enable Caching

**Action:** Configure Redis caching

```typescript
// src/lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCache(key: string) {
  return await redis.get(key);
}

export async function setCache(key: string, value: string, ttl: number = 3600) {
  return await redis.setex(key, ttl, value);
}
```

### Step 7.2: Optimize Database Queries

**Action:** Add database indexes

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_created_at ON incidents(created_at);
CREATE INDEX idx_incidents_location ON incidents USING GIST (point(longitude, latitude));
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
```

### Step 7.3: Enable CDN

**Action:** Configure CDN for static assets

**Recommended:** Cloudflare (free tier) or AWS CloudFront

- Enable caching for static files
- Configure compression
- Set cache headers

---

## 8. Backup & Disaster Recovery

### Step 8.1: Database Backups

**Action:** Set up automated backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /backups/db_backup_$DATE.sql
aws s3 cp /backups/db_backup_$DATE.sql s3://ghana-emergency-backups/db/

# Keep only last 30 days
find /backups -name "db_backup_*.sql" -mtime +30 -delete
```

**Schedule with cron:**
```bash
0 2 * * * /path/to/backup-script.sh
```

### Step 8.2: File Storage Backups

**Action:** Enable S3 versioning and cross-region replication

```bash
# Enable versioning (already done)
# Set up lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket ghana-emergency-reports-prod \
  --lifecycle-configuration file://lifecycle.json
```

### Step 8.3: Disaster Recovery Plan

**Action:** Document recovery procedures

- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 24 hours
- Document restore procedures
- Test backups monthly

---

## 9. Go-Live Checklist

### Pre-Launch (1 Week Before)

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Load testing completed (target: 1000 concurrent users)
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Email service tested
- [ ] SMS service tested
- [ ] File upload tested
- [ ] All environment variables set
- [ ] Documentation complete

### Launch Day

- [ ] Final code review
- [ ] Deploy to production
- [ ] Verify application is accessible
- [ ] Test critical paths:
  - [ ] User registration
  - [ ] Incident reporting
  - [ ] Dispatch assignment
  - [ ] Real-time updates
  - [ ] File uploads
  - [ ] Report generation
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify backups are running

### Post-Launch (First Week)

- [ ] Monitor error rates daily
- [ ] Review performance metrics
- [ ] Check user feedback
- [ ] Address any critical issues
- [ ] Optimize based on real usage
- [ ] Schedule team debrief

---

## 10. Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor system health
- [ ] Review security alerts

### Weekly
- [ ] Review performance metrics
- [ ] Check backup status
- [ ] Update dependencies (security patches)

### Monthly
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Test disaster recovery procedures
- [ ] Review and rotate secrets
- [ ] Update documentation

### Quarterly
- [ ] Full security assessment
- [ ] Capacity planning review
- [ ] Cost optimization review
- [ ] User feedback analysis

---

## Recommended Tools & Services

### Infrastructure
- **Hosting:** Vercel, AWS, DigitalOcean, or Azure
- **Database:** AWS RDS, DigitalOcean Managed DB, or Supabase
- **Storage:** AWS S3, DigitalOcean Spaces
- **CDN:** Cloudflare (free tier) or AWS CloudFront

### Monitoring
- **Error Tracking:** Sentry (free tier available)
- **Uptime:** UptimeRobot (free tier)
- **Analytics:** Google Analytics or Plausible
- **Logs:** Papertrail, Loggly, or AWS CloudWatch

### Communication
- **Email:** AWS SES, SendGrid, or Mailgun
- **SMS:** Africa's Talking, Twilio, or AWS SNS

### Security
- **SSL:** Let's Encrypt (free) or AWS Certificate Manager
- **WAF:** Cloudflare (free tier) or AWS WAF
- **DDoS Protection:** Cloudflare (included)

---

## Cost Estimates (Monthly)

### Small Scale (100-500 users)
- Hosting: $20-50
- Database: $15-30
- Storage: $5-10
- CDN: $0-10
- Email/SMS: $10-20
- **Total: ~$50-120/month**

### Medium Scale (500-2000 users)
- Hosting: $100-200
- Database: $50-100
- Storage: $20-40
- CDN: $20-50
- Email/SMS: $50-100
- **Total: ~$240-490/month**

### Large Scale (2000+ users)
- Hosting: $300-500
- Database: $150-300
- Storage: $50-100
- CDN: $50-100
- Email/SMS: $100-200
- **Total: ~$650-1200/month**

---

## Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- tRPC: https://trpc.io/docs

### Security Resources
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security: https://nodejs.org/en/docs/guides/security/

### Emergency Contacts
- Document key personnel contacts
- Escalation procedures
- Vendor support contacts

---

## Next Steps

1. **Start with Step 1** - Set up environment variables
2. **Complete each section** in order
3. **Test thoroughly** before going live
4. **Monitor closely** after launch
5. **Iterate and improve** based on real usage

**Remember:** Security and reliability are critical for a government emergency platform. Take time to do it right.

---

**Last Updated:** 2024
**Version:** 1.0

