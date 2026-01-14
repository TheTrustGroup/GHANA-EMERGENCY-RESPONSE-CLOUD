'use client';

/**
 * Sign In Page
 * Authentication page with email/phone login
 */

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usePhone, setUsePhone] = useState(true); // Default to phone for Ghana users

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Normalize identifier - lowercase email, keep phone as-is (server will format it)
      let identifier = data.identifier.trim();

      // Only lowercase if it's an email (contains @)
      if (!usePhone && identifier.includes('@')) {
        identifier = identifier.toLowerCase();
      }

      const result = await signIn('credentials', {
        identifier,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          result.error === 'CredentialsSignin' ? 'Invalid email/phone or password' : result.error
        );
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Wait a bit for session to be set
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get user role from session to determine redirect
        try {
          const response = await fetch('/api/auth/session');
          const session = await response.json();

          // Redirect based on role
          const role = session?.user?.role;
          let redirectPath = '/dashboard';

          switch (role) {
            case 'SYSTEM_ADMIN':
              redirectPath = '/dashboard/admin';
              break;
            case 'AGENCY_ADMIN':
              redirectPath = '/dashboard/agency';
              break;
            case 'DISPATCHER':
              redirectPath = '/dashboard/dispatch';
              break;
            case 'RESPONDER':
              redirectPath = '/dashboard/responder';
              break;
            case 'CITIZEN':
              redirectPath = '/dashboard/citizen';
              break;
            default:
              redirectPath = '/dashboard';
          }

          // Check for callback URL
          const callbackUrl = searchParams.get('callbackUrl');
          const finalPath = callbackUrl || redirectPath;

          // Use window.location for more reliable redirect
          window.location.href = finalPath;
        } catch (sessionError) {
          console.error('Session fetch error:', sessionError);
          // Fallback redirect
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6">
      <Card className="premium-shadow w-full max-w-md">
        <CardHeader className="space-y-2 px-4 pt-6 text-center sm:px-6 sm:pt-8">
          <CardTitle className="text-2xl font-bold leading-tight text-blue-900 sm:text-3xl md:text-4xl">
            Ghana Emergency Response
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-6 sm:px-6 sm:pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Label htmlFor="identifier" className="text-sm sm:text-base">
                  {usePhone ? 'Phone Number' : 'Email'}
                </Label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setUsePhone(!usePhone);
                  }}
                  className="text-left text-xs font-medium text-blue-600 underline hover:text-blue-700 active:text-blue-800 sm:text-right sm:text-sm"
                >
                  Use {usePhone ? 'Email' : 'Phone'} instead
                </button>
              </div>
              <Input
                id="identifier"
                type={usePhone ? 'tel' : 'email'}
                placeholder={usePhone ? '+233501234567 or 0501234567' : 'email@example.com'}
                className="text-sm sm:text-base"
                {...register('identifier')}
                disabled={isLoading}
                autoComplete={usePhone ? 'tel' : 'email'}
                inputMode={usePhone ? 'tel' : 'email'}
              />
              {usePhone && (
                <p className="text-xs text-gray-500 sm:text-sm">
                  Enter your phone number with country code (+233) or local format (0XX)
                </p>
              )}
              {errors.identifier && (
                <p className="text-xs text-destructive sm:text-sm">{errors.identifier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Label htmlFor="password" className="text-sm sm:text-base">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-left text-xs text-blue-600 hover:underline sm:text-right sm:text-sm"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="text-sm sm:text-base"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-xs text-destructive sm:text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" {...register('rememberMe')} disabled={isLoading} />
              <Label htmlFor="rememberMe" className="cursor-pointer text-xs font-normal sm:text-sm">
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full py-2 text-sm sm:py-2.5 sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center text-xs sm:text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/auth/register" className="font-medium text-blue-600 hover:underline">
                Register here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
