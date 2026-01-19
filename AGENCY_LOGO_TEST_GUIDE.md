# 🎨 Agency Logo Test Guide

## ✅ Test Page Created

**Test URL:** http://localhost:3000/test-agency-logos

This page displays all agency logos in different sizes to verify they render correctly.

---

## 🧪 How to Test Agency Logos

### Option 1: Test Page (Visual Verification)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Visit test page:**
   ```
   http://localhost:3000/test-agency-logos
   ```

3. **Verify:**
   - ✅ NADMO shows orange circle with "N" and "NADMO" text
   - ✅ Fire Service shows red rectangle with fire symbol and "GNFS"
   - ✅ Police shows blue circle with police badge and "GPS"
   - ✅ Ambulance shows green rectangle with medical cross and "NAS"
   - ✅ Private agencies show shield icon with initials

---

### Option 2: Test in Agency Dashboard (Real Usage)

#### Test NADMO Logo:
1. **Login as NADMO Admin:**
   - Email: `nadmo.admin@emergency.gov.gh`
   - Password: `Admin@123`
   - URL: https://ghana-emergency-response.vercel.app/auth/signin

2. **Go to Agency Dashboard:**
   - URL: https://ghana-emergency-response.vercel.app/dashboard/agency

3. **Verify:**
   - ✅ Orange NADMO logo appears in header (left side)
   - ✅ Agency name "NADMO Headquarters" displays below logo
   - ✅ "Agency Performance Dashboard" subtitle shows

#### Test Fire Service Logo:
1. **Login as Fire Service Admin:**
   - Email: `fire.admin@emergency.gov.gh`
   - Password: `Admin@123`

2. **Go to Agency Dashboard:**
   - URL: https://ghana-emergency-response.vercel.app/dashboard/agency

3. **Verify:**
   - ✅ Red Fire Service logo appears in header
   - ✅ Agency name "Ghana National Fire Service - Tema" displays
   - ✅ Logo shows fire symbol and "GNFS" text

#### Test Police Logo:
1. **Login as Police Admin:**
   - Email: `police.admin@emergency.gov.gh`
   - Password: `Admin@123`

2. **Go to Agency Dashboard:**
   - URL: https://ghana-emergency-response.vercel.app/dashboard/agency

3. **Verify:**
   - ✅ Blue Police logo appears in header
   - ✅ Agency name "Ghana Police Service - Kumasi" displays
   - ✅ Logo shows police badge and "GPS" text

#### Test Ambulance Logo:
1. **Create/Login as Ambulance Admin** (if exists)
   - Or check test page for visual verification

2. **Verify:**
   - ✅ Green Ambulance logo appears
   - ✅ Logo shows medical cross and "NAS" text

---

## 📋 Expected Logo Designs

### NADMO
- **Color:** Orange (#FF6B35)
- **Shape:** Circle
- **Text:** "N" (large) + "NADMO" (small)
- **Fallback:** "NADMO"

### Ghana National Fire Service
- **Color:** Red (#DC2626)
- **Shape:** Rectangle with rounded corners
- **Symbol:** Fire/flame symbol (gold)
- **Text:** "GNFS"
- **Fallback:** "GNFS"

### Ghana Police Service
- **Color:** Blue (#1E40AF) with Gold (#FFD700) accents
- **Shape:** Circle
- **Symbol:** Police badge/shield (gold)
- **Text:** "GPS"
- **Fallback:** "GPS"

### National Ambulance Service
- **Color:** Green (#059669)
- **Shape:** Rectangle with rounded corners
- **Symbol:** Medical cross (white) with red circle
- **Text:** "NAS"
- **Fallback:** "NAS"

### Private Agencies
- **Color:** Blue gradient
- **Shape:** Shield icon
- **Text:** Agency initials (first 2 letters)
- **Fallback:** Shield icon

---

## 🔍 Troubleshooting

### Logo Not Showing?
1. **Check browser console** for errors
2. **Verify agency data** - ensure `stats?.agency.name` and `stats?.agency.type` exist
3. **Check SVG rendering** - some browsers may need SVG namespace fixes

### Wrong Logo Showing?
1. **Check agency name** - logo matching is case-insensitive
2. **Check agency type** - verify `agencyType` matches expected enum value
3. **Check logo mapping** - verify `getAgencyLogo()` function logic

### Logo Too Small/Large?
- Adjust `size` prop: `'sm' | 'md' | 'lg' | 'xl'`
- Default is `'md'`
- Dashboard uses `'lg'` size

---

## ✅ Test Checklist

- [ ] Test page loads at `/test-agency-logos`
- [ ] All 5 agency logos display correctly
- [ ] Logos render in all sizes (sm, md, lg, xl)
- [ ] NADMO admin sees NADMO logo in dashboard
- [ ] Fire Service admin sees Fire Service logo in dashboard
- [ ] Police admin sees Police logo in dashboard
- [ ] Logos are distinct and recognizable
- [ ] Fallback works when logo fails to load
- [ ] Dashboard header shows logo + agency name + subtitle

---

## 🚀 Production URLs

**Test in Production:**
- Test Page: https://ghana-emergency-response.vercel.app/test-agency-logos
- Agency Dashboard: https://ghana-emergency-response.vercel.app/dashboard/agency

**Login Credentials:**
- NADMO: `nadmo.admin@emergency.gov.gh` / `Admin@123`
- Fire Service: `fire.admin@emergency.gov.gh` / `Admin@123`
- Police: `police.admin@emergency.gov.gh` / `Admin@123`

---

## 📝 Notes

- Logos are SVG-based for scalability
- Logos match Ghana's official agency branding colors
- Fallback system ensures logos always display something
- Logo component is reusable across the platform
