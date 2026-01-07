import { usePhotoUrl } from "../hooks/usePhotoUrl";

export const PlaceThumbnail = ({
  placeId,
  placeName,
  onClick
}: { placeId: string; placeName: string; onClick: () => void }) => {
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
