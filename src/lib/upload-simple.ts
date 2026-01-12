/**
 * Simple File Upload Utility
 * Uploads files to S3/R2 with compression
 */

import imageCompression from 'browser-image-compression';

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
 * Upload file to cloud storage
 */
export async function uploadToCloud(file: File): Promise<string> {
  try {
    // Step 1: Compress if needed
    const processedFile = await compressImage(file);

    // Step 2: Get presigned URL from backend
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
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, fileUrl } = await response.json();

    // Step 3: Upload directly to S3/R2
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: processedFile,
      headers: {
        'Content-Type': processedFile.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }

    // Step 4: Return public URL
    return fileUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
