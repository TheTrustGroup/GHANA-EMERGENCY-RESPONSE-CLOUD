'use client';

/**
 * SIMPLE Emergency Reporting Page
 * Ultra-minimal, mobile-first, ZERO distractions
 * Core Philosophy: Simplicity saves lives
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Flame,
  Heart,
  Car,
  AlertTriangle,
  MapPin,
  Camera,
  CheckCircle,
  X,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloud } from '@/lib/upload-simple';
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/offline-storage';
import { IncidentCategory } from '@prisma/client';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { getRobustLocation } from '@/lib/geolocation/robust-geolocation';

type Step = 1 | 2 | 3 | 4;
type Category = 'fire' | 'medical' | 'accident' | 'other' | null;

interface EmergencyFormData {
  category: Category | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  mediaFiles: File[];
  description: string;
}

export default function ReportEmergency() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default location: Accra, Ghana
  const [mapLatitude, setMapLatitude] = useState(5.6037);
  const [mapLongitude, setMapLongitude] = useState(-0.187);

  // Form state
  const [formData, setFormData] = useState<EmergencyFormData>(() => {
    // Initialize with default data (localStorage will be loaded in useEffect)
    const defaultData: EmergencyFormData = {
      category: null,
      latitude: null,
      longitude: null,
      address: null,
      mediaFiles: [],
      description: '',
    };
    return defaultData;
  });

  // Load from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = loadFromLocalStorage('emergency-report') as EmergencyFormData | null;
      if (saved) {
        setFormData(saved);
      }
    }
  }, []);

  // Auto-save to localStorage every 5 seconds (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      saveToLocalStorage('emergency-report', formData);
    }, 5000);
    return () => clearInterval(interval);
  }, [formData]);

  // Auto-capture GPS on page load
  useEffect(() => {
    if (!formData.latitude || !formData.longitude) {
      captureLocation();
    }
  }, []);

  const captureLocation = async () => {
    setLocationLoading(true);
    try {
      // Use robust geolocation with multiple fallback strategies
      const location = await getRobustLocation({
        enableHighAccuracy: true,
        timeout: 20000, // 20 seconds
        maximumAge: 300000, // 5 minutes - allow cached
        retries: 3, // Retry 3 times
        retryDelay: 1000, // 1 second between retries
      });

      const { latitude, longitude } = location;

      // Reverse geocode to get address
      const address = await reverseGeocode(latitude, longitude);

      setFormData((prev) => ({
        ...prev,
        latitude,
        longitude,
        address,
      }));

      // Show success message with source info
      const sourceMessages = {
        gps: 'Your location has been detected via GPS',
        network: 'Your location has been detected via network',
        cached: 'Using your last known location',
        ip: 'Your approximate location has been detected',
      };

      toast({
        title: 'Location captured',
        description: sourceMessages[location.source] || 'Your location has been detected',
      });
    } catch (error: any) {
      console.error('Location error:', error);

      // Provide helpful error messages
      let errorMessage = 'Please set your location manually on the map';
      if (error?.message?.includes('permission')) {
        errorMessage =
          'Location permission denied. Please enable location access or click on the map to set location.';
      } else if (error?.message?.includes('unavailable')) {
        errorMessage = 'Location unavailable. Please click on the map to set your location.';
      } else if (error?.message?.includes('timeout')) {
        errorMessage = 'Location request timed out. Please click on the map to set your location.';
      }

      toast({
        title: 'Location not available',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    // Simplified - in production, use Mapbox Geocoding API
    return `Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  };

  const handleCategorySelect = (category: Category) => {
    setFormData((prev) => ({ ...prev, category }));
    setStep(2);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast({
        title: 'Too many files',
        description: 'Maximum 5 files allowed',
        variant: 'destructive',
      });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...files].slice(0, 5),
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
    }));
  };

  const createIncident = trpc.incidents.create.useMutation({
    onSuccess: (data) => {
      // Clear localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('emergency-report');
      }

      // Show success and redirect
      toast({
        title: 'Emergency reported',
        description: `Report #${data.id.slice(-6)} has been sent to emergency services`,
      });

      router.push(`/report/success?id=${data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    if (!formData.category || !formData.latitude || !formData.longitude) {
      toast({
        title: 'Missing information',
        description: 'Please complete all required steps',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload media files
      const mediaUrls: string[] = [];
      for (const file of formData.mediaFiles) {
        const url = await uploadToCloud(file);
        mediaUrls.push(url);
      }

      // Determine severity based on category
      const severity =
        formData.category === 'fire' || formData.category === 'medical' ? 'HIGH' : 'MEDIUM';

      // Map lowercase category to uppercase enum
      let category: IncidentCategory = IncidentCategory.OTHER;
      if (formData.category === 'fire') {
        category = IncidentCategory.FIRE;
      } else if (formData.category === 'medical') {
        category = IncidentCategory.MEDICAL;
      } else if (formData.category === 'accident') {
        category = IncidentCategory.ACCIDENT;
      } else {
        category = IncidentCategory.OTHER;
      }

      // Create incident
      const incidentData = {
        title: `${formData.category?.charAt(0).toUpperCase() + formData.category?.slice(1)} Emergency`,
        description: formData.description || 'Emergency reported via mobile app',
        category: category as IncidentCategory,
        severity,
        latitude: formData.latitude!,
        longitude: formData.longitude!,
        address: formData.address || undefined,
        region: 'Greater Accra', // Would be determined from coordinates
        district: 'Accra Metropolitan', // Would be determined from coordinates
        mediaUrls,
      };

      await createIncident.mutateAsync(incidentData as any);
    } catch (error) {
      console.error('Submit error:', error);
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.category !== null;
      case 2:
        return formData.latitude !== null && formData.longitude !== null;
      case 3:
        return true; // Optional
      case 4:
        return true; // Optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Simple */}
      <header className="sticky top-0 z-50 bg-red-600 p-4 text-white shadow-lg">
        <h1 className="text-center text-2xl font-bold">Report Emergency</h1>
      </header>

      {/* Form - One thing at a time */}
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        {/* Step Indicator */}
        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-all ${
                s === step ? 'bg-red-600' : s < step ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: What's the emergency? */}
        {step === 1 && (
          <Card className="border-2 shadow-lg">
            <CardContent className="p-8">
              <h2 className="mb-6 text-xl font-bold">What's happening?</h2>

              {/* Big, clear category buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleCategorySelect('fire')}
                  className={`flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all ${
                    formData.category === 'fire'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-red-600 hover:bg-red-50'
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <Flame className="h-8 w-8 text-red-600" />
                  </div>
                  <span className="text-lg font-semibold">Fire</span>
                </button>

                <button
                  onClick={() => handleCategorySelect('medical')}
                  className={`flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all ${
                    formData.category === 'medical'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Heart className="h-8 w-8 text-blue-600" />
                  </div>
                  <span className="text-lg font-semibold">Medical</span>
                </button>

                <button
                  onClick={() => handleCategorySelect('accident')}
                  className={`flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all ${
                    formData.category === 'accident'
                      ? 'border-yellow-600 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-600 hover:bg-yellow-50'
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                    <Car className="h-8 w-8 text-yellow-600" />
                  </div>
                  <span className="text-lg font-semibold">Accident</span>
                </button>

                <button
                  onClick={() => handleCategorySelect('other')}
                  className={`flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all ${
                    formData.category === 'other'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <AlertTriangle className="h-8 w-8 text-purple-600" />
                  </div>
                  <span className="text-lg font-semibold">Other</span>
                </button>
              </div>

              {formData.category && (
                <Button
                  onClick={() => setStep(2)}
                  className="mt-6 w-full bg-red-600 text-white hover:bg-red-700"
                  size="lg"
                >
                  Continue →
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Where? */}
        {step === 2 && (
          <Card className="border-2 shadow-lg">
            <CardContent className="p-8">
              <h2 className="mb-6 text-xl font-bold">Where is it?</h2>

              {/* Big "Use My Location" button */}
              <Button
                onClick={captureLocation}
                disabled={locationLoading}
                className="mb-4 flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 p-6 text-lg font-semibold text-white hover:bg-blue-700"
                size="lg"
              >
                {locationLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-6 w-6" />
                    Use My Current Location
                  </>
                )}
              </Button>

              <div className="mb-4 text-center text-sm text-gray-500">or</div>

              {/* Map - Interactive Location Picker */}
              <div className="h-96 overflow-hidden rounded-lg border-2 border-gray-200">
                <LocationPicker
                  latitude={formData.latitude || mapLatitude}
                  longitude={formData.longitude || mapLongitude}
                  address={formData.address || undefined}
                  onLocationChange={(location) => {
                    setFormData({
                      ...formData,
                      latitude: location.latitude,
                      longitude: location.longitude,
                      address: location.address || null,
                    });
                    setMapLatitude(location.latitude);
                    setMapLongitude(location.longitude);
                  }}
                />
              </div>

              {/* Address preview (when location set) */}
              {formData.latitude && formData.longitude && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">Location Set</p>
                      <p className="text-sm text-green-700">
                        {formData.address || 'Location captured'}
                      </p>
                      <p className="mt-1 text-xs text-green-600">
                        Lat: {formData.latitude.toFixed(4)}, Lon: {formData.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1" size="lg">
                  ← Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.latitude || !formData.longitude}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  size="lg"
                >
                  Continue →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Photos/Videos */}
        {step === 3 && (
          <Card className="border-2 shadow-lg">
            <CardContent className="p-8">
              <h2 className="mb-6 text-xl font-bold">Add Photos or Videos (Optional)</h2>

              {/* Upload zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-all hover:border-blue-500 hover:bg-blue-50"
              >
                <Camera className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <p className="mb-2 text-lg font-semibold text-gray-700">Take Photo or Upload</p>
                <p className="text-sm text-gray-500">Max 5 files • Photos or Videos</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Preview thumbnails (when files uploaded) */}
              {formData.mediaFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {formData.mediaFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                    >
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white transition-colors hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1" size="lg">
                  ← Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  size="lg"
                >
                  Continue →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Details */}
        {step === 4 && (
          <Card className="border-2 shadow-lg">
            <CardContent className="p-8">
              <h2 className="mb-6 text-xl font-bold">Tell us more (Optional)</h2>

              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what's happening... (e.g., 'Large fire on second floor', '3 cars involved', etc.)"
                className="h-32 w-full resize-none rounded-lg border-2 p-4 text-lg focus:border-blue-500 focus:outline-none"
                maxLength={500}
              />
              <p className="mt-2 text-right text-sm text-gray-500">
                {formData.description.length}/500
              </p>

              <div className="mt-6 flex gap-3">
                <Button onClick={() => setStep(3)} variant="outline" className="flex-1" size="lg">
                  ← Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceed()}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SUBMIT - Big, unmissable (shown on step 4) */}
        {step === 4 && (
          <>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-red-600 py-6 text-xl font-bold text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-xl"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <AlertCircle className="h-8 w-8" />
                  SUBMIT EMERGENCY REPORT
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Your report will be sent to emergency services immediately
            </p>
          </>
        )}
      </div>
    </div>
  );
}
