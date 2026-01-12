# 🚨 Dashboard URL Links
## Ghana Emergency Response Platform - Complete URL Reference

---

## 🎯 Main Role-Based Dashboards

### 1. **Citizen Dashboard**
```
http://localhost:3000/dashboard/citizen
```
**Role:** CITIZEN  
**Features:** Report emergencies, view your reports, emergency contacts

---

### 2. **Dispatcher Command Center**
```
http://localhost:3000/dashboard/dispatch
```
**Role:** DISPATCHER  
**Features:** Live map, incident feed, dispatch queue management

---

### 3. **Responder Dashboard**
```
http://localhost:3000/dashboard/responder
```
**Role:** RESPONDER  
**Features:** Active assignments, GPS tracking, status updates

---

### 4. **Agency Admin Dashboard**
```
http://localhost:3000/dashboard/agency
```
**Role:** AGENCY_ADMIN  
**Features:** Team management, performance metrics, agency incidents

---

### 5. **System Admin Dashboard**
```
http://localhost:3000/dashboard/admin
```
**Role:** SYSTEM_ADMIN  
**Features:** System-wide monitoring, health checks, analytics

---

## 📋 Supporting Pages

### System Admin Pages

#### Agencies Management
```
http://localhost:3000/dashboard/agencies
```
View and manage all emergency response agencies

#### Users Management
```
http://localhost:3000/dashboard/users
```
View and manage all platform users

#### Audit Logs
```
http://localhost:3000/dashboard/audit
```
View system activity and audit trail

---

### Agency Admin Pages

#### My Agency Incidents
```
http://localhost:3000/dashboard/agency/incidents
```
View all incidents assigned to your agency

#### My Team
```
http://localhost:3000/dashboard/agency/team
```
Manage team members (responders and dispatchers)

---

### Dispatcher Pages

#### Active Dispatches
```
http://localhost:3000/dashboard/dispatch/active
```
View all active dispatch assignments

#### Dispatch Queue
```
http://localhost:3000/dashboard/dispatch/queue
```
View pending incidents awaiting assignment

#### My Dispatches
```
http://localhost:3000/dashboard/dispatch/my-dispatches
```
View dispatches you've created

#### Assign Incident
```
http://localhost:3000/dashboard/dispatch/assign/[incidentId]
```
Assign an incident to an agency (dynamic route)

---

### Responder Pages

#### My Assignments
```
http://localhost:3000/dashboard/responder/assignments
```
View active and completed assignments

#### Assignment Detail
```
http://localhost:3000/dashboard/responder/assignment/[id]
```
View full details of a specific assignment (dynamic route)

#### Available Incidents
```
http://localhost:3000/dashboard/responder/available
```
Browse incidents available for response

---

### Shared Pages

#### All Incidents
```
http://localhost:3000/dashboard/incidents
```
View all incidents (filtered by role)

#### Incident Detail
```
http://localhost:3000/dashboard/incidents/[id]
```
View full details of a specific incident (dynamic route)

#### Incident Messages
```
http://localhost:3000/dashboard/incidents/[id]/messages
```
View messages for a specific incident (dynamic route)

#### New Incident
```
http://localhost:3000/dashboard/incidents/new
```
Report a new incident

---

### Analytics Pages

#### Analytics Dashboard
```
http://localhost:3000/dashboard/analytics
```
Comprehensive analytics overview

#### Agency Analytics
```
http://localhost:3000/dashboard/analytics/agencies/[id]
```
Detailed analytics for a specific agency (dynamic route)

#### Incident Analytics
```
http://localhost:3000/dashboard/analytics/incidents
```
Detailed incident analytics

---

### Other Pages

#### Map View
```
http://localhost:3000/dashboard/map
```
Full-screen map with all incidents and agencies

#### Notifications
```
http://localhost:3000/dashboard/notifications
```
View user notifications

#### Reports
```
http://localhost:3000/dashboard/reports
```
Generate and view reports

#### Report Detail
```
http://localhost:3000/dashboard/reports/[id]
```
View a specific report (dynamic route)

#### New Report
```
http://localhost:3000/dashboard/reports/new
```
Create a new report

#### Settings - Notifications
```
http://localhost:3000/dashboard/settings/notifications
```
Manage notification preferences

#### Main Dashboard (Router)
```
http://localhost:3000/dashboard
```
Auto-redirects to role-specific dashboard

#### Premium Dashboard
```
http://localhost:3000/dashboard/main
```
Premium enterprise dashboard view

---

## 🔐 Authentication Pages

#### Sign In
```
http://localhost:3000/auth/signin
```

#### Register
```
http://localhost:3000/auth/register
```

---

## 🌐 Public Pages

#### Home Page
```
http://localhost:3000/
```

#### Report Emergency (Anonymous)
```
http://localhost:3000/report
```

---

## 📊 Quick Reference by Role

### Citizen
- Main Dashboard: `/dashboard/citizen`
- Report Incident: `/dashboard/incidents/new`
- My Reports: `/dashboard/incidents` (filtered)
- Notifications: `/dashboard/notifications`

### Dispatcher
- Command Center: `/dashboard/dispatch`
- Active Dispatches: `/dashboard/dispatch/active`
- Dispatch Queue: `/dashboard/dispatch/queue`
- My Dispatches: `/dashboard/dispatch/my-dispatches`
- All Incidents: `/dashboard/incidents`
- Map View: `/dashboard/map`

### Responder
- Field App: `/dashboard/responder`
- My Assignments: `/dashboard/responder/assignments`
- Available Incidents: `/dashboard/responder/available`
- Assignment Detail: `/dashboard/responder/assignment/[id]`

### Agency Admin
- Agency Dashboard: `/dashboard/agency`
- Agency Incidents: `/dashboard/agency/incidents`
- My Team: `/dashboard/agency/team`
- Analytics: `/dashboard/analytics`
- Agency Analytics: `/dashboard/analytics/agencies/[id]`

### System Admin
- Mission Control: `/dashboard/admin`
- Agencies: `/dashboard/agencies`
- Users: `/dashboard/users`
- Audit Logs: `/dashboard/audit`
- Analytics: `/dashboard/analytics`
- All Incidents: `/dashboard/incidents`
- Map View: `/dashboard/map`

---

## 🚀 Production URLs

Replace `localhost:3000` with your production domain:

```
https://your-domain.com/dashboard/[route]
```

---

## 📝 Notes

- All dashboard routes require authentication
- Routes are protected by role-based access control
- Dynamic routes (with `[id]` or `[incidentId]`) require valid IDs
- The main `/dashboard` route auto-redirects based on user role

---

**Last Updated:** $(date)  
**Platform Version:** 1.0.0
