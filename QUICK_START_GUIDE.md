# ⚡ Quick Start Guide - Ghana Emergency Response Platform

**Production URL:** https://ghana-emergency-response.vercel.app

---

## 🎯 What This Platform Does

**Connects citizens reporting emergencies with dispatchers and first responders in real-time.**

```
Citizen Reports → Dispatcher Sees → Assigns Responder → Responder Arrives
```

---

## 👥 5 User Roles

| Role             | What They Do                 | Dashboard              |
| ---------------- | ---------------------------- | ---------------------- |
| **CITIZEN**      | Report emergencies           | `/dashboard/citizen`   |
| **RESPONDER**    | Respond to assignments       | `/dashboard/responder` |
| **DISPATCHER**   | Assign incidents to agencies | `/dashboard/dispatch`  |
| **AGENCY_ADMIN** | Manage agency operations     | `/dashboard/agency`    |
| **SYSTEM_ADMIN** | Full platform access         | `/dashboard/admin`     |

---

## 🚀 How to Make It Useful (3 Steps)

### Step 1: Create Test Users (Already Done! ✅)

**Test accounts have been created!** You can skip this step.

**Quick Test Login:**

- Email: `admin@test.com`
- Password: `Test1234`

**Or use production test accounts:**

- See `TEST_CREDENTIALS.md` for complete list

**To create more users manually:**

```bash
npm run db:studio
```

---

### Step 2: Create Agencies (Already Done! ✅)

**5 agencies have been created!** You can skip this step.

**Created Agencies:**

1. NADMO Headquarters (Accra)
2. Ghana National Fire Service - Tema
3. Ghana Police Service - Kumasi
4. National Ambulance Service - Takoradi
5. SecureGuard Emergency Services (Private, Accra)

**To create more agencies:**

1. Login as SYSTEM_ADMIN (`admin@test.com` / `Test1234`)
2. Go to `/dashboard/agencies`
3. Click "Create Agency"
4. Create additional agencies:

**Required Agencies:**

- **Fire Service** (Type: FIRE_SERVICE)
  - Accra Fire Station
  - Kumasi Fire Station
  - Tamale Fire Station
- **Police Service** (Type: POLICE)
  - Accra Central Police
  - Regional Police Stations
- **Ambulance Service** (Type: AMBULANCE)
  - National Ambulance Service
- **NADMO** (Type: NADMO)
  - National Disaster Management

**For each agency, set:**

- Name
- Type
- Contact email/phone
- Address
- Latitude/Longitude (use Google Maps)
- Coverage radius (km)

---

### Step 3: Create Users (Already Done! ✅)

**26 test users have been created!** You can skip this step.

**Created Users:**

- 2 System Admins
- 4 Agency Admins
- 3 Dispatchers
- 11 Responders (assigned to agencies)
- 6 Citizens

**All test accounts ready to use!**

**To create more users:**

1. Login as SYSTEM_ADMIN or AGENCY_ADMIN
2. Go to `/dashboard/users`
3. Click "Create User"
4. Fill in details and assign role

---

## 📱 How It Works (Simple Flow)

### 1. Citizen Reports Emergency

**Path:** `/report` (Public - no login)

1. Select category (Fire, Medical, Accident, etc.)
2. Location auto-captured (GPS)
3. Upload photos/videos (optional)
4. Add description
5. Submit

**Result:** Incident appears on dispatcher map instantly

---

### 2. Dispatcher Assigns

**Path:** `/dashboard/dispatch` (Requires DISPATCHER role)

1. See incident on live map
2. Click incident → View details
3. Click "Assign Agency"
4. Select agency and responder
5. Done!

**Result:** Responder gets notification

---

### 3. Responder Responds

**Path:** `/dashboard/responder` (Requires RESPONDER role)

1. See assignment notification
2. Accept assignment
3. Update status: EN_ROUTE
4. Navigate to location
5. Update: ARRIVED
6. Update: COMPLETED

