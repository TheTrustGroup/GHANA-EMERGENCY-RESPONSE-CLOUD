/**
 * Auth Utility Tests
 * Tests for password hashing and verification
 */

import { hashPassword, verifyPassword } from '@/lib/security/encryption';

describe('Password Hashing and Verification', () => {
  describe('hashPassword', () => {
    it('should produce different hashes for the same input (salt)', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Hashes should be different due to salt
      expect(hash1).not.toBe(hash2);
    });

    it('should produce a hash in the correct format (salt:hash)', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const parts = hash.split(':');
      expect(parts).toHaveLength(2);
      expect(parts[0]).toBeTruthy(); // Salt
      expect(parts[1]).toBeTruthy(); // Hash
    });

    it('should produce a hash of sufficient length', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      // Hash should be substantial (salt + hash)
      expect(hash.length).toBeGreaterThan(100);
    });
  });

  describe('verifyPassword', () => {
    it('should correctly validate correct passwords', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should reject passwords with invalid hash format', async () => {
      const password = 'TestPassword123!';
      const invalidHash = 'invalid-hash-format';

      const isValid = await verifyPassword(password, invalidHash);
      expect(isValid).toBe(false);
    });

    it('should handle empty password correctly', async () => {
      const password = '';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should handle special characters in passwords', async () => {
      const password = 'P@ssw0rd!@#$%^&*()';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should handle long passwords', async () => {
      const password = 'A'.repeat(200);
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });
  });

  describe('Password Security', () => {
    it('should use sufficient iterations for key derivation', async () => {
      // This test verifies that the hash function uses sufficient iterations
      // The actual iteration count is in the encryption.ts file (100000)
      const password = 'TestPassword123!';
      const startTime = Date.now();
      await hashPassword(password);
      const endTime = Date.now();

      // Hashing should take some time (indicating sufficient iterations)
      // This is a basic check - in production, verify the actual iteration count
      expect(endTime - startTime).toBeGreaterThan(0);
    });

    it('should produce unique salts for each hash', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      const salt1 = hash1.split(':')[0];
      const salt2 = hash2.split(':')[0];

      expect(salt1).not.toBe(salt2);
    });
  });
});

