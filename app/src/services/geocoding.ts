// You'll need to replace this with an actual API key when deploying
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let geocoder: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

const loadGoogleMapsScript = (): Promise<void> => {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    // @ts-expect-error - google is loaded dynamically
    if (typeof google !== 'undefined' && google.maps) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geocoding`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });

  return loadPromise;
};

const initGeocoder = async (): Promise<any> => {
  if (geocoder) return geocoder;

  if (isLoading) {
    // Wait for the current loading to complete
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
  try {
    const geocoderInstance = await initGeocoder();

    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      geocoderInstance.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          console.error('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const getCurrentPosition = (): Promise<GeolocationPosition | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        console.error('Geolocation error:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,        // 30 seconds (increased from 10)
        maximumAge: 300000,    // Accept cached position up to 5 minutes old
      }
    );
  });
};
