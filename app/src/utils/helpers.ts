import type { CoffeePlace } from '../types';

const DEBUG_MAPS = import.meta.env.VITE_DEBUG_MAPS === 'true';

const debugLog = (...args: unknown[]) => {
  if (DEBUG_MAPS) {
    console.log('[MAPS DEBUG]', ...args);
  }
};

export const calculateScore = (coffeeQuality: number, ambient: number): number => {
  return (coffeeQuality + ambient) / 2;
};

export const getPlaceScore = (place: CoffeePlace): number => {
  return calculateScore(place.coffeeQuality, place.ambient);
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  debugLog('📏 Calculating distance:', {
    from: { lat: lat1, lon: lon1 },
    to: { lat: lat2, lon: lon2 },
  });

  // Haversine formula
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  debugLog('✅ Distance calculated:', distance.toFixed(2) + 'km');

  return distance; // Distance in km
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

export const openAddressInMaps = (address: string, preferredApp?: 'google' | 'apple') => {
  const encodedAddress = encodeURIComponent(address);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (isIOS) {
    if (preferredApp === 'google') {
      // Try Google Maps app first, fallback to web
      window.location.href = `comgooglemaps://?q=${encodedAddress}`;
      // Fallback to Google Maps web if app not installed
      setTimeout(() => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
      }, 500);
    } else {
      // Apple Maps (default for iOS)
      window.location.href = `http://maps.apple.com/?q=${encodedAddress}`;
    }
  } else if (isAndroid) {
    // Android uses geo: scheme which opens default maps app
    window.location.href = `geo:0,0?q=${encodedAddress}`;
  } else {
    // Desktop - open Google Maps web
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  }
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};
