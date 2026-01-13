# 🔐 Login Troubleshooting Guide

## Issue: "Invalid email or phone password"

### ✅ Verified Working Accounts

All these accounts exist in the database and passwords are correct:

| Email | Password | Status |
|-------|----------|--------|
| `admin@test.com` | `Test1234` | ✅ Verified |
| `citizen@test.com` | `Test1234` | ✅ Verified |
| `dispatcher@test.com` | `Test1234` | ✅ Verified |
| `responder@test.com` | `Test1234` | ✅ Verified |
| `agency@test.com` | `Test1234` | ✅ Verified |

---

## 🔍 Common Issues & Solutions

### Issue 1: Database Not Seeded in Production

**Problem:** You seeded the database locally, but production (Vercel) uses a different database.

**Solution:** Seed the production database.

**Option A: Using Prisma Studio (Recommended)**
```bash
# Set DATABASE_URL to production database
export DATABASE_URL="your-production-database-url"
npm run db:studio
# Then manually create users or use the seed script
```

**Option B: Run Seed Script Against Production**
```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"
npm run db:seed
```

**Option C: Use Vercel CLI**
```bash
# Pull production environment
vercel env pull .env.production

# Run seed with production env
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npm run db:seed
```

---

### Issue 2: Wrong Password

**Problem:** Typing the password incorrectly.

**Solution:** 
- Make sure you're using the exact password: `Test1234`
- Check for extra spaces
- Check caps lock
- Try copying and pasting the password

---

### Issue 3: Email Case Sensitivity

**Problem:** Email might have different casing.

**Solution:**
- Try lowercase: `admin@test.com` (not `Admin@test.com`)
- The system should handle this automatically, but try lowercase to be sure

---

### Issue 4: Rate Limiting

**Problem:** Too many failed login attempts.

**Solution:**
- Wait 15 minutes
- Or clear the rate limit (if you have database access)

---

### Issue 5: User Not Active

**Problem:** User exists but `isActive` is `false`.

**Solution:**
```bash
# Check user status
npm run db:studio
# Go to User model
# Find your user
# Set isActive to true
```

---

## 🧪 Test Login Locally First

Before trying production, test locally:

1. **Start local server:**
   ```bash
   npm run dev
   ```

2. **Go to:** http://localhost:3000/auth/signin

3. **Try logging in with:**
   - Email: `admin@test.com`
   - Password: `Test1234`

4. **If it works locally but not in production:**
   - The production database needs to be seeded
   - See Issue 1 above

---

## 🔧 Quick Fix: Re-seed Database

If you're not sure what's wrong, re-seed:

```bash
# Make sure DATABASE_URL points to the right database
npm run db:seed
```

This will:
- Clear existing data
- Create all agencies
- Create all test users

**⚠️ Warning:** This deletes all existing data!

---

## 📋 Verify User Exists

Check if your user exists in the database:

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'admin@test.com' } })
  .then(user => {
    console.log('User:', user ? 'Found ✅' : 'Not Found ❌');
    if (user) {
      console.log('Active:', user.isActive);
      console.log('Role:', user.role);
    }
    prisma.\$disconnect();
  });
"
```

---

## 🎯 Production Database Seeding

If you need to seed the production database:

### Step 1: Get Production DATABASE_URL

From Vercel:
```bash
vercel env pull .env.production
cat .env.production | grep DATABASE_URL
```

Or from Supabase Dashboard:
- Go to Settings → Database
- Copy connection string

### Step 2: Run Seed Against Production

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run seed
npm run db:seed
```

### Step 3: Verify

```bash
# Test connection
npx prisma db pull

# Check users
npx prisma studio
```

---

## ✅ Quick Test

Try this exact login:

1. **URL:** https://ghana-emergency-response.vercel.app/auth/signin
2. **Email:** `admin@test.com` (exactly this, lowercase)
3. **Password:** `Test1234` (exactly this, case-sensitive)
4. **Click:** Sign In

If this doesn't work, the production database likely needs to be seeded.

---

## 🆘 Still Having Issues?

1. **Check database connection:**
   - Is DATABASE_URL correct?
   - Can you connect to the database?

2. **Check user exists:**
   - Run the verify script above
   - Check Prisma Studio

3. **Check logs:**
   ```bash
   vercel logs
   ```

4. **Try creating a new user:**
   - Go to `/auth/register`
   - Create a new account
   - See if that works

---

## 📞 Need Help?

- Check `TEST_CREDENTIALS.md` for all test accounts
- Check `SEED_COMPLETE.md` for seeding status
- Review database connection in Vercel dashboard
