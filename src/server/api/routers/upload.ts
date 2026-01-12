/**
 * Upload Router
 * Handles file upload operations with S3 presigned URLs
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';

export const uploadRouter = createTRPCRouter({
  getPresignedUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!BUCKET_NAME) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'S3 bucket not configured',
        });
      }

      // Generate unique filename
      const fileExtension = input.filename.split('.').pop();
      const uniqueFilename = `${ctx.session.user.id}/${crypto.randomUUID()}.${fileExtension}`;
      const key = `incidents/${uniqueFilename}`;

      // Create presigned URL
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: input.contentType,
        ACL: 'public-read',
      });

      try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

        return {
          url,
          key,
        };
      } catch (error) {
        console.error('S3 presigned URL error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate upload URL',
        });
      }
    }),
});

