'use client';

/**
 * IncidentForm Component
 * Multi-step form for creating/editing incidents
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedInput } from '@/components/forms/EnhancedInput';
import { EnhancedTextarea } from '@/components/forms/EnhancedTextarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CategorySelector, type IncidentCategory } from './CategorySelector';
import Image from 'next/image';
import { SeveritySelector } from './SeveritySelector';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { MediaUploader } from './MediaUploader';
import {
  incidentFormSchema,
  type IncidentFormData,
} from '@/lib/validations/incident-form';
import { IncidentSeverity } from '@prisma/client';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { CSRFTokenInput } from '@/components/forms/CSRFTokenInput';

interface IncidentFormProps {
  initialData?: Partial<IncidentFormData>;
  onSubmit?: (data: IncidentFormData) => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: 1, title: 'Incident Type' },
  { id: 2, title: 'Location' },
  { id: 3, title: 'Details' },
  { id: 4, title: 'Contact' },
  { id: 5, title: 'Review' },
];

export function IncidentForm({ initialData, onSubmit, onCancel }: IncidentFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentFormSchema) as any,
    defaultValues: {
      category: initialData?.category || 'other',
      severity: initialData?.severity || IncidentSeverity.MEDIUM,
      latitude: initialData?.latitude || 5.6037, // Accra default
      longitude: initialData?.longitude || -0.187,
      address: initialData?.address || '',
      region: initialData?.region || '',
      district: initialData?.district || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      estimatedAffectedPeople: initialData?.estimatedAffectedPeople,
      mediaUrls: initialData?.mediaUrls || [],
      phone: initialData?.phone || session?.user?.email || '',
      alternativeContact: initialData?.alternativeContact || '',
      anonymous: initialData?.anonymous || false,
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = form;

  const createIncident = trpc.incidents.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Incident reported',
        description: 'Your incident has been successfully reported.',
      });
      router.push(`/dashboard/incidents/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create incident',
        variant: 'destructive',
      });
    },
  });

  // Auto-save to localStorage
  useEffect(() => {
    const subscription = watch((value) => {
      const timer = setTimeout(() => {
        localStorage.setItem('incident-form-draft', JSON.stringify(value));
      }, 30000); // Save every 30 seconds
      return () => clearTimeout(timer);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Restore draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('incident-form-draft');
    if (draft && !initialData) {
      try {
        const parsed = JSON.parse(draft);
        Object.keys(parsed).forEach((key) => {
          if (parsed[key] !== undefined) {
            setValue(key as keyof IncidentFormData, parsed[key]);
          }
        });
      } catch (error) {
        console.error('Failed to restore draft:', error);
      }
    }
  }, [initialData, setValue]);

  const watchedValues = watch();

  const handleNext = async () => {
    let isValidStep = false;

    switch (currentStep) {
      case 1:
        isValidStep = await trigger(['category', 'severity']);
        break;
      case 2:
        isValidStep = await trigger(['latitude', 'longitude', 'region', 'district']);
        break;
      case 3:
        isValidStep = await trigger(['title', 'description']);
        break;
      case 4:
        // Contact step is optional for non-citizens
        isValidStep = true;
        break;
      default:
        isValidStep = true;
    }

    if (isValidStep && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmitForm = handleSubmit((data: IncidentFormData) => {
    if (onSubmit) {
      onSubmit(data as IncidentFormData);
    } else {
      // Convert form data to API format
      const formData = data as IncidentFormData;

      // Map lowercase category to uppercase enum
      const categoryMap: Record<string, 'FIRE' | 'MEDICAL' | 'ACCIDENT' | 'NATURAL_DISASTER' | 'CRIME' | 'INFRASTRUCTURE' | 'OTHER'> = {
        'fire': 'FIRE',
        'medical': 'MEDICAL',
        'accident': 'ACCIDENT',
        'natural_disaster': 'NATURAL_DISASTER',
        'crime': 'CRIME',
        'infrastructure': 'INFRASTRUCTURE',
        'other': 'OTHER',
      };

      const apiData = {
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        category: categoryMap[formData.category] || 'OTHER',
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        region: formData.region,
        district: formData.district,
        mediaUrls: formData.mediaUrls,
        estimatedAffectedPeople: formData.estimatedAffectedPeople,
      };

      createIncident.mutate(apiData);
    }

    // Clear draft
    localStorage.removeItem('incident-form-draft');
  });

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <form onSubmit={onSubmitForm} className="space-y-6">
      {/* CSRF Token */}
      <CSRFTokenInput />

      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Step {currentStep} of {STEPS.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
        <div className="flex justify-between text-xs text-muted-foreground">
          {STEPS.map((step) => (
            <span
              key={step.id}
              className={step.id <= currentStep ? 'font-medium text-foreground' : ''}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-6">
        {/* Step 1: Incident Type */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <Label className="mb-4 block text-lg font-semibold">Select Category</Label>
              <CategorySelector
                value={watchedValues.category as IncidentCategory}
                onChange={(category) => setValue('category', category)}
              />
              {errors.category && (
                <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-4 block text-lg font-semibold">Select Severity</Label>
              <SeveritySelector
                value={watchedValues.severity}
                onChange={(severity) => setValue('severity', severity)}
              />
              {errors.severity && (
                <p className="mt-2 text-sm text-red-600">{errors.severity.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <Label className="block text-lg font-semibold">Select Location</Label>
            <LocationPicker
              latitude={watchedValues.latitude}
              longitude={watchedValues.longitude}
              address={watchedValues.address}
              region={watchedValues.region}
              district={watchedValues.district}
              onLocationChange={(location) => {
                setValue('latitude', location.latitude);
                setValue('longitude', location.longitude);
                setValue('address', location.address);
                setValue('region', location.region || '');
                setValue('district', location.district || '');
              }}
              showAgencies
            />
            {errors.latitude && (
              <p className="text-sm text-red-600">{errors.latitude.message}</p>
            )}
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <EnhancedInput
              label="Title"
              placeholder="Brief description of the incident"
              required
              maxLength={100}
              error={errors.title?.message}
              helpText={`${watchedValues.title?.length || 0}/100 characters`}
              {...register('title')}
            />

            <EnhancedTextarea
              label="Description"
              placeholder="Provide detailed information about the incident..."
              required
              rows={6}
              maxLength={1000}
              showCharCount
              error={errors.description?.message}
              {...register('description')}
            />

            <EnhancedInput
              label="Estimated Affected People"
              type="number"
              placeholder="0"
              min={1}
              helpText="Optional - approximate number of people affected"
              {...register('estimatedAffectedPeople', { valueAsNumber: true })}
            />

            <div>
              <Label>Media (Photos/Videos)</Label>
              <MediaUploader
                value={watchedValues.mediaUrls || []}
                onChange={(urls) => setValue('mediaUrls', urls)}
              />
            </div>
          </div>
        )}

        {/* Step 4: Contact (for CITIZEN role) */}
        {currentStep === 4 && session?.user?.role === 'CITIZEN' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+233XXXXXXXXX"
                defaultValue={session.user.email}
              />
            </div>

            <div>
              <Label htmlFor="alternativeContact">Alternative Contact (Optional)</Label>
              <Input
                id="alternativeContact"
                {...register('alternativeContact')}
                placeholder="Alternative phone or email"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={watchedValues.anonymous}
                onCheckedChange={(checked) => setValue('anonymous', checked === true)}
              />
              <Label htmlFor="anonymous" className="cursor-pointer">
                I want to remain anonymous
              </Label>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold">Review Your Report</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Category & Severity</h4>
                  <p className="text-sm text-muted-foreground">
                    {watchedValues.category} - {watchedValues.severity}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                  >
                    Edit
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium">Location</h4>
                  <p className="text-sm text-muted-foreground">{watchedValues.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {watchedValues.region}, {watchedValues.district}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                  >
                    Edit
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium">Details</h4>
                  <p className="text-sm font-medium">{watchedValues.title}</p>
                  <p className="text-sm text-muted-foreground">{watchedValues.description}</p>
                  {watchedValues.estimatedAffectedPeople && (
                    <p className="text-sm text-muted-foreground">
                      Affected: {watchedValues.estimatedAffectedPeople} people
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                  >
                    Edit
                  </Button>
                </div>

                {watchedValues.mediaUrls && watchedValues.mediaUrls.length > 0 && (
                  <div>
                    <h4 className="font-medium">Media ({watchedValues.mediaUrls.length})</h4>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {watchedValues.mediaUrls.map((url) => (
                        <Image
                          key={url}
                          src={url}
                          alt="Media"
                          width={80}
                          height={80}
                          className="h-20 w-full rounded object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          {currentStep < STEPS.length ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={createIncident.isPending}>
              {createIncident.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

