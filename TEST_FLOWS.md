# Testing Guide - Simple MVP Flows

Once you've added AWS S3 credentials to `.env.local`, follow these steps to test all three core flows.

## Prerequisites

✅ Mapbox token configured (`NEXT_PUBLIC_MAPBOX_TOKEN`)  
✅ Pusher credentials configured (`PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`)  
✅ AWS S3 credentials configured (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`)  
✅ Database running and migrated  
✅ Development server running (`npm run dev`)

---

## Test 1: Citizen Emergency Reporting Flow

### Steps:

1. **Open Browser:**
   ```
   http://localhost:3000/report
   ```

2. **Step 1 - Select Category:**
   - Click one of the category buttons (Fire, Medical, Accident, Other)
   - ✅ Should see "Continue →" button appear
   - Click "Continue →"

3. **Step 2 - Location:**
   - ✅ Should see "Getting location..." briefly
   - ✅ Should see green "Location Set" box with coordinates
   - If location fails, you can manually set it (map picker coming soon)
   - Click "Continue →"

4. **Step 3 - Media (Optional):**
   - Click the upload area
   - Select a photo (JPG/PNG) or video (MP4)
   - ✅ Should see thumbnail preview
   - ✅ Can remove with X button
   - Click "Continue →"

5. **Step 4 - Details (Optional):**
   - Type a description (optional)
   - Click "Submit" or "SUBMIT EMERGENCY REPORT"

6. **Success Page:**
   - ✅ Should redirect to `/report/success?id=...`
   - ✅ Should see "Emergency Reported" message
   - ✅ Should see report number

### Expected Results:

- ✅ Form saves to localStorage every 5 seconds
- ✅ GPS location auto-captures
- ✅ Photos upload to S3 (check browser Network tab)
- ✅ Incident created in database
- ✅ Real-time notification sent via Pusher

### Troubleshooting:

**Location not capturing:**
- Check browser permissions (should prompt for location access)
- Try in Chrome/Firefox (Safari may have issues)
- Check browser console for errors

**Photo upload fails:**
- Check AWS credentials in `.env.local`
- Check S3 bucket exists and name matches
- Check browser console for errors
- Verify file size < 10MB

**No success page:**
- Check browser console for errors
- Check server logs
- Verify database connection

---

## Test 2: Dispatcher Assignment Flow

### Prerequisites:

- Need at least one incident in database (from Test 1)
- Need a user with DISPATCHER role

### Steps:

1. **Login as Dispatcher:**
   ```
   http://localhost:3000/auth/signin
   ```
   - Use dispatcher credentials
   - Or create one: `scripts/create-test-dispatcher.ts`

2. **Open Dispatch Center:**
   ```
   http://localhost:3000/dispatch
   ```

3. **View Map:**
   - ✅ Should see map centered on Ghana (Accra)
   - ✅ Should see incident markers (colored by severity)
   - ✅ Should see legend in bottom-left

4. **View Incident Feed:**
   - ✅ Should see "Unassigned" tab with incidents
   - ✅ Should see incident cards with details
   - ✅ Should see photos if uploaded

5. **Assign Agency:**
   - Click "Assign Agency →" button on an incident
   - ✅ Should see dialog with agency list
   - Select an agency
   - Click "Assign Agency"
   - ✅ Should see success toast
   - ✅ Incident should move to "In Progress" tab

### Expected Results:

- ✅ Map shows all active incidents
- ✅ Markers are color-coded (Critical=Red, High=Orange, etc.)
- ✅ Clicking marker shows popup
- ✅ Incident feed updates in real-time
- ✅ Assignment updates incident status to DISPATCHED
- ✅ Agency admin gets notification

### Troubleshooting:

**Map not loading:**
- Check `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`
- Check browser console for Mapbox errors
- Verify token is valid at https://account.mapbox.com/

**No incidents showing:**
- Run Test 1 first to create an incident
- Check database: `SELECT * FROM incidents WHERE status = 'REPORTED';`
- Check browser console for API errors

**Real-time not working:**
- Check Pusher credentials in `.env.local`
- Check Pusher dashboard: https://dashboard.pusher.com/
- Check browser console for Pusher connection errors
- Verify Pusher app is not paused

**Assignment fails:**
- Check user has DISPATCHER role
- Check agencies exist in database
- Check browser console for errors

---

## Test 3: Real-Time Updates

### Steps:

1. **Open Two Browser Windows:**
   - Window 1: Dispatcher view (`/dispatch`)
   - Window 2: Citizen reporting (`/report`)

2. **Report New Incident (Window 2):**
   - Complete the reporting flow
   - Submit incident

3. **Watch Dispatcher Map (Window 1):**
   - ✅ Should see new marker appear on map within 2 seconds
   - ✅ Should see new incident in "Unassigned" tab
   - ✅ Should see notification (if implemented)

4. **Assign Agency (Window 1):**
   - Assign an agency to the incident
   - ✅ Incident should move to "In Progress" tab

### Expected Results:

- ✅ New incidents appear on map in <2 seconds
- ✅ Incident list updates automatically
- ✅ No page refresh needed
- ✅ Pusher events are firing (check Pusher dashboard)

### Troubleshooting:

**Updates not appearing:**
- Check Pusher credentials
- Check browser console for Pusher connection
- Verify Pusher app is active
- Check server logs for Pusher errors

**Slow updates:**
- Check network connection
- Check Pusher cluster matches in all places
- Verify Pusher app is not rate-limited

---

## Quick Test Checklist

### Environment Variables:
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` - Starts with `pk.`
- [ ] `PUSHER_APP_ID` - Numeric ID
- [ ] `NEXT_PUBLIC_PUSHER_KEY` - Alphanumeric key
- [ ] `PUSHER_SECRET` - Long secret string
- [ ] `NEXT_PUBLIC_PUSHER_CLUSTER` - e.g., `us2`, `eu`
- [ ] `AWS_ACCESS_KEY_ID` - Starts with `AKIA`
- [ ] `AWS_SECRET_ACCESS_KEY` - Long secret string
- [ ] `AWS_REGION` - e.g., `af-south-1`, `us-east-1`
- [ ] `AWS_S3_BUCKET` - Your bucket name

### Database:
- [ ] Database running
- [ ] Prisma migrations applied (`npm run db:push`)
- [ ] At least one agency exists
- [ ] At least one dispatcher user exists

### Functionality:
- [ ] Citizen can report emergency
- [ ] GPS location captures
- [ ] Photos upload to S3
- [ ] Incident appears in database
- [ ] Dispatcher sees incidents on map
- [ ] Dispatcher can assign agency
- [ ] Real-time updates work

---

## Common Issues & Solutions

### Issue: "Failed to generate upload URL"
**Solution:**
- Check AWS credentials are correct
- Verify S3 bucket exists
- Check IAM user has S3 permissions
- Restart dev server after changing env vars

### Issue: "Mapbox token invalid"
**Solution:**
- Verify token starts with `pk.`
- Check token hasn't expired
- Regenerate token if needed

### Issue: "Pusher connection failed"
**Solution:**
- Check all 4 Pusher variables are set
- Verify cluster matches in all places
- Check Pusher app is not paused
- Try different cluster region

### Issue: "Location not capturing"
**Solution:**
- Allow location permissions in browser
- Try different browser
- Check HTTPS (required for geolocation in production)

---

## Next Steps After Testing

Once all tests pass:

1. ✅ **Citizen Reporting** - Ready for production
2. ✅ **Dispatcher Assignment** - Ready for production
3. ✅ **Real-Time Updates** - Ready for production

**Still To Build:**
- Responder dashboard (view assignments, navigate, update status)
- Push notifications (SMS/Email)
- ETA calculation
- Route navigation

---

**Need Help?** Check the browser console and server logs for detailed error messages.
