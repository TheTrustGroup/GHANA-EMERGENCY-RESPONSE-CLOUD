# Local Testing & Preview Guide

This guide will help you set up and test the Ghana Emergency Response Platform locally before deploying to production.

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] Node.js 20+ installed (`node --version`)
- [ ] npm or yarn installed (`npm --version`)
- [ ] PostgreSQL installed and running (or use a cloud database)
- [ ] Git installed (for cloning if needed)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Local Environment

```bash
# Copy example environment file
cp env.example .env.local
```

### Step 3: Configure Local Database

Edit `.env.local` and set your local database:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/ghana_emergency_dev?schema=public"
```

### Step 4: Set Up Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (or push schema)
npm run db:push

# (Optional) Seed with test data
npm run db:seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

---

## 📝 Detailed Setup

### 1. Environment Variables for Local Development

Create `.env.local` file with these values:

```bash
# Database (Local PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/ghana_emergency_dev?schema=public"

# NextAuth (Local)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-dev-secret-key-change-in-production"

# Encryption
ENCRYPTION_MASTER_KEY="local-dev-encryption-key-32-chars-min"

# Mapbox (Use your production token or get a dev token)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your_mapbox_token_here"

# Pusher (Use your production credentials or create a dev app)
PUSHER_APP_ID="your_pusher_app_id"
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your_cluster"

# AWS S3 (Optional for local - can use local storage)
AWS_ACCESS_KEY_ID="your_aws_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret"
AWS_REGION="af-south-1"
AWS_S3_BUCKET_NAME="ghana-emergency-reports-dev"

# Email (Optional for local testing)
EMAIL_FROM="noreply@localhost"
# AWS SES
AWS_SES_REGION="af-south-1"
# OR SendGrid
# SENDGRID_API_KEY="your_sendgrid_key"

# SMS (Optional for local testing)
SMS_PROVIDER="africas_talking"
AFRICASTALKING_API_KEY="your_api_key"
AFRICASTALKING_USERNAME="your_username"

# Redis (Optional for local - can use in-memory rate limiter)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# Application
NODE_ENV="development"
PORT="3000"
LOG_LEVEL="debug"
```

**Note:** For local testing, you can use:
- Production API keys (they have free tiers)
- Placeholder values for services you don't need to test
- Local PostgreSQL database
- Optional Redis (rate limiting will use in-memory fallback)

---

### 2. Database Setup Options

#### Option A: Local PostgreSQL (Recommended)

**Install PostgreSQL:**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

**Create Database:**
```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE ghana_emergency_dev;
CREATE USER emergency_dev WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ghana_emergency_dev TO emergency_dev;
\q
```

**Update `.env.local`:**
```bash
DATABASE_URL="postgresql://emergency_dev:your_password@localhost:5432/ghana_emergency_dev?schema=public"
```

#### Option B: Cloud Database (Easier)

Use a free cloud PostgreSQL service:
- **Supabase** (https://supabase.com/) - Free tier available
- **Neon** (https://neon.tech/) - Free tier available
- **Railway** (https://railway.app/) - Free tier available

Get connection string and add to `.env.local`

---

### 3. Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# OR use migrations (if you have migration files)
npx prisma migrate dev
```

---

### 4. Seed Test Data (Optional)

```bash
npm run db:seed
```

This will create:
- Test users (admin, dispatcher, responder, citizen)
- Test agencies
- Sample incidents
- Test data for all features

---

### 5. Start Development Server

```bash
npm run dev
```

Open your browser: **http://localhost:3000**

---

## 🧪 Testing Features

### 1. User Authentication

**Test Accounts (if seeded):**
- **Admin:** admin@example.com / password
- **Dispatcher:** dispatcher@example.com / password
- **Responder:** responder@example.com / password
- **Citizen:** citizen@example.com / password

**Or create new account:**
- Go to `/auth/register`
- Fill in registration form
- Verify email (check console/logs in dev mode)

### 2. Incident Reporting

1. Login as Citizen
2. Go to Dashboard
3. Click "Report Incident"
4. Fill in incident details
5. Upload media (if S3 configured)
6. Submit

### 3. Dispatch Management

1. Login as Dispatcher
2. Go to Dispatch section
3. View pending incidents
4. Assign agencies
5. Track responses

### 4. Responder Features

1. Login as Responder
2. View assigned incidents
3. Accept/reject assignments
4. Update status
5. Send messages

### 5. Real-time Updates

1. Open two browser windows
2. Login as different users
3. Create/update incident in one window
4. See updates in real-time in other window

### 6. Maps & Location

1. Go to Map view
2. See incidents on map
3. Filter by category/severity
4. Click incident markers for details

---

## 🔧 Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server`

**Solutions:**
- Check PostgreSQL is running: `pg_isready`
- Verify connection string in `.env.local`
- Check database exists: `psql -l`
- Verify user permissions

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solutions:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# OR use different port
PORT=3001 npm run dev
```

### Prisma Client Not Generated

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npm run db:generate
```

