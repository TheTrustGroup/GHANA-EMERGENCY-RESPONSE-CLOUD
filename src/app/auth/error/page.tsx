/**
 * Authentication Error Page
 * Displays authentication errors with specific messages
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, XCircle, Mail, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error;

  const errorMessages: Record<string, { title: string; message: string; icon: typeof AlertCircle }> = {
    Configuration: {
      title: 'Configuration Error',
      message: 'There is a problem with the server configuration. Please contact support.',
      icon: XCircle,
    },
    AccessDenied: {
      title: 'Access Denied',
      message: 'You do not have permission to sign in. Your account may be inactive or suspended.',
      icon: Shield,
    },
    Verification: {
      title: 'Verification Error',
      message: 'The verification token has expired or has already been used. Please request a new verification email.',
      icon: Mail,
    },
    CredentialsSignin: {
      title: 'Invalid Credentials',
      message: 'The email/phone or password you entered is incorrect. Please try again.',
      icon: AlertCircle,
    },
    Default: {
      title: 'Authentication Error',
      message: 'An error occurred during authentication. Please try again or contact support if the problem persists.',
      icon: AlertCircle,
    },
  };

  const errorInfo =
    error && error in errorMessages
      ? errorMessages[error]
      : errorMessages.Default;

  const Icon = errorInfo.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Icon className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            {errorInfo.title}
          </CardTitle>
          <CardDescription>{errorInfo.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error === 'AccessDenied' && (
                <div className="space-y-2">
                  <p>Possible reasons:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Your account is inactive</li>
                    <li>Your email is not verified</li>
                    <li>Your account has been suspended</li>
                  </ul>
                </div>
              )}
              {error === 'Verification' && (
                <p className="text-sm">
                  Check your email for a new verification link or contact support for assistance.
                </p>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/auth/signin">Try Signing In Again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Need help?{' '}
            <Link href="/support" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

