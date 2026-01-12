'use client';

/**
 * Success Page
 * Confirmation after emergency report submission
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ReportSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportId = searchParams.get('id');
  const reportNumber = reportId ? reportId.slice(-6).toUpperCase() : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>

        {/* Message */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Emergency Reported
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Help is on the way!
          </p>
          <p className="text-sm text-gray-500">
            Report #{reportNumber} has been sent to emergency services
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">
                What happens next?
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Emergency services have been notified</li>
                <li>• Responders are being dispatched</li>
                <li>• You'll receive updates via SMS</li>
                <li>• Stay at a safe location</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/report')}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="lg"
          >
            Report Another Emergency
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
