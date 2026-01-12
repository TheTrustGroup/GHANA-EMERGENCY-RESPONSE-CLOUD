/**
 * Upload Security Tests
 * Tests for file upload security validation
 */

import {
  validateUploadedFile,
  validateFileType,
  validateFileSize,
  sanitizeFilename,
  validateFileExtension,
} from '../upload-security';

describe('Upload Security', () => {
  describe('validateFileType', () => {
    it('should accept allowed image types', () => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      allowedTypes.forEach((type) => {
        const isValid = validateFileType(type, [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ]);
        expect(isValid).toBe(true);
      });
    });

    it('should reject disallowed file types', () => {
      const disallowedTypes = [
        'application/javascript',
        'application/x-executable',
        'text/html',
        'application/x-msdownload',
      ];

      disallowedTypes.forEach((type) => {
        const isValid = validateFileType(type, [
          'image/jpeg',
          'image/png',
        ]);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('validateFileSize', () => {
    it('should accept files within size limit', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validSizes = [
        1024, // 1KB
        1024 * 1024, // 1MB
        5 * 1024 * 1024, // 5MB
        10 * 1024 * 1024, // 10MB (exactly at limit)
      ];

      validSizes.forEach((size) => {
        const isValid = validateFileSize(size, maxSize);
        expect(isValid).toBe(true);
      });
    });

    it('should reject files exceeding size limit', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const invalidSizes = [
        11 * 1024 * 1024, // 11MB
        100 * 1024 * 1024, // 100MB
      ];

      invalidSizes.forEach((size) => {
        const isValid = validateFileSize(size, maxSize);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path components', () => {
      const malicious = '../../../etc/passwd';
      const sanitized = sanitizeFilename(malicious);

      expect(sanitized).not.toContain('../');
      expect(sanitized).not.toContain('/');
    });

    it('should remove special characters', () => {
      const malicious = 'file<script>alert(1)</script>.jpg';
      const sanitized = sanitizeFilename(malicious);

      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('(');
      expect(sanitized).not.toContain(')');
    });

    it('should generate unique filenames', () => {
      const filename = 'test.jpg';
      const sanitized1 = sanitizeFilename(filename);
      const sanitized2 = sanitizeFilename(filename);

      // Should be different due to random prefix and timestamp
      expect(sanitized1).not.toBe(sanitized2);
    });

    it('should preserve file extension', () => {
      const filename = 'test.jpg';
      const sanitized = sanitizeFilename(filename);

      expect(sanitized).toContain('.jpg');
    });

    it('should limit filename length', () => {
      const longFilename = 'a'.repeat(300) + '.jpg';
      const sanitized = sanitizeFilename(longFilename);

      expect(sanitized.length).toBeLessThanOrEqual(255 + 50); // Allow for prefix/timestamp
    });

    it('should handle filenames without extension', () => {
      const filename = 'testfile';
      const sanitized = sanitizeFilename(filename);

      expect(sanitized).toBeDefined();
      expect(sanitized.length).toBeGreaterThan(0);
    });
  });

  describe('validateFileExtension', () => {
    it('should validate extension matches MIME type', () => {
      const validPairs = [
        { filename: 'test.jpg', mimeType: 'image/jpeg' },
        { filename: 'test.png', mimeType: 'image/png' },
        { filename: 'test.pdf', mimeType: 'application/pdf' },
      ];

      validPairs.forEach(({ filename, mimeType }) => {
        const isValid = validateFileExtension(filename, mimeType);
        expect(isValid).toBe(true);
      });
    });

    it('should reject mismatched extension and MIME type', () => {
      const invalidPairs = [
        { filename: 'test.jpg', mimeType: 'image/png' },
        { filename: 'test.png', mimeType: 'application/pdf' },
        { filename: 'test.exe', mimeType: 'image/jpeg' },
      ];

      invalidPairs.forEach(({ filename, mimeType }) => {
        const isValid = validateFileExtension(filename, mimeType);
        expect(isValid).toBe(false);
      });
    });

    it('should handle case-insensitive extensions', () => {
      const cases = [
        { filename: 'test.JPG', mimeType: 'image/jpeg' },
        { filename: 'test.PNG', mimeType: 'image/png' },
        { filename: 'test.JpG', mimeType: 'image/jpeg' },
      ];

      cases.forEach(({ filename, mimeType }) => {
        const isValid = validateFileExtension(filename, mimeType);
        expect(isValid).toBe(true);
      });
    });
  });

  describe('validateUploadedFile', () => {
    it('should validate a correct image file', () => {
      const file = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      };

      const result = validateUploadedFile(file);

      expect(result.valid).toBe(true);
      expect(result.sanitizedFilename).toBeDefined();
    });

    it('should reject file with disallowed type', () => {
      const file = {
        name: 'test.exe',
        type: 'application/x-msdownload',
        size: 1024,
      };

      const result = validateUploadedFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject file exceeding size limit', () => {
      const file = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 11 * 1024 * 1024, // 11MB (exceeds 10MB limit)
      };

      const result = validateUploadedFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('size');
    });

    it('should validate video files', () => {
      const file = {
        name: 'test.mp4',
        type: 'video/mp4',
        size: 20 * 1024 * 1024, // 20MB (within 50MB limit)
      };

      const result = validateUploadedFile(file);

      expect(result.valid).toBe(true);
    });

    it('should reject video files exceeding limit', () => {
      const file = {
        name: 'test.mp4',
        type: 'video/mp4',
        size: 60 * 1024 * 1024, // 60MB (exceeds 50MB limit)
      };

      const result = validateUploadedFile(file);

      expect(result.valid).toBe(false);
    });
  });
});

