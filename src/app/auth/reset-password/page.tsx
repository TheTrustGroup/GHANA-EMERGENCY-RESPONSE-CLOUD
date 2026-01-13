'use client';

/**
 * Reset Password Page
 * Reset password with token
 */

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchedPassword = watch('password');

  useEffect(() => {
    // Validate token on mount
    if (!token) {
      setError('Invalid or missing reset token');
      setIsValidating(false);
      return;
    }

    fetch(`/api/auth/verify-reset-token?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.valid) {
          setError('Invalid or expired reset token');
        }
        setIsValidating(false);
      })
      .catch(() => {
        setError('Failed to validate token');
        setIsValidating(false);
      });
  }, [token]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      );
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">Validating token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been reset successfully. Redirecting to sign in...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">
              Invalid Reset Link
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/forgot-password">Request New Reset Link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-blue-900">
            Reset Password
          </CardTitle>
          <CardDescription className="text-base">
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
              {watchedPassword && (
                <div className="text-xs text-muted-foreground">
                  Password must be at least 8 characters with uppercase, lowercase, and number
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center text-sm">
              <Link
                href="/auth/signin"
                className="text-blue-600 hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
