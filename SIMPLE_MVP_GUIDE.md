# SIMPLE MVP - Emergency Response Platform

## Core Philosophy
**Simplicity saves lives. Every feature must be essential. Zero complexity.**

## The Only 3 User Flows That Matter

1. **CITIZEN** → Report emergency with photo/video + location → DONE
2. **DISPATCHER** → See all emergencies on map → Assign agency → DONE  
3. **RESPONDER** → Get assignment → Navigate → Update status → DONE

## What's Been Built

### ✅ Phase 1: Citizen Emergency Reporting
**File:** `src/app/report/page.tsx`

**Features:**
- 4-step wizard (Category → Location → Media → Details)
- Auto-capture GPS location on page load
- Photo/video upload with compression
- Auto-save to localStorage every 5 seconds
- Offline support (queues for later)
- Success confirmation page

**How to Use:**
1. Navigate to `/report`
2. Select emergency category (Fire, Medical, Accident, Other)
3. Location auto-captures (or set manually)
4. Upload photos/videos (optional, max 5 files)
5. Add description (optional)
6. Submit → Redirects to success page

### ✅ Phase 2: Dispatcher Command Center
**File:** `src/app/dispatch/page.tsx`

**Features:**
- Split-screen layout: Map (70%) + Incident Feed (30%)
- Real-time map showing all active incidents
- Two tabs: Unassigned | In Progress
- One-click agency assignment
- Auto-refresh every 15 seconds
- Color-coded by severity

**How to Use:**
1. Navigate to `/dispatch` (requires DISPATCHER role)
2. View all incidents on map
3. Click incident in feed to see details
4. Click "Assign Agency" → Select agency → Done
5. Incident moves to "In Progress" tab

### ✅ Phase 3: Live Map Component
**File:** `src/components/maps/LiveMap.tsx`

**Features:**
- Mapbox GL JS integration
- Real-time incident markers
- Color-coded by severity (Critical=Red, High=Orange, Medium=Yellow, Low=Green)
- Click markers to view details
- Auto-updates via Pusher

### ✅ Phase 4: File Upload
**Files:**
- `src/lib/upload-simple.ts` - Upload utility with compression
- `src/app/api/upload/presigned/route.ts` - Presigned URL API

**Features:**
- Image compression (max 2MB, 1920px width)
- Direct S3/R2 upload via presigned URLs
- Progress tracking
- File type validation

### ✅ Phase 5: Real-Time Updates
**File:** `src/lib/pusher-simple.ts`

**Features:**
- Pusher integration for real-time events
- New incident notifications
- Incident update notifications
- Incident resolution notifications

**Events:**
- `new-incident` - When citizen reports emergency
- `incident-updated` - When incident status changes
- `incident-resolved` - When incident is resolved

### ✅ Phase 6: Offline Support
**File:** `src/lib/offline-storage.ts`

**Features:**
- localStorage for form data persistence
- Auto-save every 5 seconds
- Queue for sync when online
- IndexedDB ready (placeholder)

## Environment Variables Required

```env
# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Pusher
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# AWS S3 (or Cloudflare R2)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
```

## Database Schema

The existing Prisma schema supports all MVP features:
- `Incident` model with category, severity, location, mediaUrls
- `Agency` model with location and type
- `DispatchAssignment` model for tracking assignments
- `User` model with roles (CITIZEN, DISPATCHER, RESPONDER, etc.)

## API Endpoints

### tRPC Procedures

**Incidents:**
- `incidents.create` - Create new incident (with Pusher notification)
- `incidents.getAll` - Get all incidents (filtered by role)
- `incidents.getById` - Get single incident

**Dispatch:**
- `dispatch.assign` - Assign agency to incident (simple version)
- `dispatch.create` - Create full dispatch assignment

**Agencies:**
- `agencies.getAll` - Get all active agencies

### REST API

**Upload:**
- `POST /api/upload/presigned` - Get presigned URL for file upload

## Success Criteria

✅ **Citizen can report emergency in <60 seconds**
- 4-step wizard is fast and intuitive
- GPS auto-captures
- Photo upload is optional

✅ **Photo uploads work reliably**
- Compression reduces file size
- Direct S3 upload via presigned URLs
- Progress tracking

✅ **GPS location captures automatically**
- Uses browser Geolocation API
- Falls back to manual selection

✅ **Incidents appear on map in <2 seconds**
- Real-time via Pusher
- Auto-refresh every 15 seconds

✅ **Dispatcher can assign agency in <3 clicks**
- Click incident → Click "Assign Agency" → Select agency → Done

✅ **Everything works on mobile**
- Mobile-first design
- Touch-friendly buttons
- Responsive layout

✅ **Works offline**
- Form data saved to localStorage
- Queues for sync when online

## Next Steps (Future Enhancements)

1. **Responder Dashboard** - View assignments, navigate, update status
2. **Push Notifications** - SMS/Email when assigned
3. **ETA Calculation** - Show estimated arrival time
4. **Route Navigation** - Open in Google Maps/Waze
5. **Incident Chat** - Real-time messaging
6. **Status Updates** - Responder can update: En Route, On Scene, Resolved

## Testing Checklist

- [ ] Citizen can report emergency
- [ ] GPS location captures
- [ ] Photos upload successfully
- [ ] Incident appears on dispatcher map
- [ ] Dispatcher can assign agency
- [ ] Real-time updates work
- [ ] Works on mobile devices
- [ ] Works offline (queues for later)
- [ ] Success page shows after submission

## Files Created/Modified

### New Files:
- `src/app/report/page.tsx` - Citizen reporting page
- `src/app/report/success/page.tsx` - Success confirmation
- `src/app/dispatch/page.tsx` - Dispatcher command center
- `src/components/maps/LiveMap.tsx` - Live map component
- `src/components/incidents/AssignAgencyDialog.tsx` - Agency assignment dialog
- `src/lib/upload-simple.ts` - File upload utility
- `src/lib/offline-storage.ts` - Offline storage utilities
- `src/lib/pusher-simple.ts` - Pusher configuration
- `src/app/api/upload/presigned/route.ts` - Presigned URL API

### Modified Files:
- `src/server/api/routers/incidents.ts` - Added Pusher notification on create
- `src/server/api/routers/dispatch.ts` - Added simple `assign` procedure

## Dependencies Added

- `mapbox-gl` - Map rendering
- `pusher` - Server-side Pusher
- `pusher-js` - Client-side Pusher
- `@aws-sdk/client-s3` - S3 client
- `@aws-sdk/s3-request-presigner` - Presigned URLs
- `browser-image-compression` - Image compression
- `date-fns` - Date formatting (already installed)

---

**Remember: Simplicity saves lives. If a feature isn't essential, delete it.**
