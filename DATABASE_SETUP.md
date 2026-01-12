# Database Setup Guide

This guide walks you through setting up the Prisma database for the Ghana Emergency Response Platform.

## Prerequisites

1. PostgreSQL database (local or cloud)
2. Node.js and npm installed
3. Environment variables configured

## Step-by-Step Setup

### 1. Configure Database Connection

Update the `DATABASE_URL` in your `.env` file:

```env
DATABASE_URL="postgresql://username:password@host:5432/database_name?schema=public"
```

**Examples:**
- **Local PostgreSQL**: `postgresql://postgres:password@localhost:5432/ghana_emergency_db?schema=public`
- **Supabase**: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres`
- **Railway**: `postgresql://postgres:[PASSWORD]@[HOST]:5432/railway`

### 2. Generate Prisma Client

Generate the Prisma Client from your schema:

```bash
npm run db:generate
```

This creates TypeScript types and the Prisma Client in `node_modules/@prisma/client`.

### 3. Push Schema to Database

Create all tables, indexes, and relationships in your database:

```bash
npm run db:push
```

This will:
- Create all 8 models (User, Agency, Incident, etc.)
- Set up all relationships and foreign keys
- Create all indexes for optimal performance
- Configure cascade delete rules

### 4. Seed the Database

Populate the database with initial data:

```bash
npm run db:seed
```

This creates:
- **5 Agencies**: NADMO HQ (Accra), Fire Service (Tema), Police (Kumasi), Ambulance (Takoradi), Private Security (Accra)
- **1 System Admin**: Full platform access
- **3 Agency Admins**: One for each major agency
- **2 Dispatchers**: For incident management
- **10 Responders**: Distributed across agencies
- **5 Citizens**: Sample citizen users

### 5. Verify Setup

Open Prisma Studio to view your data:

```bash
npm run db:studio
```

This opens a visual database browser at `http://localhost:5555`

## Default Login Credentials

After seeding, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| System Admin | `admin@emergency.gov.gh` | `Admin@123` |
| Agency Admin | `nadmo.admin@emergency.gov.gh` | `Admin@123` |
| Dispatcher | `dispatcher1@emergency.gov.gh` | `Dispatcher@123` |
| Responder | `responder1@nadmo.gov.gh` | `Responder@123` |
| Citizen | `citizen1@example.com` | `Citizen@123` |

## Database Utilities

The project includes utility functions in `src/server/db/utils.ts`:

### `calculateDistance(lat1, lon1, lat2, lon2)`
Calculates distance between two coordinates using Haversine formula (returns kilometers).

```typescript
import { calculateDistance } from '@/server/db/utils';

const distance = calculateDistance(5.6037, -0.187, 5.6833, -0.0167);
// Returns distance in km between Accra and Tema
```

### `isWithinGhana(lat, lon)`
Checks if coordinates are within Ghana's boundaries.

```typescript
import { isWithinGhana } from '@/server/db/utils';

if (isWithinGhana(5.6037, -0.187)) {
  // Coordinates are in Ghana
}
```

### `formatGhanaPhone(phone)`
Normalizes Ghana phone numbers to `+233XXXXXXXXX` format.

```typescript
import { formatGhanaPhone } from '@/server/db/utils';

const formatted = formatGhanaPhone('0244123456');
// Returns: +233244123456
```

### `getRegionFromCoordinates(lat, lon)`
Maps coordinates to Ghana regions.

```typescript
import { getRegionFromCoordinates } from '@/server/db/utils';

const region = getRegionFromCoordinates(5.6037, -0.187);
// Returns: "Greater Accra"
```

## Using Prisma Client

Import the singleton Prisma Client:

```typescript
import { prisma } from '@/server/db';

// Example: Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    passwordHash: 'hashed_password',
    role: 'CITIZEN',
  },
});

// Example: Query with relations
const incident = await prisma.incident.findUnique({
  where: { id: 'incident_id' },
  include: {
    reportedBy: true,
    assignedAgency: true,
    dispatchAssignments: true,
  },
});
```

## Database Models

The schema includes 8 models:

1. **User** - All platform users (citizens, responders, admins)
2. **Agency** - Emergency response agencies
3. **Incident** - Emergency incidents
4. **DispatchAssignment** - Responder assignments
5. **Message** - Incident messages
6. **IncidentUpdate** - Incident change history
7. **AuditLog** - System audit trail
8. **Notification** - User notifications

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Ensure `.env` file exists and contains `DATABASE_URL`
- Check that the connection string is properly formatted

### "User was denied access on the database"
- Verify database credentials are correct
- Ensure the database exists
- Check user permissions

### "Cannot find module '@prisma/client'"
- Run `npm run db:generate` to generate the client
- Ensure `@prisma/client` is installed: `npm install @prisma/client`

### Seed script fails
- Ensure database is accessible
- Check that schema has been pushed: `npm run db:push`
- Verify all dependencies are installed: `npm install`

## Next Steps

After database setup:
1. Configure authentication (NextAuth.js)
2. Set up API routes (tRPC)
3. Create frontend components
4. Implement real-time features

For more information, see the main [README.md](./README.md).

