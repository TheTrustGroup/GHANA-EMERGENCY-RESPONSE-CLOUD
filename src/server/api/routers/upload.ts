/**
 * Upload Router
 * Handles file upload operations with Supabase Storage
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize Supabase admin client
const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

const BUCKET_NAME = 'incident-reports';

export const uploadRouter = createTRPCRouter({
  getPresignedUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase not configured',
        });
      }

      // Generate unique filename
      const fileExtension = input.filename.split('.').pop();
      const uniqueFilename = `${ctx.session.user.id}/${crypto.randomUUID()}.${fileExtension}`;
      const filePath = `incidents/${uniqueFilename}`;

      try {
        // Get public URL (we'll upload directly using client, no need for signed URL)
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        return {
          filePath,
          key: filePath,
          fileUrl: publicUrlData.publicUrl,
          supabaseUrl: supabaseUrl,
          bucketName: BUCKET_NAME,
        };
      } catch (error) {
        console.error('Upload URL error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate upload URL',
        });
      }
    }),
});

