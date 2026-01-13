# 📝 Signup Capabilities - User & Agency Registration

**Status:** ✅ **SIGNUPS ARE ENABLED**

---

## ✅ Current Signup Status

### Public Registration Available

Users can sign up at: **https://ghana-emergency-response.vercel.app/auth/register**

---

## 👥 Who Can Sign Up?

### 1. **CITIZENS** ✅ (Self-Registration Enabled)

**Who:** Regular citizens who want to report emergencies

**Process:**
1. Go to `/auth/register`
2. Fill in personal information
3. Select "Citizen" role
4. Accept terms
5. **Account activated immediately** ✅
6. Can start reporting emergencies right away

**Requirements:**
- Name
- Email
- Phone number (Ghana format)
- Password (min 8 chars, must have uppercase, lowercase, number)
- Terms acceptance

**Activation:** Immediate (no approval needed)

---

### 2. **RESPONDERS** ✅ (Self-Registration with Agency Selection)

**Who:** First responders who want to join an emergency response agency

**Process:**
1. Go to `/auth/register`
2. Fill in personal information
3. Select "Responder" role
4. **Select agency from dropdown** (required)
5. Accept terms
6. **Account created but requires admin approval** ⚠️
7. Admin must activate account before responder can use it

**Requirements:**
- Name
- Email
- Phone number
- Password
- **Agency selection** (from list of 5 agencies)
- Terms acceptance

**Activation:** Requires admin approval (not immediate)

**Available Agencies:**
- NADMO Headquarters
- Ghana National Fire Service - Tema
- Ghana Police Service - Kumasi
- National Ambulance Service - Takoradi
- SecureGuard Emergency Services

---

### 3. **DISPATCHERS** ❌ (Admin-Only)

**Who:** Emergency dispatchers who coordinate responses

**Process:**
- **Cannot self-register**
- Must be created by SYSTEM_ADMIN or AGENCY_ADMIN
- Created via `/dashboard/users` (admin dashboard)

---

### 4. **AGENCY_ADMIN** ❌ (Admin-Only)

**Who:** Agency administrators who manage their agency

**Process:**
- **Cannot self-register**
- Must be created by SYSTEM_ADMIN
- Created via `/dashboard/users` (admin dashboard)
- Must be assigned to an agency

---

### 5. **SYSTEM_ADMIN** ❌ (Admin-Only)

**Who:** System administrators with full platform access

**Process:**
- **Cannot self-register**
- Must be created by existing SYSTEM_ADMIN
- Created via `/dashboard/users` (admin dashboard)
- Or via database seed script

---

## 🏢 Agency Registration

### Current Status: ❌ **Agencies Cannot Be Self-Registered**

**Who Can Create Agencies:**
- Only SYSTEM_ADMIN users
- Via `/dashboard/agencies` (admin dashboard)

**Process:**
1. Login as SYSTEM_ADMIN
2. Go to `/dashboard/agencies`
3. Click "Create Agency"
4. Fill in:
   - Name
   - Type (NADMO, FIRE_SERVICE, POLICE, AMBULANCE, PRIVATE_RESPONDER)
   - Contact info
   - Address and coordinates
   - Coverage radius

**Existing Agencies (Created via Seed):**
- ✅ NADMO Headquarters
- ✅ Ghana National Fire Service - Tema
- ✅ Ghana Police Service - Kumasi
- ✅ National Ambulance Service - Takoradi
- ✅ SecureGuard Emergency Services

---

## 📋 Registration Flow

### For Citizens:

```
1. Visit /auth/register
2. Step 1: Enter name, email, phone, password
3. Step 2: Select "Citizen" role
4. Step 3: Accept terms
5. Submit → Account created and activated ✅
6. Redirected to /auth/register/success
7. Can login immediately
```

### For Responders:

```
1. Visit /auth/register
2. Step 1: Enter name, email, phone, password
3. Step 2: Select "Responder" role
4. Step 2: Select agency from dropdown
5. Step 3: Accept terms
6. Submit → Account created (inactive) ⚠️
7. Redirected to /auth/register/pending
8. Wait for admin approval
9. Admin activates account via /dashboard/users
10. Can login after activation
```

---

## 🔧 Admin Approval Process

### For Responder Accounts:

1. **Responder registers** → Account created with `isActive: false`

2. **Admin receives notification** (if notification system is set up)

3. **Admin activates account:**
   - Login as SYSTEM_ADMIN or AGENCY_ADMIN
   - Go to `/dashboard/users`
   - Find pending responder
   - Click "Activate" or set `isActive: true`
   - Optionally assign to agency if not already assigned

4. **Responder can now login** and use the platform

---

## ✅ What's Working

- [x] Public registration page (`/auth/register`)
- [x] Citizen self-registration (immediate activation)
- [x] Responder self-registration (with agency selection)
- [x] Agency dropdown populated from database
- [x] Password validation and strength indicator
- [x] Terms acceptance requirement
- [x] Multi-step registration form
- [x] Email/phone validation
- [x] Duplicate user prevention

---

## ⚠️ What Needs Admin Action

### Responder Approval:

1. **Check for pending responders:**
   ```bash
   # Via Prisma Studio
   npm run db:studio
   # Filter users where role = RESPONDER and isActive = false
   ```

2. **Or via dashboard:**
   - Login as admin
   - Go to `/dashboard/users`
   - Look for inactive responders
   - Activate them

---

## 🎯 Recommendations

### Option 1: Keep Current System (Recommended)

**Pros:**
- ✅ Citizens can sign up immediately (good for adoption)
- ✅ Responders require approval (security/quality control)
- ✅ Prevents unauthorized access to sensitive roles

**Cons:**
- ⚠️ Admin must manually approve responders
- ⚠️ No automatic notification when responder registers

### Option 2: Enable Agency Self-Registration

**If you want agencies to register themselves:**

1. Create agency registration page
2. Add agency approval workflow
3. Allow agencies to create their own admin accounts
4. Require SYSTEM_ADMIN approval for new agencies

**Implementation needed:**
- New registration page for agencies
- Agency approval system
- Agency admin account creation

---

## 📊 Current Registration Statistics

After seeding:
- **5 Agencies** (all active)
- **26 Test Users** (all active)
- **0 Pending Approvals** (all test accounts pre-activated)

---

## 🧪 Test Registration

### Test Citizen Signup:

1. Go to: https://ghana-emergency-response.vercel.app/auth/register
2. Fill form:
   - Name: "Test Citizen"
   - Email: "newcitizen@test.com"
   - Phone: "+233244000100"
   - Password: "Test1234"
   - Confirm: "Test1234"
3. Step 2: Select "Citizen"
4. Step 3: Accept terms
5. Submit
6. ✅ Account created and activated immediately

### Test Responder Signup:

1. Go to: https://ghana-emergency-response.vercel.app/auth/register
2. Fill form (same as above)
3. Step 2: Select "Responder"
4. Step 2: Select an agency (e.g., "NADMO Headquarters")
5. Step 3: Accept terms
6. Submit
7. ⚠️ Account created but inactive
8. Admin must activate via dashboard

---

## 📞 Summary

**✅ Signups ARE enabled for:**
- Citizens (immediate activation)
- Responders (requires admin approval)

**❌ Signups NOT enabled for:**
- Dispatchers (admin-only)
- Agency Admins (admin-only)
- System Admins (admin-only)
- Agencies (admin-only)

**Current Status:** Ready for public use! Citizens and responders can sign up now.

---

**Need to enable agency self-registration?** Let me know and I can implement it!
