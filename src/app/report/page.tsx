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
  Map,
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
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<EmergencyFormData>(() => {
    // Load from localStorage on mount
    const saved = loadFromLocalStorage('emergency-report') as EmergencyFormData | null;
    const defaultData: EmergencyFormData = {
      category: null,
      latitude: null,
      longitude: null,
      address: null,
      mediaFiles: [],
      description: '',
    };
    return saved || defaultData;
  });

  // Auto-save to localStorage every 5 seconds
  useEffect(() => {
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
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get address (simplified - would use actual geocoding service)
      const address = await reverseGeocode(latitude, longitude);

      setFormData((prev) => ({
        ...prev,
        latitude,
        longitude,
        address,
      }));

      toast({
        title: 'Location captured',
        description: 'Your location has been automatically detected',
      });
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: 'Location not available',
        description: 'Please set your location manually on the map',
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
      // Clear localStorage
      localStorage.removeItem('emergency-report');
      
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
      const severity = formData.category === 'fire' || formData.category === 'medical' 
        ? 'HIGH' 
        : 'MEDIUM';

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
      <header className="sticky top-0 bg-red-600 text-white p-4 shadow-lg z-50">
        <h1 className="text-2xl font-bold text-center">Report Emergency</h1>
      </header>

      {/* Form - One thing at a time */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-8">
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
              <h2 className="text-xl font-bold mb-6">What's happening?</h2>

              {/* Big, clear category buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleCategorySelect('fire')}
                  className={`flex flex-col items-center gap-3 p-6 border-2 rounded-lg transition-all ${
                    formData.category === 'fire'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-red-600 hover:bg-red-50'
                  }`}
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Flame className="w-8 h-8 text-red-600" />
                  </div>
                  <span className="font-semibold text-lg">Fire</span>
                </button>

                <button
                  onClick={() => handleCategorySelect('medical')}
                  className={`flex flex-col items-center gap-3 p-6 border-2 rounded-lg transition-all ${
                    formData.category === 'medical'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className="font-semibold text-lg">Medical</span>
                </button>

                <button
                  onClick={() => handleCategorySelect('accident')}
                  className={`flex flex-col items-center gap-3 p-6 border-2 rounded-lg transition-all ${
                    formData.category === 'accident'
                      ? 'border-yellow-600 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-600 hover:bg-yellow-50'
                  }`}
                >
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Car className="w-8 h-8 text-yellow-600" />
                  </div>
                  <span className="font-semibold text-lg">Accident</span>
                </button>

                <button
                  onClick={() => handleCategorySelect('other')}
                  className={`flex flex-col items-center gap-3 p-6 border-2 rounded-lg transition-all ${
                    formData.category === 'other'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-purple-600" />
                  </div>
                  <span className="font-semibold text-lg">Other</span>
                </button>
              </div>

              {formData.category && (
                <Button
                  onClick={() => setStep(2)}
                  className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white"
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
              <h2 className="text-xl font-bold mb-6">Where is it?</h2>

              {/* Big "Use My Location" button */}
              <Button
                onClick={captureLocation}
                disabled={locationLoading}
                className="w-full p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg mb-4 flex items-center justify-center gap-3"
                size="lg"
              >
                {locationLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <MapPin className="w-6 h-6" />
                    Use My Current Location
                  </>
                )}
              </Button>

              <div className="text-center text-gray-500 text-sm mb-4">or</div>

              {/* Map - Click to set location */}
              <div
                ref={mapContainerRef}
                className="h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all"
                onClick={() => {
                  // In production, this would open a map picker
                  toast({
                    title: 'Map picker',
                    description: 'Tap on the map to set location (coming soon)',
                  });
                }}
              >
                <div className="text-center">
                  <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Tap map to set location</p>
                </div>
              </div>

              {/* Address preview (when location set) */}
              {formData.latitude && formData.longitude && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">Location Set</p>
                      <p className="text-sm text-green-700">{formData.address || 'Location captured'}</p>
                      <p className="text-xs text-green-600 mt-1">
                        Lat: {formData.latitude.toFixed(4)}, Lon: {formData.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  ← Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.latitude || !formData.longitude}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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
              <h2 className="text-xl font-bold mb-6">Add Photos or Videos (Optional)</h2>

              {/* Upload zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">Take Photo or Upload</p>
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
                    <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  ← Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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
              <h2 className="text-xl font-bold mb-6">Tell us more (Optional)</h2>

              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe what's happening... (e.g., 'Large fire on second floor', '3 cars involved', etc.)"
                className="w-full h-32 p-4 border-2 rounded-lg text-lg resize-none focus:border-blue-500 focus:outline-none"
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-2 text-right">
                {formData.description.length}/500
              </p>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  ← Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceed()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
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
              className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <AlertCircle className="w-8 h-8" />
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
