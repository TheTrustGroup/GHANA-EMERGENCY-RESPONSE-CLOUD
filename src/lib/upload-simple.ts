/**
 * Simple File Upload Utility
 * Uploads files to Supabase Storage with compression
 */

import imageCompression from 'browser-image-compression';
import { createClient } from '@supabase/supabase-js';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_IMAGE_WIDTH = 1920;

/**
 * Compress image if needed
 */
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file; // Don't compress videos
  }

  if (file.size <= MAX_FILE_SIZE) {
    return file; // Already small enough
  }

  try {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: MAX_IMAGE_WIDTH,
      useWebWorker: true,
    };

    const compressed = await imageCompression(file, options);
    return compressed;
  } catch (error) {
    console.error('Compression error:', error);
    return file; // Return original if compression fails
  }
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadToCloud(file: File): Promise<string> {
  try {
    // Step 1: Compress if needed
    const processedFile = await compressImage(file);

    // Step 2: Get upload path from backend
    const response = await fetch('/api/upload/presigned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: processedFile.name,
        contentType: processedFile.type,
        size: processedFile.size,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload path');
    }

    const { filePath, fileUrl, supabaseUrl, bucketName } = await response.json();

    // Step 3: Upload directly to Supabase Storage using client
    const supabase = createClient(
      supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const { error } = await supabase.storage
      .from(bucketName || 'incident-reports')
      .upload(filePath, processedFile, {
        contentType: processedFile.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Step 4: Return public URL
    return fileUrl || `${supabaseUrl}/storage/v1/object/public/${bucketName || 'incident-reports'}/${filePath}`;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