**Result:** Incident resolved, citizen notified

---

## 🎨 Key Features

### ✅ Real-time Updates

- All users see updates instantly
- No page refresh needed
- WebSocket-based

### ✅ Live Map

- All incidents displayed
- Color-coded by severity
- Click for details

### ✅ GPS Tracking

- Auto-capture location
- Track responder locations
- Calculate ETAs

### ✅ Analytics

- Response times
- Incident trends
- Agency performance
- Geographic distribution

### ✅ Media Upload

- Photos/videos with reports
- Automatic compression
- Secure storage

---

## 📊 Dashboard URLs

### Public

- **Home:** `/`
- **Report Emergency:** `/report`
- **Sign In:** `/auth/signin`
- **Sign Up:** `/auth/signup`

### Role-Based Dashboards

- **Citizen:** `/dashboard/citizen`
- **Responder:** `/dashboard/responder`
- **Dispatcher:** `/dashboard/dispatch`
- **Agency Admin:** `/dashboard/agency`
- **System Admin:** `/dashboard/admin`

### Common Pages

- **Analytics:** `/dashboard/analytics`
- **Map View:** `/dashboard/map`
- **All Incidents:** `/dashboard/incidents`
- **Notifications:** `/dashboard/notifications`
- **Settings:** `/dashboard/settings`

---

## 🔧 Useful Commands

```bash
# View production logs
vercel logs

# Redeploy to production
vercel --prod

# Open database studio
npm run db:studio

# Type check code
npm run type-check

# Build locally
npm run build

# Run development server
npm run dev
```

---

## ✅ Current Status

### Configured ✅

- [x] Database (Supabase PostgreSQL)
- [x] Authentication (NextAuth.js)
- [x] Maps (Mapbox)
- [x] Real-time (Pusher)
- [x] File Storage (Supabase Storage)
- [x] Deployment (Vercel)
- [x] All environment variables
- [x] **5 Agencies created**
- [x] **26 Test users created**
- [x] **All roles represented**

### Ready to Test! 🎉

- [x] Test accounts ready
- [x] Agencies configured
- [x] Ready for end-to-end workflow testing

---

## 🎯 Success Checklist

### Week 1: Setup ✅ COMPLETE

- [x] Create SYSTEM_ADMIN user
- [x] Create 5+ agencies
- [x] Create 2-3 dispatchers
- [x] Create 10+ responders
- [ ] **Test report → dispatch → respond flow** (Ready to test!)

### Week 2: Training

- [ ] Train dispatchers
- [ ] Train responders
- [ ] Create user guides
- [ ] Test with real scenarios

### Week 3: Launch Prep

- [ ] Marketing materials
- [ ] Social media setup
- [ ] Public announcement
- [ ] Support channels ready

### Week 4: Public Launch

- [ ] Launch campaign
- [ ] Monitor metrics
- [ ] Gather feedback
- [ ] Iterate and improve

---

## 📞 Need Help?

### Documentation

- **Full Briefing:** `PLATFORM_BRIEFING.md`
- **Deployment:** `DEPLOYMENT_GUIDE.md`
- **Environment:** `ENV_SETUP_STATUS.md`

### Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Production Site:** https://ghana-emergency-response.vercel.app

---

## 🚨 Emergency Workflow (Visual)

```
┌─────────────┐
│   CITIZEN   │
│   Reports   │
│  Emergency  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  INCIDENT   │
│   CREATED   │
│  (REPORTED) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ DISPATCHER  │
│   Sees on   │
│    Map      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  ASSIGNS    │
│  AGENCY +   │
│ RESPONDER   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ RESPONDER   │
│  ACCEPTS    │
│  & GOES     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ARRIVES   │
│  & RESOLVES │
└─────────────┘
```

---

**Ready to start?** Create your first admin user and begin building your emergency response network! 🚨
