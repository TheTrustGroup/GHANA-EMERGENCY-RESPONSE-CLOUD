/**
 * File Upload Security
 * Validate and secure file uploads
 */

import crypto from 'crypto';

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB

interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

/**
 * Validate file type
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  let sanitized = filename.replace(/^.*[\\/]/, '');

  // Remove special characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }

  // Generate random prefix to prevent overwrite attacks
  const randomPrefix = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();

  const ext = sanitized.substring(sanitized.lastIndexOf('.'));
  const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));

  return `${randomPrefix}_${timestamp}_${nameWithoutExt}${ext}`;
}

/**
 * Validate uploaded file
 */
export function validateUploadedFile(
  file: {
    name: string;
    type: string;
    size: number;
  }
): FileValidationResult {
  // Check file type
  const isImage = validateFileType(file.type, ALLOWED_IMAGE_TYPES);
  const isVideo = validateFileType(file.type, ALLOWED_VIDEO_TYPES);
  const isDocument = validateFileType(file.type, ALLOWED_DOCUMENT_TYPES);

  if (!isImage && !isVideo && !isDocument) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file size
  let maxSize: number;
  if (isImage) {
    maxSize = MAX_IMAGE_SIZE;
  } else if (isVideo) {
    maxSize = MAX_VIDEO_SIZE;
  } else {
    maxSize = MAX_DOCUMENT_SIZE;
  }

  if (!validateFileSize(file.size, maxSize)) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.name);

  return {
    valid: true,
    sanitizedFilename,
  };
}

/**
 * Check file extension matches MIME type
 */
export function validateFileExtension(
  filename: string,
  mimeType: string
): boolean {
  const ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();

  const extensionMap: Record<string, string[]> = {
    jpg: ['image/jpeg', 'image/jpg'],
    jpeg: ['image/jpeg', 'image/jpg'],
    png: ['image/png'],
    gif: ['image/gif'],
    webp: ['image/webp'],
    mp4: ['video/mp4'],
    webm: ['video/webm'],
    mov: ['video/quicktime'],
    pdf: ['application/pdf'],
    doc: ['application/msword'],
    docx: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  };

  const allowedMimeTypes = extensionMap[ext];
  if (!allowedMimeTypes) {
    return false;
  }

  return allowedMimeTypes.includes(mimeType);
}

/**
 * Scan file for malware (placeholder - integrate with ClamAV or VirusTotal)
 */
export async function scanForMalware(
  fileBuffer: Buffer,
  _filename: string
): Promise<{ clean: boolean; threat?: string }> {
  // TODO: Integrate with ClamAV or VirusTotal API
  // For now, perform basic checks

  // Check for executable signatures
  const executableSignatures = [
    Buffer.from('MZ'), // Windows PE
    Buffer.from('\x7fELF'), // Linux ELF
    Buffer.from('\xfe\xed\xfa\xce'), // macOS Mach-O
  ];

  for (const signature of executableSignatures) {
    if (fileBuffer.subarray(0, signature.length).equals(signature)) {
      return {
        clean: false,
        threat: 'Executable file detected',
      };
    }
  }

  // Check for script tags in first 1KB
  const preview = fileBuffer.subarray(0, 1024).toString('utf-8', 0, 1024);
  if (preview.includes('<script') || preview.includes('<?php')) {
    return {
      clean: false,
      threat: 'Suspicious content detected',
    };
  }

  return { clean: true };
}

/**
 * Extract file metadata safely
 */
export function extractFileMetadata(file: File): {
  name: string;
  type: string;
  size: number;
  lastModified: number;
} {
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
  };
}

