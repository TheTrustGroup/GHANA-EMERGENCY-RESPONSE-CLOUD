/**
 * Registration Success Page
 * Shown after successful citizen registration
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail } from 'lucide-react';
import Link from 'next/link';

export default function RegistrationSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Registration Successful
          </CardTitle>
          <CardDescription>
            Your account has been created successfully!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Verify Your Email
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  We&apos;ve sent a verification email to your inbox. Please check your email
                  and click the verification link to activate your account.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/resend-verification">
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <Link href="/auth/resend-verification" className="text-blue-600 hover:underline">
                request a new one
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

