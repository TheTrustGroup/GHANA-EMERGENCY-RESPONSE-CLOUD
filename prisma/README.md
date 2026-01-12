# Prisma Schema Documentation

## Overview

This Prisma schema defines the complete data model for the Ghana Emergency Response Platform. It includes all entities, relationships, indexes, and constraints needed for a production-grade emergency response system.

## Database

- **Provider**: PostgreSQL
- **Connection**: Configured via `DATABASE_URL` environment variable

## Models

### 1. User
Represents all users in the system (citizens, responders, dispatchers, admins).

**Key Features:**
- Email and phone uniqueness constraints
- Role-based access control
- Agency association for responders
- Email and phone verification tracking
- Last login tracking

**Relations:**
- Belongs to an Agency (optional)
- Can report multiple Incidents
- Can have Dispatch Assignments
- Can send Messages
- Can create Incident Updates
- Has Audit Logs
- Receives Notifications

### 2. Agency
Represents emergency response agencies (NADMO, Fire Service, Police, etc.).

**Key Features:**
- Type classification
- Location tracking (latitude/longitude)
- Regional and district organization
- Active/inactive status

**Relations:**
- Has multiple Users
- Can be assigned to Incidents
- Has Dispatch Assignments

### 3. Incident
Represents emergency incidents reported in the system.

**Key Features:**
- Severity and status tracking
- Geographic location (latitude/longitude)
- Media attachments (S3 URLs)
- Estimated affected people count
- Response time tracking
- Resolution and closure timestamps

**Relations:**
- Reported by a User
- Assigned to an Agency (optional)
- Has Dispatch Assignments
- Has Messages
- Has Updates

### 4. DispatchAssignment
Represents the assignment of responders/agencies to incidents.

**Key Features:**
- Status tracking (dispatched, accepted, en_route, arrived, completed)
- Priority levels (1-5)
- Timestamps for each stage
- Current responder location
- Notes field

**Relations:**
- Belongs to an Incident (Cascade delete)
- Belongs to an Agency
- Assigned to a Responder (User, optional)

### 5. Message
Represents messages in incident threads.

**Key Features:**
- System message flag
- Content storage
- Timestamp tracking

**Relations:**
- Belongs to an Incident (Cascade delete)
- Sent by a User

### 6. IncidentUpdate
Represents updates/changes to incidents.

**Key Features:**
- Update type classification
- Content description
- JSON metadata for flexible data
- Timestamp tracking

**Relations:**
- Belongs to an Incident (Cascade delete)
- Created by a User

### 7. AuditLog
Represents audit trail entries for system actions.

**Key Features:**
- Action type tracking
- Entity type and ID
- Before/after changes (JSON)
- IP address and user agent tracking
- Timestamp

**Relations:**
- Created by a User

### 8. Notification
Represents user notifications.

**Key Features:**
- Notification type
- Read/unread status
- Related entity tracking
- SMS delivery flag
- Timestamp

**Relations:**
- Belongs to a User (Cascade delete)

## Enums

### UserRole
- `CITIZEN` - Regular citizen who can report incidents
- `RESPONDER` - First responder who can be dispatched
- `DISPATCHER` - Dispatcher who manages assignments
- `AGENCY_ADMIN` - Agency administrator
- `SYSTEM_ADMIN` - System administrator

### AgencyType
- `NADMO` - National Disaster Management Organization
- `FIRE_SERVICE` - Ghana National Fire Service
- `POLICE` - Ghana Police Service
- `AMBULANCE` - National Ambulance Service
- `PRIVATE_RESPONDER` - Private responder organizations

### IncidentSeverity
- `LOW` - Low priority
- `MEDIUM` - Medium priority
- `HIGH` - High priority
- `CRITICAL` - Critical/life-threatening

### IncidentStatus
- `REPORTED` - Incident has been reported
- `DISPATCHED` - Incident has been dispatched
- `IN_PROGRESS` - Responders are working on it
- `RESOLVED` - Incident has been resolved
- `CLOSED` - Incident has been closed

## Indexes

The schema includes comprehensive indexes for optimal query performance:

- **User**: email, phone, agencyId, role, isActive
- **Agency**: type, region+district, isActive, latitude+longitude
- **Incident**: status, severity, reportedById, assignedAgencyId, region+district, latitude+longitude, createdAt, category
- **DispatchAssignment**: incidentId, agencyId, responderId, status, priority, dispatchedAt
- **Message**: incidentId, senderId, createdAt
- **IncidentUpdate**: incidentId, userId, updateType, createdAt
- **AuditLog**: userId, action, entity+entityId, createdAt
- **Notification**: userId, isRead, type, createdAt, relatedEntityType+relatedEntityId

## Cascade Delete Rules

- **Cascade**: When an Incident is deleted, all related Messages, IncidentUpdates, and DispatchAssignments are deleted
- **Cascade**: When a User is deleted, all their Notifications are deleted
- **Restrict**: Users cannot be deleted if they have reported Incidents, sent Messages, created Updates, or have Audit Logs
- **SetNull**: When an Agency is deleted, User.agencyId is set to null
- **SetNull**: When an Agency is deleted from an Incident, assignedAgencyId is set to null

## Usage

### Generate Prisma Client
```bash
npm run db:generate
```

### Push Schema to Database
```bash
npm run db:push
```

### Open Prisma Studio
```bash
npm run db:studio
```

## Next Steps

1. Set up your PostgreSQL database
2. Configure `DATABASE_URL` in `.env`
3. Run `npm run db:push` to create tables
4. Run `npm run db:generate` to generate Prisma Client
5. Start using Prisma Client in your application

