import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { Navigation } from '../components/Navigation';
import { StarRating } from '../components/StarRating';
import { serverApi } from '../services/serverApi';
import { geocodeAddress } from '../services/geocoding';
import type { CoffeePlaceFormData } from '../types';
import { isOnline } from '../utils/helpers';
import { usePhotoUrl, clearPlacePhotoCache } from '../hooks/usePhotoUrl';

export const AddEditPlace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CoffeePlaceFormData>({
    name: '',
    address: '',
    instagramHandle: '',
    coffeeQuality: 0,
    ambient: 0,
    hasGlutenFree: false,
    hasVegMilk: false,
    hasVeganFood: false,
    hasSugarFree: false,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasExistingPhoto, setHasExistingPhoto] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const { photoUrl: existingPhotoUrl } = usePhotoUrl(hasExistingPhoto && id ? id : null, 'thumbnail');

  useEffect(() => {
    if (id) {
      loadPlace();
    }
  }, [id]);

  // Update preview when existing photo loads
  useEffect(() => {
    if (hasExistingPhoto && existingPhotoUrl && !photoFile) {
      setPhotoPreview(existingPhotoUrl);
    }
  }, [hasExistingPhoto, existingPhotoUrl, photoFile]);

  const loadPlace = async () => {
    if (!id) return;

    try {
      const place = await serverApi.getPlace(id);
      if (place) {
        setFormData({
          name: place.name,
          address: place.address,
          instagramHandle: place.instagramHandle,
          coffeeQuality: place.coffeeQuality,
          ambient: place.ambient,
          hasGlutenFree: place.hasGlutenFree,
          hasVegMilk: place.hasVegMilk,
          hasVeganFood: place.hasVeganFood,
          hasSugarFree: place.hasSugarFree,
        });

        if (place.hasPhoto) {
          setHasExistingPhoto(true);
        }
      }
    } catch (error) {
      console.error('Failed to load place:', error);
      setError('Failed to load place');
    }
  };

  const handlePhotoSelect = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setError('Photo size must be under 2MB');
      return;
    }

    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      setError('Only JPEG and PNG images are allowed');
      return;
    }

    setProcessingPhoto(true);
    setError('');

    try {
      setPhotoFile(file);
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
      setHasExistingPhoto(false);
    } catch (err) {
      setError('Failed to process photo');
      console.error('Photo processing error:', err);
    } finally {
      setProcessingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!id || !confirm('Delete this photo?')) return;

    try {
      await serverApi.deletePhoto(id);
      clearPlacePhotoCache(id); // Clear cache after deleting
      setPhotoPreview(null);
      setHasExistingPhoto(false);
      setPhotoFile(null);
    } catch (err) {
      setError('Failed to delete photo');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.coffeeQuality === 0 || formData.ambient === 0) {
      setError('Please rate both coffee quality and ambient');
      return;
    }

    setLoading(true);

    try {
      let placeId = id;

      if (id) {
        // Update existing place
        let updatedFormData = { ...formData };
        if (isOnline()) {
          const coords = await geocodeAddress(formData.address);
          if (coords) {
            updatedFormData = {
              ...formData,
              latitude: coords.lat,
              longitude: coords.lng,
            };
          }
        }
        await serverApi.updatePlace(id, updatedFormData);
      } else {
        // Geocode address BEFORE creating the place
        let newFormData = { ...formData };
        if (isOnline()) {
          const coords = await geocodeAddress(formData.address);
          if (coords) {
            newFormData = {
              ...formData,
              latitude: coords.lat,
              longitude: coords.lng,
            };
          }
        }

        // Create new place with coordinates
        const newPlace = await serverApi.createPlace(newFormData);
        placeId = newPlace.id;
      }

      // Upload photo if selected
      if (photoFile && placeId) {
        // Resize original photo (max 1200px)
        const resizedPhoto = await imageCompression(photoFile, {
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: photoFile.type,
          initialQuality: 0.8,
        });

        // Create thumbnail (300x300 square crop)
        const thumbnail = await imageCompression(photoFile, {
          maxWidthOrHeight: 300,
          useWebWorker: true,
          fileType: photoFile.type,
          initialQuality: 0.7,
        });

        await serverApi.uploadPhoto(placeId, resizedPhoto, thumbnail);
        clearPlacePhotoCache(placeId); // Clear cache so new photo loads fresh
      }

      navigate('/home');
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save place');
      setLoading(false); // Explicitly reset loading state on error
    } finally {
      setLoading(false); // Also reset in finally to ensure it always runs
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this place?')) return;

    setDeleting(true);

    try {
      await serverApi.deletePlace(id);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete place');
      setDeleting(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          {id ? 'Edit Coffee Place' : 'Add Coffee Place'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Coffee Shop Name"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                Address *
              </label>
              <input
                id="address"
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="123 Main St, City"
              />
            </div>

            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-300 mb-1">
                Instagram Handle
              </label>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">@</span>
                <input
                  id="instagram"
                  type="text"
                  value={formData.instagramHandle}
                  onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="coffeeshop"
                />
              </div>
            </div>

            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-1">
                Photo (max 2MB, JPG/PNG)
              </label>
              <input
                id="photo"
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handlePhotoSelect(file);
                  }
                }}
                disabled={processingPhoto}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-emerald-600 file:text-white file:hover:bg-emerald-700 file:cursor-pointer disabled:opacity-50"
              />

              {photoPreview && (
                <div className="mt-3">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="max-w-xs rounded border border-gray-600"
                  />
                  <div className="mt-2 flex gap-2">
                    {hasExistingPhoto && id && (
                      <button
                        type="button"
                        onClick={handleDeletePhoto}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete current photo
                      </button>
                    )}
                    {photoFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          // Clear preview, useEffect will restore existing photo if available
                          if (!hasExistingPhoto) {
                            setPhotoPreview(null);
                          }
                        }}
                        className="text-gray-400 hover:text-gray-300 text-sm"
                      >
                        Remove new photo
                      </button>
                    )}
                  </div>
                </div>
              )}

              {processingPhoto && (
                <p className="mt-2 text-sm text-emerald-400">Processing photo...</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <StarRating
                value={formData.coffeeQuality}
                onChange={(value) => setFormData({ ...formData, coffeeQuality: value })}
                label="Coffee Quality *"
              />
              <StarRating
                value={formData.ambient}
                onChange={(value) => setFormData({ ...formData, ambient: value })}
                label="Ambient *"
              />
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-sm font-medium text-gray-300 mb-3">Available Options</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasGlutenFree}
                    onChange={(e) => setFormData({ ...formData, hasGlutenFree: e.target.checked })}
                    className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-300">Gluten-free food</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasVegMilk}
                    onChange={(e) => setFormData({ ...formData, hasVegMilk: e.target.checked })}
                    className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-300">Vegetal/plant milk</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasVeganFood}
                    onChange={(e) => setFormData({ ...formData, hasVeganFood: e.target.checked })}
                    className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-300">Vegan food</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasSugarFree}
                    onChange={(e) => setFormData({ ...formData, hasSugarFree: e.target.checked })}
                    className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-300">Sugar-free food</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : id ? 'Update Place' : 'Add Place'}
            </button>

            {id && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};
