import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { StarRating } from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';
import { mockApi } from '../services/mockApi';
import { geocodeAddress } from '../services/geocoding';
import type { CoffeePlaceFormData } from '../types';
import { isOnline } from '../utils/helpers';

export const AddEditPlace = () => {
  const { id } = useParams();
  const { user } = useAuth();
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

  useEffect(() => {
    if (id) {
      loadPlace();
    }
  }, [id]);

  const loadPlace = async () => {
    if (!id) return;

    try {
      const place = await mockApi.getPlace(id);
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
      }
    } catch (error) {
      console.error('Failed to load place:', error);
      setError('Failed to load place');
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
      if (id) {
        // Update existing place
        await mockApi.updatePlace(id, formData);
      } else {
        // Create new place and geocode address
        const newPlace = await mockApi.createPlace(user!.id, formData);

        // Try to geocode the address if online
        if (isOnline()) {
          const coords = await geocodeAddress(formData.address);
          if (coords) {
            // Update the place with coordinates
            const places = JSON.parse(localStorage.getItem('bean_score_places') || '[]');
            const placeIndex = places.findIndex((p: any) => p.id === newPlace.id);
            if (placeIndex !== -1) {
              places[placeIndex].latitude = coords.lat;
              places[placeIndex].longitude = coords.lng;
              localStorage.setItem('bean_score_places', JSON.stringify(places));
            }
          }
        }
      }

      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save place');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this place?')) return;

    setDeleting(true);

    try {
      await mockApi.deletePlace(id);
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
