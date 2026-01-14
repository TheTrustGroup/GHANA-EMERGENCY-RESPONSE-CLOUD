# 📱 Quick Mobile Preview Fix

## ❌ Safari Error: "Couldn't establish secure connection"

Safari on iOS blocks HTTP connections for security. Here are **3 quick solutions**:

---

## ✅ Solution 1: Use Chrome (Fastest - 2 minutes)

1. **Install Chrome** from App Store (if not already installed)
2. **Open Chrome** on your iPhone
3. **Navigate to**: `http://192.168.1.80:3000/auth/signin`
4. **Works immediately!** ✅

Chrome allows HTTP connections to local networks.

---

## ✅ Solution 2: Use Firefox (Alternative)

1. **Install Firefox** from App Store
2. **Open Firefox** on your iPhone  
3. **Navigate to**: `http://192.168.1.80:3000/auth/signin`
4. **Works!** ✅

---

## ✅ Solution 3: Set Up HTTPS (For Safari)

If you want to use Safari, set up HTTPS:

### Quick Setup:
```bash
# Install mkcert
brew install mkcert

# Install local CA
mkcert -install

# Generate certificates
cd "/Users/raregem.zillion/Desktop/GHANA EMERGENCY RESPONSE CLOUD"
mkcert -key-file key.pem -cert-file cert.pem localhost 192.168.1.80

# Update package.json to add:
# "dev:https": "next dev --experimental-https --experimental-https-key ./key.pem --experimental-https-cert ./cert.pem"

# Run with HTTPS
npm run dev:https
```

Then access: `https://192.168.1.80:3000/auth/signin`

**Note:** You'll need to accept the security warning on your phone.

---

## 🎯 Recommended: Use Chrome

**Fastest and easiest solution:**
- No setup required
- Works immediately
- Better developer tools
- Same experience as Safari

---

## 📝 Test Credentials

Once you can access the page:
- **Phone**: `+233501234567`
- **Password**: `TestPassword123`

---

**Try Chrome first - it's the quickest solution! 🚀**
