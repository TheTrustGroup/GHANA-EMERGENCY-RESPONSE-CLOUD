/**
 * Robust Geolocation Service
 * Multiple fallback strategies to ensure GPS rarely fails
 */

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  retries?: number;
  retryDelay?: number;
}

interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  source: 'gps' | 'network' | 'cached' | 'ip';
  timestamp: number;
}

const DEFAULT_OPTIONS: Required<GeolocationOptions> = {
  enableHighAccuracy: true,
  timeout: 20000, // 20 seconds
  maximumAge: 300000, // 5 minutes - allow cached
  retries: 3,
  retryDelay: 1000, // 1 second between retries
};

/**
 * Get current position with multiple fallback strategies
 */
export async function getRobustLocation(
  options: GeolocationOptions = {}
): Promise<GeolocationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Strategy 1: Try high-accuracy GPS with retries
  try {
    return await getLocationWithRetry({
      ...opts,
      enableHighAccuracy: true,
    });
  } catch (error) {
    console.warn('High-accuracy GPS failed, trying network-based location...', error);
  }

  // Strategy 2: Try network-based location (less accurate but faster)
  try {
    return await getLocationWithRetry({
      ...opts,
      enableHighAccuracy: false, // Network-based, not GPS
      timeout: 10000, // Shorter timeout for network
    });
  } catch (error) {
    console.warn('Network-based location failed, trying cached location...', error);
  }

  // Strategy 3: Try with longer timeout and cached data
  try {
    return await getLocationWithRetry({
      ...opts,
      enableHighAccuracy: false,
      timeout: 30000, // Longer timeout
      maximumAge: 600000, // Allow 10-minute old cache
    });
  } catch (error) {
    console.warn('Cached location failed, trying IP geolocation...', error);
  }

  // Strategy 4: IP-based geolocation fallback
  try {
    return await getIPGeolocation();
  } catch (error) {
    console.error('All geolocation strategies failed:', error);
    throw new Error('Unable to determine your location. Please select on the map.');
  }
}

/**
 * Get location with retry logic
 */
async function getLocationWithRetry(
  options: Required<GeolocationOptions>
): Promise<GeolocationResult> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation not supported');
  }

  let lastError: GeolocationPositionError | null = null;

  for (let attempt = 0; attempt <= options.retries; attempt++) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Geolocation timeout'));
        }, options.timeout);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            resolve(position);
          },
          (error) => {
            clearTimeout(timeoutId);
            reject(error);
          },
          {
            enableHighAccuracy: options.enableHighAccuracy,
            timeout: options.timeout,
            maximumAge: options.maximumAge,
          }
        );
      });

      const source = options.enableHighAccuracy ? 'gps' : 'network';
      const age = Date.now() - (position.timestamp || Date.now());
      const actualSource = age > options.maximumAge ? 'cached' : source;

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || 0,
        source: actualSource as 'gps' | 'network' | 'cached',
        timestamp: position.timestamp || Date.now(),
      };
    } catch (error: any) {
      lastError = error;

      // Don't retry on permission denied
      if (error?.code === error?.PERMISSION_DENIED) {
        throw new Error('Location permission denied. Please enable location access.');
      }

      // Wait before retry (except on last attempt)
      if (attempt < options.retries) {
        await new Promise((resolve) => setTimeout(resolve, options.retryDelay));
      }
    }
  }

  throw lastError || new Error('Geolocation failed after retries');
}

/**
 * IP-based geolocation fallback
 * Uses a free IP geolocation service as last resort
 */
async function getIPGeolocation(): Promise<GeolocationResult> {
  try {
    // Try multiple IP geolocation services for redundancy
    const services = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/',
      'https://freegeoip.app/json/',
    ];

    for (const service of services) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(service, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const data = await response.json();

        // Different services return different formats
        let lat: number | null = null;
        let lng: number | null = null;

        if (data.latitude && data.longitude) {
          lat = data.latitude;
          lng = data.longitude;
        } else if (data.lat && data.lon) {
          lat = data.lat;
          lng = data.lon;
        }

        if (lat !== null && lng !== null) {
          return {
            latitude: lat,
            longitude: lng,
            accuracy: 10000, // IP geolocation is ~10km accurate
            source: 'ip',
            timestamp: Date.now(),
          };
        }
      } catch (err) {
        console.warn(`IP geolocation service failed: ${service}`, err);
        continue;
      }
    }

    throw new Error('All IP geolocation services failed');
  } catch (error) {
    throw new Error('IP geolocation unavailable');
  }
}

/**
 * Watch position with automatic fallback
 * Continuously tracks position and falls back if GPS fails
 */
export function watchRobustPosition(
  onSuccess: (result: GeolocationResult) => void,
  onError: (error: Error) => void,
  options: GeolocationOptions = {}
): number | null {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation not supported'));
    return null;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  let watchId: number | null = null;
  let fallbackTimeout: NodeJS.Timeout | null = null;

  // Start watching position
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      // Clear fallback timeout since we got a position
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
        fallbackTimeout = null;
      }

      const result: GeolocationResult = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || 0,
        source: opts.enableHighAccuracy ? 'gps' : 'network',
        timestamp: position.timestamp || Date.now(),
      };

      onSuccess(result);
    },
    (_error) => {
      // Set up fallback after error
      if (fallbackTimeout) clearTimeout(fallbackTimeout);

      fallbackTimeout = setTimeout(async () => {
        try {
          const result = await getRobustLocation(opts);
          onSuccess(result);
        } catch (fallbackError: any) {
          onError(fallbackError);
        }
      }, 2000); // Wait 2 seconds before fallback
    },
    {
      enableHighAccuracy: opts.enableHighAccuracy,
      timeout: opts.timeout,
      maximumAge: opts.maximumAge,
    }
  );

  return watchId;
}

/**
 * Stop watching position
 */
export function clearWatch(watchId: number | null): void {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}
