# 🔍 Debug Login Issues - Guide

## 📊 View Logs

### Option 1: Vercel Dashboard (Recommended)
1. Go to: https://vercel.com/technologists-projects-d0a832f8/ghana-emergency-response
2. Click on **Deployments**
3. Click on the latest deployment
4. Click on **Functions** tab
5. Look for `/api/auth/[...nextauth]` function
6. Click to see logs

### Option 2: Command Line
```bash
# Get deployment ID
vercel inspect ghana-emergency-response.vercel.app

# View logs (replace DEPLOYMENT_ID)
vercel logs dpl_AdeV91SutZ374gsT4XXx7E1s6vLs

# Or use the script
bash scripts/check-auth-logs.sh
```

### Option 3: Real-time Monitoring
1. Open Vercel Dashboard
2. Go to your project → **Deployments** → Latest
3. Click **Functions** → `/api/auth/[...nextauth]`
4. Keep the page open and try logging in
5. Logs will appear in real-time

## 🔍 What to Look For

### Successful Login Logs
```
[AUTH] Using email: admin@test.com
[VALIDATE] Looking up user with identifier: admin@test.com (isEmail: true)
[VALIDATE] User found: admin@test.com (Active: true, Role: SYSTEM_ADMIN)
[VALIDATE] Password verified for: admin@test.com
[AUTH] Successfully authenticated: admin@test.com (SYSTEM_ADMIN)
```

### Failed Login Logs
```
[AUTH] Missing credentials
[VALIDATE] User not found: admin@test.com
[VALIDATE] Invalid password for: admin@test.com
[AUTH] Invalid credentials for: admin@test.com
```

## 🧪 Test Login Now

1. **Try logging in:**
   - Go to: https://ghana-emergency-response.vercel.app/auth/signin
   - Email: `admin@test.com`
   - Password: `Test1234`

2. **Immediately check logs:**
   ```bash
   bash scripts/check-auth-logs.sh
   ```

3. **Or view in dashboard:**
   - https://vercel.com/technologists-projects-d0a832f8/ghana-emergency-response/deployments
   - Click latest deployment → Functions → `/api/auth/[...nextauth]`

## 🔧 Common Issues & Fixes

### Issue: "Invalid email/phone or password"
**Check logs for:**
- `[VALIDATE] User not found` → User doesn't exist in database
- `[VALIDATE] Invalid password` → Password hash mismatch
- `[AUTH] Missing credentials` → Form not submitting correctly

**Fix:**
- Verify user exists: Run `scripts/comprehensive-check.ts`
- Reset password: Run `scripts/ensure-test-accounts.ts`

### Issue: 401 Unauthorized
**Check logs for:**
- `NEXTAUTH_SECRET` missing
- `NEXTAUTH_URL` mismatch
- Database connection errors

**Fix:**
- Verify environment variables: `vercel env ls | grep NEXTAUTH`
- Ensure `NEXTAUTH_URL` matches production URL
- Redeploy after adding variables

### Issue: No logs appearing
**Possible causes:**
- Function not being called
- Logs not enabled
- Wrong deployment

**Fix:**
- Check browser Network tab for `/api/auth/callback/credentials`
- Verify you're checking the correct deployment
- Try logging in again

## 📝 Quick Debug Checklist

- [ ] Environment variables set correctly (`vercel env ls`)
- [ ] User exists in database (`scripts/comprehensive-check.ts`)
- [ ] Password is correct (`Test1234` for test accounts)
- [ ] NEXTAUTH_URL matches production URL
- [ ] NEXTAUTH_SECRET is set
- [ ] Database is accessible
- [ ] Latest deployment is active

## 🚀 Next Steps

1. **Try logging in now**
2. **Check logs immediately after** (logs appear within seconds)
3. **Share the log output** if you see errors
4. **Check browser console** for client-side errors

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/technologists-projects-d0a832f8/ghana-emergency-response
- **Production URL:** https://ghana-emergency-response.vercel.app
- **Login Page:** https://ghana-emergency-response.vercel.app/auth/signin
