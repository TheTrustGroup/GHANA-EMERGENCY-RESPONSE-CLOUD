# 📱 Mobile Preview Fix - 404 Error Solution

## 🔍 Issue Identified

The `/dashboard/citizen` route requires **authentication**. You need to sign in first!

---

## ✅ Solution: Step-by-Step Access

### Step 1: Access Sign-In Page
On your phone, go to:
```
http://192.168.1.80:3000/auth/signin
```

### Step 2: Sign In
Use these test credentials:
- **Phone**: `+233501234567`
- **Password**: `TestPassword123`

### Step 3: Auto-Redirect
After signing in, you'll be automatically redirected to:
```
http://192.168.1.80:3000/dashboard/citizen
```

---

## 🔄 Alternative: Direct Access After Sign-In

If you're already signed in on your computer's browser, you can:

1. **Copy the session cookie** from your browser
2. **Use the same browser** on your phone (if synced)
3. Or **sign in again** on your phone

---

## 🛠️ Troubleshooting

### Still Getting 404?

1. **Check Server Status**:
   ```bash
   curl http://localhost:3000/auth/signin
   ```
   Should return HTML (not 404)

2. **Verify IP Address**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Make sure it matches `192.168.1.80`

3. **Check Firewall**:
   - macOS: System Settings → Network → Firewall
   - Allow incoming connections for Node.js

4. **Restart Server**:
   ```bash
   pkill -f "next dev"
   HOSTNAME=0.0.0.0 npm run dev
   ```

---

## 📝 Quick Access URLs

### Public Routes (No Auth Required):
- Home: `http://192.168.1.80:3000/`
- Sign In: `http://192.168.1.80:3000/auth/signin`
- Sign Up: `http://192.168.1.80:3000/auth/signup`

### Protected Routes (Auth Required):
- Citizen Dashboard: `http://192.168.1.80:3000/dashboard/citizen`
- Admin Dashboard: `http://192.168.1.80:3000/dashboard/admin`
- Dispatch Center: `http://192.168.1.80:3000/dashboard/dispatch`

---

## 🎯 Recommended Flow

1. **Start Here**: `http://192.168.1.80:3000/auth/signin`
2. **Sign In**: Use test credentials
3. **Auto-Redirect**: You'll be taken to your role's dashboard
4. **Citizen Role**: Goes to `/dashboard/citizen` automatically

---

**The 404 error happens because the route is protected. Sign in first! 🔐**
