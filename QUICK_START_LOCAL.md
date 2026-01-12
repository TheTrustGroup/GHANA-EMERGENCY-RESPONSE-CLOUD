# 🚀 Quick Start - Local Testing

Get the application running locally in **5 minutes**!

---

## ✅ System Check

Your system is ready:
- ✅ Node.js v24.11.1
- ✅ npm 11.6.2
- ✅ PostgreSQL (installed & running)

---

## 🎯 Quick Setup (5 Steps)

### Step 1: Create Local Environment File

```bash
cp env.example .env.local
```

### Step 2: Configure Database

Edit `.env.local` and set your database connection:

```bash
# Use your local PostgreSQL
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ghana_emergency_dev?schema=public"
```

**Or create a new database:**
```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE ghana_emergency_dev;
\q
```

### Step 3: Add Your API Keys

Edit `.env.local` and add your API keys (you already have most of them!):

```bash
# Use your production keys (they have free tiers)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your_mapbox_token"
PUSHER_APP_ID="your_pusher_app_id"
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your_cluster"
# ... etc
```

**Quick tip:** You can copy most values from `.env.production` to `.env.local`!

### Step 4: Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push

# (Optional) Add test data
npm run db:seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

Open your browser: **http://localhost:3000** 🎉

---

## 🧪 Test Accounts (After Seeding)

If you ran `npm run db:seed`, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Dispatcher | dispatcher@example.com | password |
| Responder | responder@example.com | password |
| Citizen | citizen@example.com | password |

---

## 📋 What to Test

### 1. Authentication
- [ ] Register new account
- [ ] Login
- [ ] Logout
- [ ] Password reset

### 2. Incident Reporting
- [ ] Create incident
- [ ] Upload media
- [ ] View incidents
- [ ] Filter/search

### 3. Dispatch System
- [ ] View pending incidents
- [ ] Assign agencies
- [ ] Track responses

### 4. Real-time Features
- [ ] Live updates
- [ ] Messaging
- [ ] Notifications

### 5. Maps
- [ ] View incidents on map
- [ ] Filter by location
- [ ] Click markers

---

## 🐛 Troubleshooting

### Database Connection Error

**Fix:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string in .env.local
# Make sure database exists
psql -l | grep ghana_emergency_dev
```

### Port 3000 Already in Use

**Fix:**
```bash
# Kill process on port 3000
kill -9 $(lsof -ti:3000)

# OR use different port
PORT=3001 npm run dev
```

### Prisma Client Error

**Fix:**
```bash
npm run db:generate
```

### Environment Variables Not Loading

**Fix:**
- Make sure file is named `.env.local` (not `.env`)
- Restart dev server after changes
- Check variable names match exactly

---

## 📚 Full Documentation

For detailed testing guide, see: **LOCAL_TESTING_GUIDE.md**

---

## 🎯 Next Steps After Testing

Once you've tested everything locally:

1. ✅ Fix any issues found
2. ✅ Document customizations
3. ✅ Proceed to Phase 2: Infrastructure Setup
4. ✅ Deploy to production

---

**Ready? Let's get started!** 🚀

