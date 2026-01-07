import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { serverApi } from '../services/serverApi';
import { getCurrentPosition } from '../services/geocoding';
import type { CoffeePlace, SearchFilters } from '../types';
import { calculateDistance, debugLog, isOnline } from '../utils/helpers';
import { PlaceCard } from '../components/PlaceCard';
import { FullPhotoModal } from '../components/FullPhotoModal';

export const Home = () => {
  const { user } = useAuth();
  const [places, setPlaces] = useState<CoffeePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    hasGlutenFree: false,
    hasVegMilk: false,
    hasVeganFood: false,
    hasSugarFree: false,
  });

  const loadPlaces = useCallback(async () => {
    if (!user) return;

    try {
      const data = await serverApi.getPlaces();
      setPlaces(data);
    } catch (error) {
      console.error('Failed to load places:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPlaces();
    requestLocation();
  }, [user, loadPlaces]);

  const requestLocation = async () => {
    debugLog('🌍 requestLocation called');
    debugLog('Online status:', isOnline());

    if (!isOnline()) {
      debugLog('⚠️ Offline - skipping geolocation request');
      return;
    }

    const position = await getCurrentPosition();
    if (position) {
      const loc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      debugLog('📍 Setting userLocation:', loc);
      setUserLocation(loc);
    } else {
      debugLog('❌ No position returned from getCurrentPosition');
    }
  };

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesText =
          place.name.toLowerCase().includes(searchLower) ||
          place.address.toLowerCase().includes(searchLower);
        if (!matchesText) return false;
      }

      if (filters.hasGlutenFree && !place.hasGlutenFree) return false;
      if (filters.hasVegMilk && !place.hasVegMilk) return false;
      if (filters.hasVeganFood && !place.hasVeganFood) return false;
      if (filters.hasSugarFree && !place.hasSugarFree) return false;

      return true;
    });
  }, [places, filters]);

  const sortedPlaces = useMemo(() => {
    debugLog('🔄 sortedPlaces recalculating');
    debugLog('userLocation:', userLocation);
    debugLog('isOnline:', isOnline());
    debugLog('filteredPlaces count:', filteredPlaces.length);

    // Only sort by distance when online and location is available
    // Otherwise, keep natural order (recently added)
    if (userLocation && isOnline()) {
      debugLog('✅ Conditions met for distance sorting');
      const sorted = [...filteredPlaces];

      // Log places with/without coordinates
      const placesWithCoords = sorted.filter(p => p.latitude && p.longitude);
      const placesWithoutCoords = sorted.filter(p => !p.latitude || !p.longitude);
      debugLog(`Places with coordinates: ${placesWithCoords.length}, without: ${placesWithoutCoords.length}`);

      sorted.sort((a, b) => {
        // Only sort if both places have coordinates
        if (a.latitude && a.longitude && b.latitude && b.longitude) {
          const distA = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            a.latitude,
            a.longitude
          );
          const distB = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            b.latitude,
            b.longitude
          );
          return distA - distB;
        }
        // If coordinates missing, keep original order
        return 0;
      });

      return sorted;
    }

    debugLog('⚠️ Not sorting by distance - returning natural order');
    return filteredPlaces;
  }, [filteredPlaces, userLocation]);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-emerald-400 text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Search Coffee Places</h2>

          <input
            type="text"
            placeholder="Search by name or address..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasGlutenFree}
                onChange={(e) => setFilters({ ...filters, hasGlutenFree: e.target.checked })}
                className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
              />
              <span className="text-gray-300 text-sm">Gluten-free</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasVegMilk}
                onChange={(e) => setFilters({ ...filters, hasVegMilk: e.target.checked })}
                className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
              />
              <span className="text-gray-300 text-sm">Veg milk</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasVeganFood}
                onChange={(e) => setFilters({ ...filters, hasVeganFood: e.target.checked })}
                className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
              />
              <span className="text-gray-300 text-sm">Vegan food</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasSugarFree}
                onChange={(e) => setFilters({ ...filters, hasSugarFree: e.target.checked })}
                className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
              />
              <span className="text-gray-300 text-sm">Sugar-free</span>
            </label>
          </div>

          {!isOnline() && (
            <div className="mt-4 text-yellow-400 text-sm">
              You're offline - distance sorting is disabled
            </div>
          )}
        </div>

        {places.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No coffee places yet</p>
            <Link
              to="/add-place"
              className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Add Your First Place
            </Link>
          </div>
        ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-4">
                {filters.searchTerm || filters.hasGlutenFree || filters.hasVegMilk || filters.hasVeganFood || filters.hasSugarFree
                  ? 'Search Results'
                  : 'Recently Added'}
              </h2>
              {sortedPlaces.length === 0 ? (
                <p className="text-gray-400">No places match your filters</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedPlaces.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      userLocation={userLocation}
                      setSelectedPhoto={setSelectedPhoto}
                    />
                  ))}
                </div>
              )}
            </>
        )}
      </div>

      {selectedPhoto && <FullPhotoModal placeId={selectedPhoto} onClose={() => setSelectedPhoto(null)} />}
    </>
  );
};
