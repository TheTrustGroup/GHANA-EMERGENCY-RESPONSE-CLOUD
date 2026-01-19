# 🚨 Dashboard Links - Production

**Base URL:** https://ghana-emergency-response.vercel.app

---

## 🎯 Main Role-Based Dashboards

### 1. **Citizen Dashboard** 👤
**URL:** https://ghana-emergency-response.vercel.app/dashboard/citizen  
**Who uses it:** Regular citizens reporting emergencies  
**What they do:** Report fires, medical emergencies, accidents, view their reports

### 2. **Dispatcher Command Center** 🎯
**URL:** https://ghana-emergency-response.vercel.app/dashboard/dispatch  
**Who uses it:** Emergency dispatchers at command centers  
**What they do:** See all emergencies on a live map, assign them to agencies (Fire, Police, Ambulance)

### 3. **Responder Dashboard** 🚑
**URL:** https://ghana-emergency-response.vercel.app/dashboard/responder  
**Who uses it:** Firefighters, paramedics, police officers in the field  
**What they do:** See their assigned emergencies, navigate to location, update status

### 4. **Agency Admin Dashboard** 🏢
**URL:** https://ghana-emergency-response.vercel.app/dashboard/agency  
**Who uses it:** Managers at Fire Service, Police, Ambulance, etc.  
**What they do:** Manage their team, see agency performance, view incidents

### 5. **System Admin Dashboard** ⚙️
**URL:** https://ghana-emergency-response.vercel.app/dashboard/admin  
**Who uses it:** Platform administrators  
**What they do:** Manage all agencies, users, system settings, view everything

---

## 📊 Supporting Dashboards

### Analytics Dashboard
**URL:** https://ghana-emergency-response.vercel.app/dashboard/analytics  
**What it shows:** Charts, statistics, trends, performance metrics

### Map View
**URL:** https://ghana-emergency-response.vercel.app/dashboard/map  
**What it shows:** Full-screen map with all active incidents and agencies

### All Incidents
**URL:** https://ghana-emergency-response.vercel.app/dashboard/incidents  
**What it shows:** List of all emergencies with filters

### Agencies Management
**URL:** https://ghana-emergency-response.vercel.app/dashboard/agencies  
**What it shows:** All emergency response agencies (Fire, Police, Ambulance, etc.)

### Users Management
**URL:** https://ghana-emergency-response.vercel.app/dashboard/users  
**What it shows:** All platform users (citizens, responders, dispatchers, admins)

---

## 🔐 Authentication Pages

### Sign In
**URL:** https://ghana-emergency-response.vercel.app/auth/signin

### Register
**URL:** https://ghana-emergency-response.vercel.app/auth/register

---

## 🌐 Public Pages

### Home Page
**URL:** https://ghana-emergency-response.vercel.app/

### Report Emergency (No login required)
**URL:** https://ghana-emergency-response.vercel.app/report

---

## 📱 Quick Access by Role

### For Citizens:
- Main Dashboard: `/dashboard/citizen`
- Report Emergency: `/report` (public) or `/dashboard/incidents/new`
- My Reports: `/dashboard/incidents`

### For Dispatchers:
- Command Center: `/dashboard/dispatch`
- Active Dispatches: `/dashboard/dispatch/active`
- Dispatch Queue: `/dashboard/dispatch/queue`
- Map View: `/dashboard/map`

### For Responders:
- Field App: `/dashboard/responder`
- My Assignments: `/dashboard/responder/assignments`
- Available Incidents: `/dashboard/responder/available`

### For Agency Admins:
- Agency Dashboard: `/dashboard/agency`
- Agency Incidents: `/dashboard/agency/incidents`
- My Team: `/dashboard/agency/team`
- Analytics: `/dashboard/analytics`

### For System Admins:
- Mission Control: `/dashboard/admin`
- All Agencies: `/dashboard/agencies`
- All Users: `/dashboard/users`
- Audit Logs: `/dashboard/audit`
- Analytics: `/dashboard/analytics`
