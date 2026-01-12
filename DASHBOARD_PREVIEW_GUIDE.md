# 🚨 Dashboard Preview Guide

## Complete Guide to Previewing All Dashboards

---

## 🚀 Quick Start

### 1. Start Development Server

```bash
npm run dev
```

The server will start at: **http://localhost:3000**

---

## 🔐 Authentication Setup

### Create Test Users

You need to create test users for each role. Use the provided scripts:

```bash
# Create test admin
npx tsx scripts/create-test-admin.ts

# Create test agency admin
npx tsx scripts/create-test-agency-admin.ts

# Create test users (all roles)
npx tsx scripts/create-test-users.ts
```

### Test Credentials

Check `TEST_CREDENTIALS.md` for login credentials for each role.

---

## 📊 Dashboard Access by Role

### 1. **Citizen Dashboard**

**URL:** `http://localhost:3000/dashboard/citizen`

**Login Required:** Yes (CITIZEN role)

**Features to Preview:**

- ✅ Mobile app-style interface (NO sidebar)
- ✅ Prominent "Report Emergency" button
- ✅ My Reports section with status timeline
- ✅ Quick emergency contacts
- ✅ Safety tips cards
- ✅ Bottom navigation bar

**Test Flow:**

1. Login as citizen user
2. Navigate to `/dashboard/citizen`
3. Click "Report Emergency" button
4. View your reported incidents
5. Check status updates

---

### 2. **Dispatcher Command Center**

**URL:** `http://localhost:3000/dashboard/dispatch`

**Login Required:** Yes (DISPATCHER role)

**Features to Preview:**

- ✅ Dark-themed command center (NO sidebar)
- ✅ Split-screen layout (60% Map, 40% Feed)
- ✅ Real-time incident queue
- ✅ Live map with incident markers
- ✅ Priority-based incident cards
- ✅ Critical incident pulse animations
- ✅ Map fullscreen toggle

**Test Flow:**

1. Login as dispatcher user
2. Navigate to `/dashboard/dispatch`
3. View unassigned incidents in queue
4. Click on incident to see details
5. Toggle map fullscreen
6. Test incident assignment

---

### 3. **Responder Dashboard**

**URL:** `http://localhost:3000/dashboard/responder`

**Login Required:** Yes (RESPONDER role)

**Features to Preview:**

- ✅ Full-screen mobile app (NO sidebar)
- ✅ Active mission view (when assigned)
- ✅ GPS status bar
- ✅ Mission progress timeline
- ✅ Embedded Google Maps navigation
- ✅ Huge action buttons
- ✅ Emergency SOS button
- ✅ Availability screen (when no assignment)

**Test Flow:**

1. Login as responder user
2. Navigate to `/dashboard/responder`
3. If no assignment: See availability screen
4. If assigned: See full mission view
5. Test GPS tracking
6. Test status updates (Accept, En Route, Arrived, Complete)
7. Test navigation button

---

### 4. **Agency Admin Dashboard**

**URL:** `http://localhost:3000/dashboard/agency`

**Login Required:** Yes (AGENCY_ADMIN role)

**Features to Preview:**

- ✅ Minimal sidebar (icon-only)
- ✅ Key metrics grid (4 cards)
- ✅ Team status cards
- ✅ Performance score gauge
- ✅ Response trends chart
- ✅ Incidents by category chart
- ✅ Recent assignments table

**Test Flow:**

1. Login as agency admin user
2. Navigate to `/dashboard/agency`
3. View team metrics
4. Check team member status
5. Review performance charts
6. View recent assignments

---

### 5. **System Admin Dashboard**

**URL:** `http://localhost:3000/dashboard/admin`

**Login Required:** Yes (SYSTEM_ADMIN role)

**Features to Preview:**

- ✅ Top navigation bar (NO sidebar)
- ✅ System health monitor
- ✅ Critical alerts banner
- ✅ Live geographic distribution map
- ✅ Multi-column data grid
- ✅ Real-time system metrics
- ✅ Agency performance rankings
- ✅ Incident trends charts
- ✅ Detailed analytics tabs

**Test Flow:**

1. Login as system admin user
2. Navigate to `/dashboard/admin`
3. Check system health indicators
4. View live map with all incidents
5. Review agency performance
6. Check analytics tabs
7. Monitor critical incidents

---

## 🗺️ Supporting Pages

### Map View

**URL:** `http://localhost:3000/dashboard/map`

**Features:**

- Full-screen interactive map
- All active incidents
- Agency locations
- Responder tracking
- Filter controls

---

### Incidents Pages

#### All Incidents

**URL:** `http://localhost:3000/dashboard/incidents`

#### New Incident

**URL:** `http://localhost:3000/dashboard/incidents/new`

#### Incident Detail

**URL:** `http://localhost:3000/dashboard/incidents/[id]`
(Replace `[id]` with actual incident ID)

---

### Analytics Pages

#### Main Analytics

**URL:** `http://localhost:3000/dashboard/analytics`

#### Agency Analytics

**URL:** `http://localhost:3000/dashboard/analytics/agencies/[id]`

#### Incident Analytics

