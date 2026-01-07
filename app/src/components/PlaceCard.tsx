import type { CoffeePlace } from "../types";
import { calculateDistance, debugLog, formatDistance, getPlaceScore, isOnline, openAddressInMaps } from "../utils/helpers";
import { PlaceThumbnail } from "./PlaceThumbnail";
import { StarRating } from "./StarRating";
import { Link } from 'react-router-dom';

export const PlaceCard = ({
  place,
  userLocation,
  setSelectedPhoto
}: {
  place: CoffeePlace,
  userLocation: { lat: number; lng: number } | null,
  setSelectedPhoto: (placeId: string) => void
}) => {
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