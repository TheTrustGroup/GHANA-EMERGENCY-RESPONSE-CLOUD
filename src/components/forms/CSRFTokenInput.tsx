'use client';

/**
 * CSRF Token Input Component
 * Client component that fetches and includes CSRF token in forms
 */

import { useEffect, useState } from 'react';

interface CSRFTokenInputProps {
  name?: string;
}

export function CSRFTokenInput({ name = 'csrf-token' }: CSRFTokenInputProps) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch CSRF token from API
    fetch('/api/csrf-token')
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setToken(data.token);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch CSRF token:', error);
      });
  }, []);

  if (!token) {
    return null; // Don't render until token is loaded
  }

  return <input type="hidden" name={name} value={token} />;
}
