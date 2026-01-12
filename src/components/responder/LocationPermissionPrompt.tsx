'use client';

/**
 * LocationPermissionPrompt Component
 * Friendly prompt for location permission
 */

import { useState } from 'react';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LocationPermissionPromptProps {
  onRequestPermission: () => Promise<boolean>;
  onContinueWithout?: () => void;
  error?: string | null;
}

export function LocationPermissionPrompt({
  onRequestPermission,
  onContinueWithout,
  error,
}: LocationPermissionPromptProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequest = async () => {
    setIsRequesting(true);
    await onRequestPermission();
    setIsRequesting(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Location Access Needed</CardTitle>
            <CardDescription>
              We need your location to track your response and calculate arrival times
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permission Denied</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>To enable location tracking:</p>
          <ol className="ml-4 list-decimal space-y-1">
            <li>Click &quot;Allow&quot; when your browser asks for permission</li>
            <li>Or enable location in your browser settings</li>
            <li>Make sure location services are enabled on your device</li>
          </ol>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleRequest} disabled={isRequesting} className="flex-1">
            {isRequesting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Allow Location
              </>
            )}
          </Button>
          {onContinueWithout && (
            <Button variant="outline" onClick={onContinueWithout}>
              Continue Without
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