**URL:** `http://localhost:3000/dashboard/analytics/incidents`

---

## 🧪 Testing Checklist

### Pre-Testing Setup

- [ ] Database is running and migrated
- [ ] Test users are created
- [ ] Environment variables are set
- [ ] Mapbox token is configured
- [ ] Pusher credentials are set

### Citizen Dashboard

- [ ] Dashboard loads without errors
- [ ] Emergency button is prominent
- [ ] Reports list displays correctly
- [ ] Status timeline works
- [ ] Quick contacts are clickable
- [ ] Mobile responsive

### Dispatcher Dashboard

- [ ] Command center loads
- [ ] Map displays correctly
- [ ] Incident queue shows unassigned incidents
- [ ] Real-time updates work
- [ ] Map fullscreen toggle works
- [ ] Incident assignment works

### Responder Dashboard

- [ ] Dashboard loads correctly
- [ ] GPS tracking works (if on assignment)
- [ ] Mission progress displays
- [ ] Navigation button works
- [ ] Status updates work
- [ ] SOS button is visible

### Agency Admin Dashboard

- [ ] Dashboard loads
- [ ] Metrics display correctly
- [ ] Team cards show members
- [ ] Charts render properly
- [ ] Performance score displays

### System Admin Dashboard

- [ ] Mission control loads
- [ ] System health indicators work
- [ ] Live map displays
- [ ] All metrics update
- [ ] Analytics tabs work
- [ ] Critical alerts show

---

## 🔧 Troubleshooting

### Dashboard Not Loading

1. **Check Authentication:**

   ```bash
   # Verify you're logged in
   # Check session in browser DevTools
   ```

2. **Check Database:**

   ```bash
   # Verify database connection
   npx prisma db push
   ```

3. **Check Environment Variables:**
   ```bash
   # Verify .env file has all required variables
   cat .env | grep -E "DATABASE|MAPBOX|PUSHER"
   ```

### Map Not Displaying

1. **Check Mapbox Token:**

   ```bash
   # Verify NEXT_PUBLIC_MAPBOX_TOKEN is set
   echo $NEXT_PUBLIC_MAPBOX_TOKEN
   ```

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check for Mapbox errors
   - Verify token is valid

### Real-Time Updates Not Working

1. **Check Pusher Configuration:**

   ```bash
   # Verify Pusher credentials
   cat .env | grep PUSHER
   ```

2. **Check Network Tab:**
   - Open DevTools Network tab
   - Look for WebSocket connections
   - Verify Pusher connection

### Hydration Errors

If you see hydration errors:

1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for specific errors
4. Refer to `HYDRATION_FIXES.md` for solutions

---

## 📱 Mobile Preview

### Using Browser DevTools

1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select device (iPhone, iPad, etc.)
4. Navigate to dashboard
5. Test responsive design

### Using Real Device

1. Find your local IP:

   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Windows
   ipconfig
   ```

2. Access from device:
   ```
   http://[YOUR_IP]:3000/dashboard/[role]
   ```

---

## 🎯 Quick Preview Script

Create a script to open all dashboards:

```bash
#!/bin/bash
# preview-dashboards.sh

BASE_URL="http://localhost:3000"

echo "🚨 Opening all dashboards..."
echo ""
echo "Make sure you're logged in with appropriate role for each dashboard"
echo ""

# Open in default browser
open "$BASE_URL/dashboard/citizen"
sleep 2
open "$BASE_URL/dashboard/dispatch"
sleep 2
open "$BASE_URL/dashboard/responder"
sleep 2
open "$BASE_URL/dashboard/agency"
sleep 2
open "$BASE_URL/dashboard/admin"

echo "✅ All dashboards opened!"
```

Make it executable:

```bash
chmod +x preview-dashboards.sh
./preview-dashboards.sh
```

---

## 🔗 Direct Links

### Local Development

- Citizen: http://localhost:3000/dashboard/citizen
- Dispatcher: http://localhost:3000/dashboard/dispatch
- Responder: http://localhost:3000/dashboard/responder
- Agency Admin: http://localhost:3000/dashboard/agency
- System Admin: http://localhost:3000/dashboard/admin

### Production (Replace with your domain)

- Citizen: https://your-domain.com/dashboard/citizen
- Dispatcher: https://your-domain.com/dashboard/dispatch
- Responder: https://your-domain.com/dashboard/responder
- Agency Admin: https://your-domain.com/dashboard/agency
- System Admin: https://your-domain.com/dashboard/admin

---

## 📝 Notes

1. **Role-Based Access:** Each dashboard requires specific user role
2. **Authentication:** Must be logged in to access dashboards
3. **Real-Time:** Requires Pusher configuration for live updates
4. **Maps:** Requires Mapbox token for map display
5. **Database:** Requires database connection and migrations

---

## ✅ Success Indicators

You'll know everything is working when:

- ✅ All dashboards load without errors
- ✅ Maps display with markers
- ✅ Real-time updates appear instantly
- ✅ No hydration errors in console
- ✅ Mobile responsive design works
- ✅ All buttons and actions function

---

**Last Updated:** $(date)
**Platform Version:** 1.0.0
