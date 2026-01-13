import { describe, it, expect } from '@jest/globals';

describe('API: Registration Endpoint', () => {
  it('should validate phone number format', async () => {
    const invalidPhones = [
      '123456',
      'abcdefghij',
      '+2331234', // too short
      '+234501234567', // wrong country code
    ];

    for (const phone of invalidPhones) {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          phone,
          password: 'TestPassword123',
          role: 'CITIZEN',
        }),
      });

      expect(response.status).toBe(400);
    }
  });

  it('should validate password strength', async () => {
    const weakPasswords = [
      'short',
      'alllowercase',
      'ALLUPPERCASE',
      'NoNumbers',
      '12345678',
    ];

    for (const password of weakPasswords) {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          phone: '+233501234567',
          password,
          role: 'CITIZEN',
        }),
      });

      expect(response.status).toBe(400);
    }
  });
});
