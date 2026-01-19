'use client';

/**
 * Registration Page
 * Multi-step registration form for new users
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EnhancedInput } from '@/components/forms/EnhancedInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@prisma/client';

// Password strength indicator component
function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[a-z]/)) strength++;
    if (pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/[0-9]/)) strength++;
    if (pwd.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${i < strength ? colors[strength - 1] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: {labels[strength - 1] || 'Very Weak'}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<Array<{ id: string; name: string }>>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    trigger,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      role: UserRole.CITIZEN,
      termsAccepted: false,
    },
    mode: 'onChange',
  });

  const watchedRole = watch('role');
  const watchedPassword = watch('password');

  // Fetch agencies when RESPONDER role is selected
  useEffect(() => {
    if (watchedRole === UserRole.RESPONDER && agencies.length === 0) {
      fetch('/api/agencies')
        .then((res) => res.json())
        .then((data) => {
          if (data.agencies) {
            setAgencies(data.agencies);
          }
        })
        .catch(() => {
          // Handle error silently or show message
        });
    }
  }, [watchedRole, agencies.length]);

  const validateStep = async (currentStep: number) => {
    let fieldsToValidate: (keyof RegisterInput)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['name', 'email', 'phone', 'password', 'confirmPassword'];
        break;
      case 2:
        fieldsToValidate = ['role'];
        if (watchedRole === UserRole.RESPONDER) {
          fieldsToValidate.push('agencyId');
        }
        break;
      case 3:
        fieldsToValidate = ['termsAccepted'];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateStep(step);
    if (isValid && step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate terms acceptance before submitting
      if (!data.termsAccepted) {
        setError('You must accept the terms of service to continue.');
        setIsLoading(false);
        return;
      }

      // Create user account (password will be hashed on server)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email && data.email.trim() ? data.email.toLowerCase().trim() : undefined,
          phone: data.phone,
          password: data.password,
          role: data.role,
          agencyId: data.agencyId || undefined,
          termsAccepted: data.termsAccepted, // Include terms acceptance
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Show detailed validation errors if available
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details
            .map((err: any) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
          throw new Error(errorMessages || result.error || 'Registration failed');
        }
        throw new Error(result.error || 'Registration failed');
      }

      // Redirect based on role
      if (data.role === UserRole.RESPONDER) {
        // Pending approval
        router.push('/auth/register/pending');
      } else {
        // Immediate activation for citizens
        router.push('/auth/register/success');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-blue-900">Create Account</CardTitle>
          <CardDescription className="text-base">
            Register for the Ghana Emergency Response Platform
          </CardDescription>
          <div className="flex justify-center gap-2 pt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded ${s <= step ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <EnhancedInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  required
                  error={errors.name?.message}
                  {...register('name')}
                />

                <EnhancedInput
                  label="Email Address"
                  type="email"
                  placeholder="email@example.com"
                  error={errors.email?.message}
                  helpText="Optional - used for account recovery"
                  {...register('email')}
                />

                <EnhancedInput
                  label="Phone Number"
                  type="tel"
                  placeholder="+233XXXXXXXXX or 024XXXXXXXX"
                  required
                  error={errors.phone?.message}
                  helpText="Enter your phone number with country code (+233) or local format (0XX)"
                  {...register('phone')}
                />

                <div className="space-y-2">
                  <EnhancedInput
                    label="Password"
                    type="password"
                    placeholder="Create a strong password"
                    required
                    showPasswordToggle
                    error={errors.password?.message}
                    helpText="Must be at least 8 characters with uppercase, lowercase, and number"
                    {...register('password')}
                  />
                  <PasswordStrength password={watchedPassword || ''} />
                </div>

                <EnhancedInput
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  showPasswordToggle
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>
            )}

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <Select
                    value={watchedRole}
                    onValueChange={(value) => {
                      setValue('role', value as UserRole);
                      if (value !== UserRole.RESPONDER) {
                        setValue('agencyId', undefined);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.CITIZEN}>Citizen - Report emergencies</SelectItem>
                      <SelectItem value={UserRole.RESPONDER}>
                        Responder - Join emergency response team
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                </div>

                {watchedRole === UserRole.RESPONDER && (
                  <div className="space-y-2">
                    <Label htmlFor="agencyId">Select Agency</Label>
                    <Select onValueChange={(value) => setValue('agencyId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your agency" />
                      </SelectTrigger>
                      <SelectContent>
                        {agencies.map((agency) => (
                          <SelectItem key={agency.id} value={agency.id}>
                            {agency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.agencyId && (
                      <p className="text-sm text-destructive">{errors.agencyId.message}</p>
                    )}
                    {agencies.length === 0 && (
                      <p className="text-sm text-muted-foreground">Loading agencies...</p>
                    )}
                  </div>
                )}

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {watchedRole === UserRole.RESPONDER
                      ? 'Responder accounts require admin approval before activation.'
                      : 'Citizen accounts are activated immediately after email verification.'}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 3: Terms and Verification */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Controller
                      name="termsAccepted"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="termsAccepted"
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked === true);
                            // Trigger validation immediately
                            trigger('termsAccepted');
                          }}
                          className="mt-1"
                        />
                      )}
                    />
                    <Label
                      htmlFor="termsAccepted"
                      className="cursor-pointer text-sm font-normal leading-relaxed"
                      onClick={() => {
                        const currentValue = watch('termsAccepted');
                        setValue('termsAccepted', !currentValue, { shouldValidate: true });
                      }}
                    >
                      I agree to the{' '}
                      <Link
                        href="/terms"
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {errors.termsAccepted && (
                    <p className="text-sm text-destructive">{errors.termsAccepted.message}</p>
                  )}
                </div>

                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    By registering, you agree to receive important emergency notifications via SMS
                    and email.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              )}
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/auth/signin" className="font-medium text-blue-600 hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
