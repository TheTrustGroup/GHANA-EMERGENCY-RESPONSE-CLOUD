# 🔒 Safari HTTPS Fix - iOS Connection Issue

## ❌ Problem
Safari on iOS blocks HTTP connections to local servers for security reasons. You're seeing:
> "Safari can't open the page because it couldn't establish a secure connection to the server."

---

## ✅ Solution Options

### Option 1: Use Chrome or Firefox on iPhone (Easiest)
These browsers are less strict about HTTP connections:

1. **Install Chrome** from App Store
2. Open: `http://192.168.1.80:3000/auth/signin`
3. Should work without HTTPS!

---

### Option 2: Enable HTTPS for Dev Server (Recommended)

#### Step 1: Install mkcert (for local SSL certificates)
```bash
# macOS
brew install mkcert
brew install nss  # For Firefox

# Create local CA
mkcert -install
```

#### Step 2: Generate SSL certificates
```bash
cd "/Users/raregem.zillion/Desktop/GHANA EMERGENCY RESPONSE CLOUD"
mkcert -key-file key.pem -cert-file cert.pem localhost 192.168.1.80
```

#### Step 3: Update package.json
Add HTTPS script:
```json
"dev:https": "next dev --experimental-https --experimental-https-key ./key.pem --experimental-https-cert ./cert.pem"
```

#### Step 4: Run with HTTPS
```bash
npm run dev:https
```

#### Step 5: Access on phone
```
https://192.168.1.80:3000/auth/signin
```

**Note:** You'll need to accept the security warning on your phone (tap "Advanced" → "Proceed to 192.168.1.80")

---

### Option 3: Use ngrok (Temporary Public URL)

#### Step 1: Install ngrok
```bash
brew install ngrok
# Or download from https://ngrok.com
```

#### Step 2: Start your dev server
```bash
npm run dev
```

#### Step 3: Create tunnel
```bash
ngrok http 3000
```

#### Step 4: Use the HTTPS URL from ngrok
```
https://xxxx-xxxx-xxxx.ngrok.io/auth/signin
```

---

### Option 4: Safari Workaround (Quick Fix)

1. **Try accessing via IP with port explicitly:**
   ```
   http://192.168.1.80:3000/auth/signin
   ```

2. **Clear Safari cache:**
   - Settings → Safari → Clear History and Website Data

3. **Disable Safari security (temporary):**
   - Settings → Safari → Advanced → Experimental Features
   - Enable "Disable Cross-Origin Restrictions" (if available)

---

## 🎯 Recommended: Use Chrome on iPhone

**Fastest solution:**
1. Install Chrome from App Store
2. Open: `http://192.168.1.80:3000/auth/signin`
3. Works immediately!

---

## 📱 Alternative: Test on Computer First

You can also test the citizen dashboard on your computer:
```
http://localhost:3000/dashboard/citizen
```

After signing in, you'll see the full mobile-optimized interface.

---

## 🔧 Quick Setup Script

I can create a script to set up HTTPS automatically. Would you like me to do that?

---

**For now, try Chrome or Firefox on your iPhone - it's the quickest solution! 🚀**