### Environment Variables Not Loading

**Error:** `process.env.VARIABLE is undefined`

**Solutions:**
- Ensure file is named `.env.local` (not `.env`)
- Restart development server after changing `.env.local`
- Check variable names match exactly

### Mapbox Not Loading

**Error:** Map not displaying

**Solutions:**
- Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set
- Check token is valid at https://account.mapbox.com/
- Check browser console for errors
- Verify token has correct scopes

### Pusher Connection Issues

**Error:** Real-time features not working

**Solutions:**
- Verify all Pusher credentials are set
- Check cluster matches in all places
- Verify app is not paused in Pusher dashboard
- Check browser console for connection errors

---

## 📊 Testing Checklist

### Core Features
- [ ] User registration
- [ ] User login/logout
- [ ] Password reset
- [ ] Email verification
- [ ] Profile management

### Incident Management
- [ ] Create incident
- [ ] View incidents
- [ ] Update incident status
- [ ] Upload media files
- [ ] Filter/search incidents

### Dispatch System
- [ ] View pending incidents
- [ ] Assign agencies
- [ ] Calculate ETA
- [ ] Track responders
- [ ] Update dispatch status

### Real-time Features
- [ ] Live incident updates
- [ ] Real-time messaging
- [ ] Notification system
- [ ] Status changes

### Maps & Location
- [ ] Display incidents on map
- [ ] Filter by location
- [ ] Click markers for details
- [ ] Location picker

### Reports & Analytics
- [ ] Generate reports
- [ ] View analytics
- [ ] Export data
- [ ] Dashboard statistics

---

## 🎯 Quick Test Scenarios

### Scenario 1: Full Incident Flow

1. **Citizen reports incident:**
   - Register/Login as citizen
   - Report fire incident
   - Upload photo
   - Submit

2. **Dispatcher assigns agency:**
   - Login as dispatcher
   - View new incident
   - Assign fire department
   - Confirm assignment

3. **Responder accepts:**
   - Login as responder
   - View assignment
   - Accept assignment
   - Update status to "En Route"

4. **Responder arrives:**
   - Update status to "Arrived"
   - Send message to dispatcher
   - Mark incident as resolved

### Scenario 2: Real-time Communication

1. Open two browser windows
2. Login as different users
3. Open same incident
4. Send messages between users
5. Verify real-time updates

### Scenario 3: Multi-user Testing

1. Open 3-4 browser windows
2. Login as different roles:
   - Citizen
   - Dispatcher
   - Responder
   - Admin
3. Test concurrent operations
4. Verify data consistency

---

## 🐛 Debug Mode

Enable debug logging:

```bash
# In .env.local
LOG_LEVEL="debug"
NODE_ENV="development"
```

View logs:
- Server logs: Terminal where `npm run dev` is running
- Browser console: F12 → Console tab
- Network requests: F12 → Network tab

---

## 📱 Testing on Mobile

### Option 1: Local Network

1. Find your local IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update `.env.local`:
   ```bash
   NEXTAUTH_URL="http://YOUR_IP:3000"
   ```

3. Access from mobile:
   - Connect phone to same WiFi
   - Open: `http://YOUR_IP:3000`

### Option 2: Tunneling (Recommended)

Use a tunneling service:
- **ngrok:** `ngrok http 3000`
- **localtunnel:** `npx localtunnel --port 3000`
- **Cloudflare Tunnel:** Free and secure

---

## 🔒 Security Testing

Test security features:

- [ ] Rate limiting (try rapid requests)
- [ ] Input validation (try SQL injection, XSS)
- [ ] Authentication (try accessing protected routes)
- [ ] Authorization (try accessing other users' data)
- [ ] File upload security (try malicious files)
- [ ] CSRF protection

---

## 📈 Performance Testing

Monitor performance:

1. **Open DevTools:**
   - F12 → Performance tab
   - Record page load
   - Analyze results

2. **Check Network:**
   - F12 → Network tab
   - Check request times
   - Verify caching

3. **Database Queries:**
   - Use Prisma Studio: `npm run db:studio`
   - Monitor slow queries
   - Check indexes

---

## ✅ Pre-Deployment Checklist

Before moving to production, verify:

- [ ] All features work locally
- [ ] No console errors
- [ ] Database migrations work
- [ ] API endpoints respond correctly
- [ ] Real-time features work
- [ ] File uploads work
- [ ] Email/SMS (if configured) work
- [ ] Security features work
- [ ] Performance is acceptable
- [ ] Mobile responsive

---

## 🚀 Next Steps

Once local testing is complete:

1. **Fix any issues found**
2. **Document any customizations**
3. **Proceed to Phase 2:** Infrastructure Setup
4. **Deploy to staging** (optional)
5. **Deploy to production**

---

## 📞 Need Help?

If you encounter issues:

1. Check browser console for errors
2. Check server logs in terminal
3. Verify all environment variables
4. Check database connection
5. Review this guide's troubleshooting section

---

**Happy Testing! 🎉**

