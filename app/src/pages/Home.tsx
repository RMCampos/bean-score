import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { StarRating } from '../components/StarRating';
import { Modal } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { serverApi } from '../services/serverApi';
import { getCurrentPosition } from '../services/geocoding';
import type { CoffeePlace, SearchFilters } from '../types';
import { getPlaceScore, calculateDistance, formatDistance, openAddressInMaps, isOnline } from '../utils/helpers';
import { usePhotoUrl } from '../hooks/usePhotoUrl';

const DEBUG_MAPS = import.meta.env.VITE_DEBUG_MAPS === 'true';

const debugLog = (...args: unknown[]) => {
  if (DEBUG_MAPS) {
    console.log('[MAPS DEBUG]', ...args);
  }
};

const FullPhotoModal = ({ placeId, onClose }: { placeId: string; onClose: () => void }) => {
  const { photoUrl, loading } = usePhotoUrl(placeId, 'photo');

  return (
    <Modal isOpen={true} onClose={onClose}>
      {loading ? (
        <div className="text-white text-center p-8">Loading full photo...</div>
      ) : photoUrl ? (
        <img
          src={photoUrl}
          alt="Full size"
          className="max-w-full max-h-[90vh] rounded"
        />
      ) : (
        <div className="text-white text-center p-8">Failed to load photo</div>
      )}
    </Modal>
  );
};

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
      // Text search
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesText =
          place.name.toLowerCase().includes(searchLower) ||
          place.address.toLowerCase().includes(searchLower);
        if (!matchesText) return false;
      }

      // Attribute filters (AND logic)
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
    // When offline or no location, return unsorted (natural order)
    return filteredPlaces;
  }, [filteredPlaces, userLocation]);

  const PlaceThumbnail = ({ placeId, placeName, onClick }: { placeId: string; placeName: string; onClick: () => void }) => {
    const { photoUrl, loading } = usePhotoUrl(placeId, 'thumbnail');

    if (loading) {
      return (
        <div className="mb-3 -mx-4 -mt-4 w-full h-48 bg-gray-700 rounded-t-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      );
    }

    if (!photoUrl) {
      return null;
    }

    return (
      <div className="mb-3 -mx-4 -mt-4">
        <img
          src={photoUrl}
          alt={placeName}
          className="w-full h-48 object-cover rounded-t-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={onClick}
        />
      </div>
    );
  };

  const PlaceCard = ({ place }: { place: CoffeePlace }) => {
    const score = getPlaceScore(place);

    debugLog('🏪 Rendering PlaceCard:', {
      name: place.name,
      hasCoordinates: !!(place.latitude && place.longitude),
      coordinates: place.latitude && place.longitude ? { lat: place.latitude, lng: place.longitude } : null,
      userLocation,
      isOnline: isOnline(),
    });

    const distance =
      userLocation && isOnline() && place.latitude && place.longitude
        ? calculateDistance(userLocation.lat, userLocation.lng, place.latitude, place.longitude)
        : null;

    debugLog('📊 Distance result for', place.name, ':', distance ? distance.toFixed(2) + 'km' : 'null');

    const handleOpenMaps = () => {
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isIOS) {
        // Show choice for iOS users
        const choice = window.confirm(
          'Open in Google Maps?\n\nOK = Google Maps\nCancel = Apple Maps'
        );
        openAddressInMaps(place.address, choice ? 'google' : 'apple');
      } else {
        openAddressInMaps(place.address);
      }
    };

    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-emerald-500 transition-colors">
        {place.hasPhoto && (
          <PlaceThumbnail
            placeId={place.id}
            placeName={place.name}
            onClick={() => setSelectedPhoto(place.id)}
          />
        )}

        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{place.name}</h3>
            <button
              onClick={handleOpenMaps}
              className="text-sm text-gray-400 hover:text-emerald-400 transition-colors text-left"
            >
              {place.address}
            </button>
            {place.instagramHandle && (
              <a
                href={`https://instagram.com/${place.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                @{place.instagramHandle}
              </a>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">{score.toFixed(1)}</div>
            {distance !== null && (
              <div className="text-xs text-gray-400">{formatDistance(distance)}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <StarRating value={place.coffeeQuality} readonly label="Coffee" />
          </div>
          <div>
            <StarRating value={place.ambient} readonly label="Ambient" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {place.hasGlutenFree && (
            <span className="px-2 py-1 bg-emerald-900 text-emerald-300 text-xs rounded">
              Gluten-free
            </span>
          )}
          {place.hasVegMilk && (
            <span className="px-2 py-1 bg-emerald-900 text-emerald-300 text-xs rounded">
              Veg milk
            </span>
          )}
          {place.hasVeganFood && (
            <span className="px-2 py-1 bg-emerald-900 text-emerald-300 text-xs rounded">
              Vegan food
            </span>
          )}
          {place.hasSugarFree && (
            <span className="px-2 py-1 bg-emerald-900 text-emerald-300 text-xs rounded">
              Sugar-free
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            to={`/edit-place/${place.id}`}
            className="flex-1 text-center px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
          >
            Edit
          </Link>
        </div>
      </div>
    );
  };

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
                    <PlaceCard key={place.id} place={place} />
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
