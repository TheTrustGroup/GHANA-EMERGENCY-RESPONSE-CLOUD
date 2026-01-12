# Test Credentials

Simple, easy-to-remember test credentials for all user roles.

## Quick Setup

Run this script to create all test users:

```bash
npx tsx scripts/create-test-users.ts
```

## Test Credentials

All users have the same password: **`Test1234`**

| Role | Email | Password | Use Case |
|------|-------|----------|----------|
| **Citizen** | `citizen@test.com` | `Test1234` | Test emergency reporting (`/report`) |
| **Dispatcher** | `dispatcher@test.com` | `Test1234` | Test dispatch center (`/dispatch`) |
| **Responder** | `responder@test.com` | `Test1234` | Test responder dashboard (`/dashboard/responder`) |
| **Agency Admin** | `agency@test.com` | `Test1234` | Test agency dashboard (`/dashboard/agency`) |
| **System Admin** | `admin@test.com` | `Test1234` | Test admin dashboard (`/dashboard/admin`) |

## Testing Flows

### 1. Test Citizen Reporting

1. **Login as Citizen:**
   - Go to: `http://localhost:3000/auth/signin`
   - Email: `citizen@test.com`
   - Password: `Test1234`

2. **Or Report Anonymously:**
   - Go to: `http://localhost:3000/report`
   - No login required for reporting

3. **Test Flow:**
   - Select category (Fire, Medical, Accident, Other)
   - Location auto-captures
   - Upload photo (optional)
   - Add description (optional)
   - Submit

### 2. Test Dispatcher Assignment

1. **Login as Dispatcher:**
   - Go to: `http://localhost:3000/auth/signin`
   - Email: `dispatcher@test.com`
   - Password: `Test1234`

2. **Open Dispatch Center:**
   - Go to: `http://localhost:3000/dispatch`
   - Or from dashboard: Click "Dispatch" in sidebar

3. **Test Flow:**
   - View incidents on map
   - Click incident in feed
   - Click "Assign Agency →"
   - Select agency
   - Click "Assign Agency"
   - ✅ Incident moves to "In Progress" tab

### 3. Test Responder Dashboard

1. **Login as Responder:**
   - Go to: `http://localhost:3000/auth/signin`
   - Email: `responder@test.com`
   - Password: `Test1234`

2. **View Dashboard:**
   - Go to: `http://localhost:3000/dashboard/responder`
   - Should see assigned incidents
   - Can update status, navigate, etc.

### 4. Test Agency Admin Dashboard

1. **Login as Agency Admin:**
   - Go to: `http://localhost:3000/auth/signin`
   - Email: `agency@test.com`
   - Password: `Test1234`

2. **View Dashboard:**
   - Go to: `http://localhost:3000/dashboard/agency`
   - Should see agency performance, team status, etc.

### 5. Test System Admin Dashboard

1. **Login as System Admin:**
   - Go to: `http://localhost:3000/auth/signin`
   - Email: `admin@test.com`
   - Password: `Test1234`

2. **View Dashboard:**
   - Go to: `http://localhost:3000/dashboard/admin`
   - Should see system-wide stats, all incidents, etc.

## Alternative: Seed Database

If you want more realistic test data (agencies, multiple users, etc.):

```bash
npm run db:seed
```

This creates:
- 5 Agencies (NADMO, Fire Service, Police, Ambulance, Private)
- 1 System Admin: `admin@emergency.gov.gh` / `Admin@123`
- 3 Agency Admins: `nadmo.admin@emergency.gov.gh` / `Admin@123`
- 2 Dispatchers: `dispatcher1@emergency.gov.gh` / `Dispatcher@123`
- 10 Responders: `responder1@nadmo.gov.gh` / `Responder@123`
- 5 Citizens: `citizen1@test.com` / `Citizen@123`

## Quick Test Checklist

- [ ] Run `npx tsx scripts/create-test-users.ts`
- [ ] Test citizen reporting (no login needed)
- [ ] Test dispatcher login and assignment
- [ ] Test responder dashboard
- [ ] Test agency admin dashboard
- [ ] Test system admin dashboard
- [ ] Test real-time updates (open two browsers)

## Troubleshooting

### "User not found" or "Invalid credentials"
- Run the create script: `npx tsx scripts/create-test-users.ts`
- Check database connection
- Verify `.env.local` has `DATABASE_URL`

### "User is not active"
- The script sets `isActive: true` automatically
- If still an issue, check database directly

### "Email already exists"
- The script updates existing users, so this is fine
- Or delete existing users first:
  ```sql
  DELETE FROM users WHERE email LIKE '%@test.com';
  ```

---

**Remember:** All test users have password `Test1234` for easy testing!
