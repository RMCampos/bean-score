const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
const DEBUG_MAPS = import.meta.env.VITE_DEBUG_MAPS === 'true';

const debugLog = (...args: unknown[]) => {
  if (DEBUG_MAPS) {
    console.log('[MAPS DEBUG]', ...args);
  }
};

const maskApiKey = (key: string): string => {
  if (!key || key === 'YOUR_API_KEY_HERE') return '❌ NOT SET';
  if (key.length < 12) return '⚠️ TOO SHORT';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};

if (DEBUG_MAPS) {
  console.log('[MAPS DEBUG] 🔑 Google Maps API Key Check:');
  console.log('[MAPS DEBUG]   - Key from env:', maskApiKey(GOOGLE_MAPS_API_KEY));
  console.log('[MAPS DEBUG]   - Full length:', GOOGLE_MAPS_API_KEY?.length || 0, 'chars');

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('[MAPS DEBUG] ❌ CRITICAL: Google Maps API key is not configured!');
    console.error('[MAPS DEBUG]    Please set VITE_GOOGLE_MAPS_API_KEY in your .env file');
  } else if (GOOGLE_MAPS_API_KEY.length < 30) {
    console.warn('[MAPS DEBUG] ⚠️ WARNING: API key seems too short (expected ~39 chars)');
  } else {
    console.log('[MAPS DEBUG] ✅ API key appears to be configured');
  }
}

let geocoder: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

const loadGoogleMapsScript = (): Promise<void> => {
  if (loadPromise) {
    debugLog('📜 Google Maps script already loading/loaded');
    return loadPromise;
  }

  debugLog('📜 Loading Google Maps script...');

  loadPromise = new Promise<void>((resolve, reject) => {
    // @ts-expect-error - google is loaded dynamically
    if (typeof google !== 'undefined' && google.maps) {
      debugLog('✅ Google Maps already loaded');
      resolve(undefined);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      debugLog('📜 Found existing Google Maps script tag');
      existingScript.addEventListener('load', () => {
        debugLog('✅ Google Maps script loaded (existing tag)');
        resolve(undefined);
      });
      existingScript.addEventListener('error', () => {
        console.error('[MAPS] ❌ Failed to load Google Maps script (existing tag)');
        reject(new Error('Failed to load Google Maps'));
      });
      return;
    }

    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geocoding`;
    debugLog('📜 Creating new script tag:', scriptUrl.replace(GOOGLE_MAPS_API_KEY, maskApiKey(GOOGLE_MAPS_API_KEY)));

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      debugLog('✅ Google Maps script loaded successfully');
      resolve(undefined);
    };
    script.onerror = (error) => {
      console.error('[MAPS] ❌ Failed to load Google Maps script:', error);
      console.error('[MAPS] This could mean:');
      console.error('[MAPS]   1. Invalid API key');
      console.error('[MAPS]   2. Network connectivity issues');
      console.error('[MAPS]   3. CORS/CSP restrictions');
      reject(new Error('Failed to load Google Maps script'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
};

const initGeocoder = async (): Promise<any> => {
  if (geocoder) return geocoder;

  if (isLoading) {
    await loadPromise;
    return geocoder;
  }

  try {
    isLoading = true;
    await loadGoogleMapsScript();

    // @ts-expect-error - google is loaded dynamically
    if (typeof google === 'undefined' || !google.maps) {
      throw new Error('Google Maps failed to load');
    }

    // @ts-expect-error - google is loaded dynamically
    geocoder = new google.maps.Geocoder();
    isLoading = false;
    return geocoder;
  } catch (error) {
    isLoading = false;
    console.error('Failed to initialize geocoder:', error);
    throw error;
  }
};

export const geocodeAddress = async (
  address: string
): Promise<{ lat: number; lng: number } | null> => {
  debugLog('🗺️ geocodeAddress called for:', address);

  try {
    const geocoderInstance = await initGeocoder();
    debugLog('✅ Geocoder initialized');

    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      geocoderInstance.geocode({ address }, (results: any, status: any) => {
        debugLog('📍 Geocoding result:', { status, resultsCount: results?.length || 0 });

        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const coords = {
            lat: location.lat(),
            lng: location.lng(),
          };
          debugLog('✅ Geocoding success:', coords);
          resolve(coords);
        } else {
          console.error('[GEOCODING] ❌ Failed:', status);

          if (status === 'REQUEST_DENIED') {
            console.error('[GEOCODING] API key is invalid or request was denied');
            console.error('[GEOCODING] Check your Google Cloud Console:');
            console.error('[GEOCODING]   1. Is Geocoding API enabled?');
            console.error('[GEOCODING]   2. Is the API key valid?');
            console.error('[GEOCODING]   3. Are there any restrictions blocking this domain?');
          } else if (status === 'ZERO_RESULTS') {
            console.warn('[GEOCODING] No results found for address:', address);
          } else if (status === 'OVER_QUERY_LIMIT') {
            console.error('[GEOCODING] API quota exceeded');
          }

          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('[GEOCODING] ❌ Exception:', error);
    debugLog('Exception details:', error);
    return null;
  }
};

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  debugLog('🗺️ reverseGeocode called for:', { lat, lng });

  try {
    const geocoderInstance = await initGeocoder();
    debugLog('✅ Geocoder initialized for reverse geocoding');

    return new Promise((resolve) => {
      // @ts-expect-error - google is loaded dynamically
      const latLng = new google.maps.LatLng(lat, lng);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      geocoderInstance.geocode({ location: latLng }, (results: any, status: any) => {
        debugLog('📍 Reverse geocoding result:', { status, resultsCount: results?.length || 0 });

        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          debugLog('✅ Reverse geocoding success:', address);
          resolve(address);
        } else {
          console.error('[REVERSE GEOCODING] ❌ Failed:', status);

          if (status === 'REQUEST_DENIED') {
            console.error('[REVERSE GEOCODING] API key is invalid or request was denied');
          } else if (status === 'ZERO_RESULTS') {
            console.warn('[REVERSE GEOCODING] No results found for coordinates:', { lat, lng });
          } else if (status === 'OVER_QUERY_LIMIT') {
            console.error('[REVERSE GEOCODING] API quota exceeded');
          }

          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('[REVERSE GEOCODING] ❌ Exception:', error);
    debugLog('Exception details:', error);
    return null;
  }
};

export const getCurrentPosition = (): Promise<GeolocationPosition | null> => {
  debugLog('🎯 getCurrentPosition called');

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      debugLog('❌ Geolocation not supported by browser');
      resolve(null);
      return;
    }

    debugLog('📍 Requesting geolocation with options:', {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 300000,
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        debugLog('✅ Geolocation success:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        resolve(position);
      },
      (error) => {
        debugLog('❌ Geolocation error:', {
          code: error.code,
          message: error.message,
          codes: {
            1: 'PERMISSION_DENIED',
            2: 'POSITION_UNAVAILABLE',
            3: 'TIMEOUT',
          }[error.code],
        });
        console.error('Geolocation error:', error.code, error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: false,  // Allow network-based location (not just GPS)
        timeout: 30000,             // 30 seconds
        maximumAge: 300000,         // Accept cached position up to 5 minutes old
      }
    );
  });
};
