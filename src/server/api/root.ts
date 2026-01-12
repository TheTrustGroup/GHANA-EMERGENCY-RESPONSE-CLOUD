import { createTRPCRouter } from '@/server/api/trpc';
import { authRouter } from './routers/auth';
import { incidentsRouter } from './routers/incidents';
import { dispatchRouter } from './routers/dispatch';
import { agenciesRouter } from './routers/agencies';
import { usersRouter } from './routers/users';
import { analyticsRouter } from './routers/analytics';
import { notificationsRouter } from './routers/notifications';
import { auditRouter } from './routers/audit';
import { messagesRouter } from './routers/messages';
import { uploadRouter } from './routers/upload';
import { reportsRouter } from './routers/reports';
import { systemRouter } from './routers/system';

/**
 * Root tRPC Router
 * Combines all sub-routers into a single router
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  incidents: incidentsRouter,
  dispatch: dispatchRouter,
  agencies: agenciesRouter,
  users: usersRouter,
  analytics: analyticsRouter,
  notifications: notificationsRouter,
  audit: auditRouter,
  upload: uploadRouter,
  messages: messagesRouter,
  reports: reportsRouter,
  system: systemRouter,
});

export type AppRouter = typeof appRouter;

