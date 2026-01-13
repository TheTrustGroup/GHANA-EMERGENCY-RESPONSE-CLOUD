# 🌱 Seed Production Database

**Problem:** Test accounts work locally but not on production.

**Solution:** Seed the production Supabase database.

---

## 🚀 Quick Method (Recommended)

### Option 1: Using the Script

```bash
./seed-production.sh
```

This will:
1. Pull production environment variables from Vercel
2. Run the seed script against production database
3. Create all test users and agencies

---

### Option 2: Manual Steps

#### Step 1: Get Production DATABASE_URL

**From Vercel:**
```bash
vercel env pull .env.production
cat .env.production | grep DATABASE_URL
```

**Or from Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to Settings → Database
4. Copy the connection string (URI format)

#### Step 2: Set DATABASE_URL

```bash
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
```

#### Step 3: Run Seed

```bash
npm run db:seed
```

This will:
- Clear existing data
- Create 5 agencies
- Create 26 test users

---

## ✅ Verify It Worked

After seeding, test login:

1. Go to: https://ghana-emergency-response.vercel.app/auth/signin
2. Email: `admin@test.com`
3. Password: `Test1234`
4. Click Sign In

If it works, you're done! ✅

---

## 🔍 Troubleshooting

### Issue: "DATABASE_URL not found"

**Solution:**
```bash
# Pull from Vercel
vercel env pull .env.production

# Or set manually
export DATABASE_URL="your-production-database-url"
```

### Issue: "Connection refused"

**Solution:**
- Check if DATABASE_URL is correct
- Verify Supabase database is running
- Check network connectivity

### Issue: "Permission denied"

**Solution:**
- Make sure you're using the correct database credentials
- Check Supabase project settings

---

## 📋 What Gets Created

- **5 Agencies:**
  - NADMO Headquarters
  - Ghana National Fire Service - Tema
  - Ghana Police Service - Kumasi
  - National Ambulance Service - Takoradi
  - SecureGuard Emergency Services

- **26 Test Users:**
  - 2 System Admins
  - 4 Agency Admins
  - 3 Dispatchers
  - 11 Responders
  - 6 Citizens

**See `TEST_CREDENTIALS.md` for all accounts.**

---

## ⚠️ Important Notes

1. **This deletes all existing data** - Make sure you want to do this!
2. **Production database** - This affects your live site
3. **Backup first** - If you have important data, back it up first

---

## 🎯 After Seeding

Once seeded, you can:
- ✅ Test login with any test account
- ✅ Test the full workflow
- ✅ Create real users via registration
- ✅ Start using the platform

---

**Ready?** Run `./seed-production.sh` or follow the manual steps above!
