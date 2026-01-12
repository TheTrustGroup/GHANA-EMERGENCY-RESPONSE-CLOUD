/**
 * Input Sanitization Utilities
 * Prevents XSS and ensures data integrity
 */

/**
 * Sanitize user input by removing HTML tags and encoding special characters
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let clean = input.replace(/<[^>]*>/g, '');

  // Remove script tags specifically (more aggressive)
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Encode special characters to prevent XSS
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Trim whitespace
  return clean.trim();
}

/**
 * Validate Ghana coordinates
 * Ghana bounding box: 4.5°N to 11.5°N, -3.5°W to 1.5°E
 */
export function validateGhanaCoordinates(lat: number, lng: number): boolean {
  const MIN_LAT = 4.5;
  const MAX_LAT = 11.5;
  const MIN_LNG = -3.5;
  const MAX_LNG = 1.5;

  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= MIN_LAT &&
    lat <= MAX_LAT &&
    lng >= MIN_LNG &&
    lng <= MAX_LNG
  );
}

/**
 * Validate Ghana phone number
 * Supports both international (+233XXXXXXXXX) and local (0XXXXXXXXXX) formats
 */
export function validateGhanaPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');

  // International format: +233XXXXXXXXX (9 digits after +233)
  const intlRegex = /^\+233[0-9]{9}$/;

  // Local format: 0XXXXXXXXXX (10 digits starting with 0)
  const localRegex = /^0[0-9]{9}$/;

  return intlRegex.test(cleaned) || localRegex.test(cleaned);
}

/**
 * Normalize Ghana phone number to international format
 */
export function normalizeGhanaPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, '');

  // Convert local format to international
  if (cleaned.startsWith('0')) {
    return '+233' + cleaned.substring(1);
  }

  // Already in international format
  if (cleaned.startsWith('+233')) {
    return cleaned;
  }

  // If it's just digits, assume it's local format
  if (/^[0-9]{10}$/.test(cleaned)) {
    return '+233' + cleaned.substring(1);
  }

  return cleaned;
}

/**
 * Escape HTML for safe rendering
 * Use this when you need to render user input as HTML
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'file';
  }

  // Remove path separators and dangerous characters
  return filename
    .replace(/[\/\\?%*:|"<>]/g, '')
    .replace(/\.\./g, '')
    .trim()
    .substring(0, 255); // Limit length
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Sanitize and validate URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}
