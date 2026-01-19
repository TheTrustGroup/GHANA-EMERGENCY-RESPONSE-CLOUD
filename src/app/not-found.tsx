'use client';

/**
 * 404 Not Found Page
 * Graceful fallback for unknown routes
 */

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-black text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Link href="/dashboard">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">
              <Search className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>

        <div className="mt-12 rounded-lg bg-blue-50 p-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">Common Pages:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <Link href="/dashboard" className="text-blue-600 hover:underline">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/report" className="text-blue-600 hover:underline">
                Report Emergency
              </Link>
            </li>
            <li>
              <Link href="/help" className="text-blue-600 hover:underline">
                Help & Support
              </Link>
            </li>
            <li>
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Sign In
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
