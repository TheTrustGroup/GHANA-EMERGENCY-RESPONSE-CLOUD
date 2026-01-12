# Ghana Emergency Response Platform

A government-grade Emergency Response Platform built with Next.js 14, TypeScript, and modern web technologies.

## Tech Stack

- **Framework**: Next.js 14.2.0 (App Router)
- **Language**: TypeScript 5.4.0
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma 5.10.0
- **API**: tRPC for type-safe APIs
- **Authentication**: NextAuth.js
- **Maps**: Mapbox GL
- **UI Components**: Radix UI (shadcn/ui)
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query

## Project Structure

```
/src
  /app              # Next.js App Router pages
  /components       # Reusable UI components
    /ui             # shadcn/ui components
    /dashboard      # Dashboard-specific components
    /maps           # Map components
  /lib              # Utilities and helpers
  /server           # Backend logic
    /api            # tRPC routers
    /db             # Prisma client
  /types            # TypeScript types
  /hooks            # Custom React hooks
  /utils            # Utility functions
  /constants        # Application constants
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp env.example .env
   ```

4. Update `.env` with your actual credentials:
   - Database connection string
   - NextAuth secret (generate with: `openssl rand -base64 32`)
   - Mapbox token
   - AWS credentials
   - Africa's Talking credentials
   - Pusher credentials

5. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without emitting files
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:generate` - Generate Prisma Client

## Configuration

### Absolute Imports

The project uses `@` alias for absolute imports pointing to `src/`:

```typescript
import { cn } from '@/lib/utils';
import { prisma } from '@/server/db';
```

### Environment Variables

See `env.example` for all required environment variables.

## Development Guidelines

- Use TypeScript for all new files
- Follow ESLint and Prettier configurations
- Use absolute imports with `@/` prefix
- Write type-safe code with Zod schemas
- Follow the existing folder structure

## License

Proprietary - Government of Ghana

