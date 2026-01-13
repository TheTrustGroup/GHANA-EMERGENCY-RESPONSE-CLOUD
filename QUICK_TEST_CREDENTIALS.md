# ⚡ Quick Test Credentials - One Page Reference

**Production URL:** https://ghana-emergency-response.vercel.app/auth/signin

---

## 🎯 All Accounts Use Same Password: `Test1234`

| Role | Email | Dashboard URL |
|------|-------|---------------|
| **System Admin** | `admin@test.com` | `/dashboard/admin` |
| **Agency Admin** | `agency@test.com` | `/dashboard/agency` |
| **Dispatcher** | `dispatcher@test.com` | `/dashboard/dispatch` |
| **Responder** | `responder@test.com` | `/dashboard/responder` |
| **Citizen** | `citizen@test.com` | `/dashboard/citizen` |

---

## 🏛️ Production Test Accounts (More Realistic)

### System Admin
- **Email:** `admin@emergency.gov.gh`
- **Password:** `Admin@123`
- **Full platform access**

### Dispatchers
- **Email:** `dispatcher1@emergency.gov.gh` or `dispatcher2@emergency.gov.gh`
- **Password:** `Dispatcher@123`
- **Can assign incidents to agencies**

### Responders (10 total)
- **Email Pattern:** `responder1@nadmo.gov.gh` through `responder10@secureguard.gh`
- **Password:** `Responder@123`
- **Assigned to different agencies**

### Citizens (5 total)
- **Email Pattern:** `citizen1@example.com` through `citizen5@example.com`
- **Password:** `Citizen@123`
- **Can report emergencies**

---

## 🏢 Agencies Created

1. **NADMO Headquarters** (Accra)
2. **Ghana National Fire Service - Tema**
3. **Ghana Police Service - Kumasi**
4. **National Ambulance Service - Takoradi**
5. **SecureGuard Emergency Services** (Private, Accra)

---

## 🧪 Test Workflow

### 1. Report Emergency (Citizen)
1. Login as `citizen@test.com` / `Test1234`
2. Go to `/report`
3. Fill form and submit
4. ✅ Incident appears on dispatcher map

### 2. Dispatch (Dispatcher)
1. Login as `dispatcher@test.com` / `Test1234`
2. Go to `/dashboard/dispatch`
3. See incident on map
4. Click incident → Assign Agency → Select Responder
5. ✅ Responder gets notification

### 3. Respond (Responder)
1. Login as `responder@test.com` / `Test1234`
2. Go to `/dashboard/responder`
3. See assignment
4. Accept → Update status (EN_ROUTE → ARRIVED → COMPLETED)
5. ✅ Incident resolved

---

## 📋 Full Details

See `TEST_CREDENTIALS.md` for complete list of all 21 test accounts.

---

**All accounts created!** Ready to test the platform! 🚀
