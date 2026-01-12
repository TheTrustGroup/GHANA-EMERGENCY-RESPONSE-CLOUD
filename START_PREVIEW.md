# 🚀 START HERE - Dashboard Preview

## ⚡ Quick Start (3 Steps)

### 1️⃣ Start Development Server
```bash
npm run dev
```

### 2️⃣ Create Test Users (One-Time Setup)
```bash
npx tsx scripts/create-test-users.ts
```

### 3️⃣ Open All Dashboards
```bash
./scripts/preview-dashboards.sh
```

**That's it!** All 5 dashboards will open in your browser.

---

## 🔐 Login Credentials

All test users use the same password: **`Test1234`**

| Role | Email | Dashboard URL |
|------|-------|---------------|
| **Citizen** | `citizen@test.com` | http://localhost:3000/dashboard/citizen |
| **Dispatcher** | `dispatcher@test.com` | http://localhost:3000/dashboard/dispatch |
| **Responder** | `responder@test.com` | http://localhost:3000/dashboard/responder |
| **Agency Admin** | `agency@test.com` | http://localhost:3000/dashboard/agency |
| **System Admin** | `admin@test.com` | http://localhost:3000/dashboard/admin |

---

## 📱 Direct Dashboard Links

Once logged in, you can access these directly:

1. **Citizen Dashboard**
   - http://localhost:3000/dashboard/citizen
   - Mobile app style, no sidebar

2. **Dispatcher Command Center**
   - http://localhost:3000/dashboard/dispatch
   - Dark theme, split-screen map + feed

3. **Responder Dashboard**
   - http://localhost:3000/dashboard/responder
   - Full-screen mobile, GPS tracking

4. **Agency Admin Dashboard**
   - http://localhost:3000/dashboard/agency
   - Team management, performance metrics

5. **System Admin Dashboard**
   - http://localhost:3000/dashboard/admin
   - Mission control, system health

---

## ✅ What to Check

### All Dashboards Should:
- ✅ Load without errors
- ✅ Display correct layout for role
- ✅ Show real-time updates (if configured)
- ✅ Be mobile responsive
- ✅ Have no hydration errors

### Specific Features:

**Citizen:**
- Big red "Report Emergency" button
- Your reports list
- Quick contact buttons

**Dispatcher:**
- Live map with markers
- Incident queue
- Real-time updates

**Responder:**
- GPS status
- Mission progress
- Navigation button

**Agency Admin:**
- Team metrics
- Performance charts
- Recent assignments

**System Admin:**
- System health
- Live map
- Analytics

---

## 🐛 Troubleshooting

### Can't Login?
```bash
# Recreate test users
npx tsx scripts/create-test-users.ts
```

### Dashboard Shows 404?
- Make sure you're logged in
- Check your user role matches the dashboard

### Map Not Showing?
- Check `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env`
- Open browser console for errors

### Build Errors?
```bash
# Rebuild
npm run build
```

---

## 📚 More Information

- **Quick Preview:** See `QUICK_PREVIEW.md`
- **Complete Guide:** See `DASHBOARD_PREVIEW_GUIDE.md`
- **All URLs:** See `DASHBOARD_URLS.md`
- **Test Credentials:** See `TEST_CREDENTIALS.md`

---

**Ready?** Run `npm run dev` and `./scripts/preview-dashboards.sh`! 🚀
