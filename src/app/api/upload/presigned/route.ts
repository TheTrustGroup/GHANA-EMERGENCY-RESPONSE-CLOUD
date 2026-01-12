/**
 * Presigned URL API Route
 * Generates presigned URLs for direct S3/R2 uploads
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(req: NextRequest) {
  try {
    // Require authentication (optional - can allow anonymous for emergency reports)
    // await requireAuth();

    const { filename, contentType, size } = await req.json();

    // Validate file
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Filename and content type required' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum 10MB allowed.' },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/quicktime',
    ];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and videos allowed.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = filename.split('.').pop();
    const key = `incidents/${timestamp}-${random}.${extension}`;

    // Create presigned URL (valid for 5 minutes)
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: key,
      ContentType: contentType,
      // Make it public (or use ACL: 'public-read' if needed)
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // Public URL
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return NextResponse.json({ uploadUrl, fileUrl, key });
  } catch (error) {
    console.error('Presigned URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
