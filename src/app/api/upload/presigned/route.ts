/**
 * Presigned URL API Route
 * Generates presigned URLs for Supabase Storage uploads
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(req: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

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
    const filePath = `incidents/${timestamp}-${random}.${extension}`;

    // For Supabase, we'll return a token-based upload approach
    // The client will upload directly using the Supabase client
    // Return the file path and public URL instead of presigned URL
    
    // Public URL (for public buckets)
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    // Return file path for client-side upload
    return NextResponse.json({
      filePath,
      fileUrl,
      key: filePath,
      // Include Supabase URL and anon key for client-side upload
      supabaseUrl: supabaseUrl,
      bucketName: BUCKET_NAME,
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
