# NextAuth.js Setup Guide

This guide covers the authentication and authorization setup for the Ghana Emergency Response Platform.

## Overview

The platform uses NextAuth.js v4 with:
- **JWT sessions** (for performance, not database sessions)
- **Credentials provider** (email/password and phone/password)
- **Role-based access control** (RBAC)
- **Rate limiting** on login attempts
- **7-day session expiration**

## Environment Variables

### Required Variables

Add these to your `.env` file:

```env
# NextAuth.js Configuration
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Generate NEXTAUTH_SECRET

**Important**: Use a strong, random secret for production:

```bash
openssl rand -base64 32
```

Copy the output and set it as `NEXTAUTH_SECRET` in your `.env` file.

## User Roles

The platform supports 5 user roles:

1. **CITIZEN** - Can report incidents, view own incidents
2. **RESPONDER** - Can view assigned incidents, update status
3. **DISPATCHER** - Can dispatch responders, view all incidents
4. **AGENCY_ADMIN** - Can manage agency, view agency incidents
5. **SYSTEM_ADMIN** - Full platform access

## Authentication Flow

### Sign In

Users can sign in with:
- **Email** + Password
- **Phone Number** + Password (Ghana format: +233XXXXXXXXX or 024XXXXXXXX)

**Example:**
```
Email: admin@emergency.gov.gh
Password: Admin@123
```

Or:
```
Phone: +233244000001
Password: Admin@123
```

### Rate Limiting

Login attempts are rate-limited:
- **Maximum**: 5 attempts per 15 minutes per identifier
- **Lockout**: Automatic after exceeding limit
- **Reset**: Automatically after 15 minutes

## Route Protection

### Public Routes
- `/` - Home page
- `/auth/*` - Authentication pages
- `/api/webhooks/*` - Webhook endpoints

### Protected Routes (Require Authentication)
- `/dashboard/*` - User dashboard
- `/api/*` - API endpoints (except `/api/auth/*`)

### Role-Based Routes

#### Admin Routes (`/admin/*`)
- **Required Role**: `SYSTEM_ADMIN`
- **Access**: Full platform administration

#### Dispatch Routes (`/dispatch/*`)
- **Required Roles**: `DISPATCHER`, `AGENCY_ADMIN`, `SYSTEM_ADMIN`
- **Access**: Incident dispatch and management

## Usage Examples

### Server Components

```typescript
import { getServerSession } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  return <div>Welcome, {session.user.name}</div>;
}
```

### API Routes

```typescript
import { requireAuth, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function GET() {
  const session = await requireAuth();
  // User is authenticated
  
  return Response.json({ user: session.user });
}

export async function POST() {
  const session = await requireRole(UserRole.SYSTEM_ADMIN);
  // User is authenticated AND is system admin
  
  return Response.json({ message: 'Admin action' });
}
```

### Authorization Checks

```typescript
import { canAccessIncident, canEditIncident } from '@/lib/auth-utils';
import { prisma } from '@/server/db';

export async function GET(request: Request) {
  const session = await requireAuth();
  const incidentId = new URL(request.url).searchParams.get('id');
  
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
  });
  
  if (!incident) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  if (!canAccessIncident(session.user, incident)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  return Response.json(incident);
}
```

## Helper Functions

### Authentication Helpers (`src/lib/auth.ts`)

- `getServerSession()` - Get current session
- `requireAuth()` - Require authentication (throws if not authenticated)
- `requireRole(...roles)` - Require specific role(s)
- `hashPassword(password)` - Hash password (bcrypt, 12 rounds)
- `verifyPassword(password, hash)` - Verify password
- `validateCredentials(identifier, password)` - Validate login

### Authorization Helpers (`src/lib/auth-utils.ts`)

- `isSystemAdmin(user)` - Check if system admin
- `isAgencyAdmin(user)` - Check if agency admin
- `isDispatcher(user)` - Check if dispatcher
- `isResponder(user)` - Check if responder
- `canAccessIncident(user, incident)` - Check incident access
- `canEditIncident(user, incident)` - Check edit permission
- `canDispatchToAgency(user, agencyId)` - Check dispatch permission
- `canViewAnalytics(user)` - Check analytics access

## Security Features

### Password Requirements
- **Minimum length**: 8 characters
- **Hashing**: bcrypt with 12 salt rounds
- **Validation**: Enforced on registration and password change

### Session Security
- **Strategy**: JWT (stateless, no database queries)
- **Expiration**: 7 days
- **Refresh**: Token rotation on update
- **Storage**: HTTP-only cookies (handled by NextAuth)

### Rate Limiting
- **Implementation**: In-memory store (simple, effective)
- **Limits**: 5 attempts per 15 minutes
- **Scope**: Per identifier (email/phone)
- **Cleanup**: Automatic cleanup of expired entries

### Middleware Protection
- **Routes**: Automatically protected by middleware
- **Redirects**: Unauthorized users redirected to sign-in
- **Role checks**: Performed at middleware level

## TypeScript Types

Extended NextAuth types are defined in `src/types/next-auth.d.ts`:

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    agencyId: string | null;
    isActive: boolean;
  };
}
```

## Testing Authentication

### Default Test Credentials

After running `npm run db:seed`, use these credentials:

| Role | Email | Phone | Password |
|------|-------|-------|----------|
| System Admin | `admin@emergency.gov.gh` | `+233244000001` | `Admin@123` |
| Agency Admin | `nadmo.admin@emergency.gov.gh` | `+233244000002` | `Admin@123` |
| Dispatcher | `dispatcher1@emergency.gov.gh` | `+233244000010` | `Dispatcher@123` |
| Responder | `responder1@nadmo.gov.gh` | `+233244000101` | `Responder@123` |
| Citizen | `citizen1@example.com` | `+233245000001` | `Citizen@123` |

## Troubleshooting

### "NEXTAUTH_SECRET is not set"
- Ensure `.env` file exists
- Add `NEXTAUTH_SECRET` with a strong random value
- Generate with: `openssl rand -base64 32`

### "Too many login attempts"
- Wait 15 minutes
- Or clear rate limit (requires server restart in current implementation)

### "Unauthorized" errors
- Check user is authenticated: `await getServerSession()`
- Verify user role matches required role
- Check `isActive` status in database

### Session not persisting
- Check `NEXTAUTH_URL` matches your app URL
- Verify cookies are enabled in browser
- Check middleware configuration

## Production Checklist

- [ ] Generate strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Configure CORS if using API from different domain
- [ ] Review rate limiting thresholds
- [ ] Set up session monitoring
- [ ] Implement password reset flow
- [ ] Add email verification
- [ ] Configure 2FA (optional, recommended for admins)

## Next Steps

1. Create sign-in UI component
2. Implement password reset flow
3. Add email verification
4. Set up 2FA for admin users
5. Implement session monitoring
6. Add audit logging for auth events

For more information, see the main [README.md](./README.md).

