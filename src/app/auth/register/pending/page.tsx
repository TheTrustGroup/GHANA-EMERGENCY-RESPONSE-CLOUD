/**
 * Registration Pending Page
 * Shown after responder registration (requires admin approval)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, Shield } from 'lucide-react';
import Link from 'next/link';

export default function RegistrationPendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-600">
            Registration Pending
          </CardTitle>
          <CardDescription>
            Your responder account is awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Admin Approval Required
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Responder accounts require approval from an agency administrator.
                  Your account will be activated once approved.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Check Your Email
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  We&apos;ve sent a confirmation email. Please verify your email address
                  while waiting for approval.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>An agency administrator will review your application</li>
                <li>You&apos;ll receive an email when your account is approved</li>
                <li>Once approved, you can sign in and start responding to emergencies</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/resend-verification">
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Questions?{' '}
              <Link href="/support" className="text-blue-600 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

