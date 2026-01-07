import { usePhotoUrl } from "../hooks/usePhotoUrl";
import { Modal } from "./Modal";

export const FullPhotoModal = ({ placeId, onClose }: { placeId: string; onClose: () => void }) => {
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