# 🔧 Vercel Environment Variables - Fix Guide

## ❌ Issues Found

1. **NEXTAUTH_URL missing for Preview and Development**
   - Only set for Production
   - Required for authentication to work in all environments

2. **Potential duplicate variables**
   - Some variables may have inconsistent values across environments

## ✅ Required Environment Variables

### Critical for Authentication

| Variable | Production | Preview | Development | Status |
|----------|-----------|---------|-------------|--------|
| `NEXTAUTH_URL` | ✅ Set | ❌ Missing | ❌ Missing | **FIX NEEDED** |
| `NEXTAUTH_SECRET` | ✅ Set | ✅ Set | ✅ Set | OK |
| `DATABASE_URL` | ✅ Set | ✅ Set | ✅ Set | OK |

## 🔧 Fix Commands

### Step 1: Add NEXTAUTH_URL for Preview

```bash
echo "https://ghana-emergency-response.vercel.app" | vercel env add NEXTAUTH_URL preview
```

### Step 2: Add NEXTAUTH_URL for Development

```bash
echo "http://localhost:3000" | vercel env add NEXTAUTH_URL development
```

### Step 3: Verify All Variables

```bash
vercel env ls | grep -E "NEXTAUTH|DATABASE"
```

### Step 4: Redeploy After Changes

```bash
vercel --prod
```

## 🔍 Verify Current Values

Run this to see all environment variables:

```bash
vercel env ls
```

## ⚠️ Important Notes

1. **NEXTAUTH_URL must match the actual domain:**
   - Production: `https://ghana-emergency-response.vercel.app`
   - Preview: `https://ghana-emergency-response-*.vercel.app` (or use production URL)
   - Development: `http://localhost:3000`

2. **NEXTAUTH_SECRET must be the same across all environments** (for consistency)

3. **After adding variables, you MUST redeploy** for changes to take effect

## 🧪 Test After Fix

1. Try logging in with: `admin@test.com` / `Test1234`
2. Check Vercel logs if it still fails:
   ```bash
   vercel logs --follow
   ```
3. Look for authentication errors in the logs

## 📝 Quick Fix Script

You can also run:

```bash
bash scripts/fix-vercel-env.sh
```

This will show you exactly what needs to be fixed.
