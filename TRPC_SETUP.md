# tRPC API Setup Guide

This document describes the complete tRPC API setup for the Ghana Emergency Response Platform.

## Overview

The platform uses tRPC v10 with Next.js App Router for type-safe, end-to-end API communication. All routes are protected with role-based access control and include comprehensive validation.

## Architecture

### Core Setup

- **Context**: Includes session (NextAuth), Prisma client, and request object
- **Procedures**: 
  - `publicProcedure` - No authentication required
  - `protectedProcedure` - Requires authentication
  - `adminProcedure` - Requires SYSTEM_ADMIN role
  - `dispatcherProcedure` - Requires DISPATCHER, AGENCY_ADMIN, or SYSTEM_ADMIN

### Middleware

- **Logging**: All requests are logged in development mode
- **Authentication**: Automatic session validation
- **Authorization**: Role-based access control
- **Error Handling**: Comprehensive error formatting with Zod validation errors

## Routers

### 1. Auth Router (`/api/trpc/auth.*`)

**Public Procedures:**
- `register` - Create new user account
- `verifyEmail` - Verify email with token
- `requestPasswordReset` - Send password reset email
- `resetPassword` - Reset password with token

### 2. Incidents Router (`/api/trpc/incidents.*`)

**Protected Procedures:**
- `create` - Create new incident (any authenticated user)
- `getAll` - Get paginated list with filters
- `getById` - Get single incident with full details
- `getNearby` - Get incidents within radius (km)
- `getActive` - Get all non-closed incidents for map

**Dispatcher Procedures:**
- `update` - Update incident details
- `updateStatus` - Change incident status
- `assignAgency` - Assign incident to agency

**Features:**
- Role-based filtering (citizens see only their reports)
- Permission checks before operations
- Automatic audit logging

### 3. Dispatch Router (`/api/trpc/dispatch.*`)

**Dispatcher Procedures:**
- `create` - Create dispatch assignment

**Protected Procedures:**
- `accept` - Responder accepts assignment
- `updateLocation` - Update responder location
- `complete` - Mark dispatch as complete
- `getByIncident` - Get all dispatches for incident
- `getMyAssignments` - Get responder's assignments

### 4. Agencies Router (`/api/trpc/agencies.*`)

**Public Procedures:**
- `getAll` - List all active agencies
- `getById` - Get agency details

**Admin Procedures:**
- `create` - Create new agency
- `update` - Update agency details

**Protected Procedures:**
- `getStats` - Get agency performance statistics

### 5. Users Router (`/api/trpc/users.*`)

**Protected Procedures:**
- `getProfile` - Get current user profile
- `updateProfile` - Update own profile
- `getByAgency` - List users in agency (with permission check)

**Admin Procedures:**
- `updateRole` - Change user role
- `deactivate` - Deactivate user account

### 6. Analytics Router (`/api/trpc/analytics.*`)

**Protected Procedures (requires analytics access):**
- `getIncidentStats` - Incident counts by severity, category, status
- `getResponseTimeMetrics` - Average response times by agency
- `getGeographicDistribution` - Incidents by region/district
- `getAgencyPerformance` - Performance metrics for agencies

### 7. Notifications Router (`/api/trpc/notifications.*`)

**Protected Procedures:**
- `getMyNotifications` - Get user's notifications (paginated)
- `markAsRead` - Mark notification as read
- `markAllAsRead` - Mark all notifications as read

### 8. Audit Router (`/api/trpc/audit.*`)

**Protected Procedures:**
- `create` - Create audit log entry
- `getByEntity` - Get audit trail for entity
- `getByUser` - Get user's audit logs (own or admin)

**Admin Procedures:**
- `search` - Search audit logs with filters

## Usage Examples

### Client-Side (React Components)

```typescript
'use client';

import { trpc } from '@/lib/trpc/client';

export function IncidentList() {
  const { data, isLoading } = trpc.incidents.getAll.useQuery({
    page: 1,
    pageSize: 20,
    status: 'REPORTED',
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.incidents.map((incident) => (
        <div key={incident.id}>{incident.title}</div>
      ))}
    </div>
  );
}
```

### Server-Side (Server Components)

```typescript
import { trpc } from '@/lib/trpc/client';
import { getServerSession } from '@/lib/auth';

export default async function ServerComponent() {
  const session = await getServerSession();
  // Use tRPC server-side with session context
  // Note: Server-side usage requires different setup
}
```

### Mutations

```typescript
'use client';

import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';

export function CreateIncidentForm() {
  const router = useRouter();
  const createIncident = trpc.incidents.create.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  const handleSubmit = (data: any) => {
    createIncident.mutate({
      title: data.title,
      description: data.description,
      severity: 'HIGH',
      category: 'fire',
      latitude: 5.6037,
      longitude: -0.187,
      region: 'Greater Accra',
      district: 'Accra Metropolitan',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Validation

All inputs are validated using Zod schemas:

- **Incidents**: `createIncidentSchema`, `updateIncidentSchema`, `incidentFiltersSchema`
- **Dispatch**: `createDispatchSchema`, `updateDispatchLocationSchema`
- **Agencies**: `createAgencySchema`, `updateAgencySchema`
- **Users**: `updateProfileSchema`, `updateUserRoleSchema`
- **Analytics**: `analyticsFiltersSchema`, `dateRangeSchema`

## Error Handling

tRPC provides structured error responses:

```typescript
{
  error: {
    message: "Error message",
    code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR",
    data: {
      zodError: { /* Zod validation errors */ }
    }
  }
}
```

## Security Features

1. **Authentication**: All protected procedures require valid session
2. **Authorization**: Role-based access control at procedure level
3. **Input Validation**: All inputs validated with Zod
4. **Audit Logging**: Critical operations logged automatically
5. **Permission Checks**: Business logic permissions verified before operations
6. **Error Sanitization**: Errors don't expose sensitive information

## Type Safety

Full end-to-end type safety:

```typescript
import type { AppRouter } from '@/server/api/root';

// All router types are inferred
type Incident = AppRouter['incidents']['getById']['_def']['_output_in'];
```

## Performance

- **Batching**: HTTP batch link batches multiple requests
- **Caching**: React Query handles caching automatically
- **Pagination**: All list endpoints support pagination
- **Filtering**: Efficient database queries with proper indexes

## Next Steps

1. Implement email sending for auth operations
2. Add real-time subscriptions for incident updates
3. Implement file upload for incident media
4. Add rate limiting middleware
5. Set up monitoring and logging

For more information, see the main [README.md](./README.md).

