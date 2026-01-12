# ⚡ Quick Dashboard Preview Guide

## 🚀 Fastest Way to Preview All Dashboards

### Step 1: Start Server
```bash
npm run dev
```

### Step 2: Run Preview Script
```bash
./scripts/preview-dashboards.sh
```

This will automatically open all 5 dashboards in your browser!

---

## 🔐 Quick Login Guide

### Option 1: Use Test Users

Create test users first:
```bash
npx tsx scripts/create-test-users.ts
```

Then login with credentials from `TEST_CREDENTIALS.md`

### Option 2: Direct URLs (if already logged in)

Just open these URLs in your browser:

1. **Citizen Dashboard**
   ```
   http://localhost:3000/dashboard/citizen
   ```

2. **Dispatcher Command Center**
   ```
   http://localhost:3000/dashboard/dispatch
   ```

3. **Responder Dashboard**
   ```
   http://localhost:3000/dashboard/responder
   ```

4. **Agency Admin Dashboard**
   ```
   http://localhost:3000/dashboard/agency
   ```

5. **System Admin Dashboard**
   ```
   http://localhost:3000/dashboard/admin
   ```

---

## 🎯 What to Check in Each Dashboard

### ✅ Citizen Dashboard
- [ ] Mobile app-style layout (no sidebar)
- [ ] Big red "Report Emergency" button
- [ ] Your reports list with status
- [ ] Quick contact buttons work

### ✅ Dispatcher Dashboard
- [ ] Dark command center theme
- [ ] Split screen (map + feed)
- [ ] Incident queue shows unassigned
- [ ] Map displays with markers
- [ ] Real-time updates work

### ✅ Responder Dashboard
- [ ] Full-screen mobile layout
- [ ] GPS status bar
- [ ] Mission progress timeline
- [ ] Navigation button works
- [ ] Status update buttons work

### ✅ Agency Admin Dashboard
- [ ] Minimal sidebar
- [ ] Metrics cards display
- [ ] Team status shows
- [ ] Charts render correctly
- [ ] Performance score visible

### ✅ System Admin Dashboard
- [ ] Top navigation bar
- [ ] System health indicators
- [ ] Live map with all incidents
- [ ] Analytics charts work
- [ ] Critical alerts banner

---

## 🐛 Quick Troubleshooting

### Dashboard Shows 404
- Check you're logged in
- Verify route exists in `src/app/dashboard/[role]/page.tsx`

### Map Not Showing
- Check `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env`
- Open browser console for errors

### Can't Login
- Create test users: `npx tsx scripts/create-test-users.ts`
- Check database is running: `npx prisma db push`

### Hydration Errors
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Check `HYDRATION_FIXES.md`

---

## 📱 Mobile Preview

1. Open Chrome DevTools (F12)
2. Click device icon (Ctrl+Shift+M)
3. Select device (iPhone 12, etc.)
4. Navigate to dashboard
5. Test touch interactions

---

## 🎬 Video Preview Checklist

If recording a preview video:

1. ✅ Show all 5 dashboards
2. ✅ Demonstrate real-time updates
3. ✅ Show mobile responsive design
4. ✅ Test key actions (report, assign, update status)
5. ✅ Show map with markers
6. ✅ Demonstrate GPS tracking

---

**Need more details?** See `DASHBOARD_PREVIEW_GUIDE.md` for complete guide.
