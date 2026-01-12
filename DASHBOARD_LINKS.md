# 🔗 Dashboard Links - Ghana Emergency Response Cloud Platform

**Base URL:** `http://localhost:3000`

> **Note:** Make sure the development server is running: `npm run dev`

---

## 🎯 Main Dashboards (Role-Based)

### System Admin Dashboard
- **URL:** http://localhost:3000/dashboard/admin
- **Role:** SYSTEM_ADMIN
- **Description:** Complete system overview, user management, agency management, audit logs

### Agency Admin Dashboard
- **URL:** http://localhost:3000/dashboard/agency
- **Role:** AGENCY_ADMIN
- **Description:** Agency-specific dashboard with team management and incident oversight

### Dispatcher Command Center
- **URL:** http://localhost:3000/dashboard/dispatch
- **Role:** DISPATCHER
- **Description:** Real-time incident dispatch and assignment center

### Responder Dashboard
- **URL:** http://localhost:3000/dashboard/responder
- **Role:** RESPONDER
- **Description:** Active assignments, navigation, status updates

### Citizen Dashboard
- **URL:** http://localhost:3000/dashboard/citizen
- **Role:** CITIZEN
- **Description:** Mobile-friendly dashboard for reporting and tracking incidents

### Premium Enterprise Dashboard
- **URL:** http://localhost:3000/dashboard/main
- **Role:** All roles
- **Description:** Advanced dashboard with live map, analytics, and alerts

---

## 📊 Analytics Dashboards

### Main Analytics Dashboard
- **URL:** http://localhost:3000/dashboard/analytics
- **Description:** Comprehensive analytics with charts, metrics, and reports

### Incident Analytics
- **URL:** http://localhost:3000/dashboard/analytics/incidents
- **Description:** Detailed incident statistics and trends

### Agency Analytics
- **URL:** http://localhost:3000/dashboard/analytics/agencies/[id]
- **Description:** Agency-specific analytics (replace [id] with agency ID)

---

## 🚨 Incident Management

### All Incidents
- **URL:** http://localhost:3000/dashboard/incidents
- **Description:** List of all incidents with filtering and search

### New Incident Report
- **URL:** http://localhost:3000/dashboard/incidents/new
- **Description:** Create a new incident report

### Incident Detail
- **URL:** http://localhost:3000/dashboard/incidents/[id]
- **Description:** Detailed view of a specific incident (replace [id] with incident ID)

### Incident Messages
- **URL:** http://localhost:3000/dashboard/incidents/[id]/messages
- **Description:** Messages/updates for a specific incident

---

## 📋 Dispatch Management

### Dispatch Queue
- **URL:** http://localhost:3000/dashboard/dispatch/queue
- **Description:** Pending dispatch assignments

### Active Dispatches
- **URL:** http://localhost:3000/dashboard/dispatch/active
- **Description:** Currently active dispatch assignments

### My Dispatches
- **URL:** http://localhost:3000/dashboard/dispatch/my-dispatches
- **Description:** Dispatcher's own dispatch assignments

### Assign Dispatch
- **URL:** http://localhost:3000/dashboard/dispatch/assign/[incidentId]
- **Description:** Assign dispatch to an incident (replace [incidentId] with incident ID)

---

## 👥 Responder Management

### Responder Assignments
- **URL:** http://localhost:3000/dashboard/responder/assignments
- **Description:** All responder assignments

### Single Assignment Detail
- **URL:** http://localhost:3000/dashboard/responder/assignment/[id]
- **Description:** Detailed view of a specific assignment (replace [id] with assignment ID)

### Available Incidents
- **URL:** http://localhost:3000/dashboard/responder/available
- **Description:** Incidents available for responders

---

## 📝 Reports

### All Reports
- **URL:** http://localhost:3000/dashboard/reports
- **Description:** List of all reports

### New Report
- **URL:** http://localhost:3000/dashboard/reports/new
- **Description:** Create a new report

### Report Detail
- **URL:** http://localhost:3000/dashboard/reports/[id]
- **Description:** Detailed view of a specific report (replace [id] with report ID)

---

## 🗺️ Maps & Visualization

### Live Map
- **URL:** http://localhost:3000/dashboard/map
- **Description:** Real-time map view of all incidents and responders

---

## ⚙️ Settings & Configuration

### User Settings
- **URL:** http://localhost:3000/dashboard/settings
- **Description:** User profile and account settings

### Notification Settings
- **URL:** http://localhost:3000/dashboard/settings/notifications
- **Description:** Configure notification preferences

### Notifications
- **URL:** http://localhost:3000/dashboard/notifications
- **Description:** View all notifications

---

## 👤 User Management

### All Users
- **URL:** http://localhost:3000/dashboard/users
- **Description:** Manage all system users (Admin only)

---

## 🏢 Agency Management

### All Agencies
- **URL:** http://localhost:3000/dashboard/agencies
- **Description:** List and manage all agencies (Admin only)

### Agency Incidents
- **URL:** http://localhost:3000/dashboard/agency/incidents
- **Description:** Incidents assigned to a specific agency

### Agency Team
- **URL:** http://localhost:3000/dashboard/agency/team
- **Description:** Manage agency team members

---

## 📋 Audit & Logs

### Audit Logs
- **URL:** http://localhost:3000/dashboard/audit
- **Description:** System audit trail and logs (Admin only)

---

## 🔐 Authentication

### Sign In
- **URL:** http://localhost:3000/auth/signin
- **Description:** User login page

### Sign Up
- **URL:** http://localhost:3000/auth/signup
- **Description:** User registration page

---

## 🏠 Public Pages

### Homepage
- **URL:** http://localhost:3000/
- **Description:** Landing page

### Report Emergency
- **URL:** http://localhost:3000/report
- **Description:** Public emergency reporting page

---

## 📱 Quick Access Links

### Main Dashboard Router
- **URL:** http://localhost:3000/dashboard
- **Description:** Auto-redirects based on user role

---

## 🧪 Test Credentials

To test different dashboards, you'll need to sign in with accounts that have the appropriate roles:

1. **System Admin:** Role = `SYSTEM_ADMIN`
2. **Agency Admin:** Role = `AGENCY_ADMIN`
3. **Dispatcher:** Role = `DISPATCHER`
4. **Responder:** Role = `RESPONDER`
5. **Citizen:** Role = `CITIZEN`

---

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   - Navigate to: http://localhost:3000

3. **Sign in:**
   - Use test credentials for your desired role
   - Or create a new account

4. **Access dashboards:**
   - The main dashboard will auto-redirect based on your role
   - Or use the direct links above

---

## 📝 Notes

- All dynamic routes (with `[id]` or `[incidentId]`) require actual IDs from your database
- Some dashboards require specific roles - you'll be redirected if you don't have access
- The development server must be running for these links to work
- Replace `localhost:3000` with your actual domain in production

---

**Last Updated:** January 11, 2025  
**Platform:** Ghana Emergency Response Cloud Platform
