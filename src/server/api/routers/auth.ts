/**
 * Auth Router
 * Handles authentication-related operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { hashPassword } from '@/lib/auth';
import { formatGhanaPhone } from '@/server/db/utils';
import { UserRole } from '@prisma/client';
import crypto from 'crypto';

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string(),
        password: z.string().min(8),
        role: z.nativeEnum(UserRole).default(UserRole.CITIZEN),
        agencyId: z.string().cuid().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user exists
      const existingUser = await ctx.prisma.users.findFirst({
        where: {
          OR: [
            { email: input.email.toLowerCase() },
            { phone: formatGhanaPhone(input.phone) },
          ],
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email or phone already exists',
        });
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Create user
      const user = await ctx.prisma.users.create({
        data: {
          name: input.name,
          email: input.email.toLowerCase(),
          phone: formatGhanaPhone(input.phone),
          passwordHash,
          role: input.role,
          agencyId: input.agencyId || null,
          isActive: input.role === UserRole.CITIZEN,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'user_registered',
          entity: 'User',
          entityId: user.id,
          changes: { role: input.role },
        },
      });

      return { success: true, user };
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async () => {
      // TODO: Verify token from database
      // For now, return success
      return { success: true, message: 'Email verified' };
    }),

  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.users.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if user exists
        return { success: true, message: 'If an account exists, a reset link has been sent' };
      }

      // Generate token
      const resetToken = crypto.randomBytes(32).toString('hex');
      // TODO: Store token in database

      // TODO: Send email
      console.log(`Reset token for ${user.email}: ${resetToken}`);

      return { success: true, message: 'If an account exists, a reset link has been sent' };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async () => {
      // TODO: Verify token from database
      // For now, this is a placeholder
      // const passwordHash = await hashPassword(input.newPassword);
      // TODO: Update user password

      return { success: true, message: 'Password reset successfully' };
    }),
});

