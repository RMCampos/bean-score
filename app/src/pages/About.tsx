import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { serverApi } from '../services/serverApi';
import { getPhotoCacheStats, clearPhotoCache } from '../hooks/usePhotoUrl';

export const About = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cacheStats, setCacheStats] = useState(getPhotoCacheStats());

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleClearCache = () => {
    clearPhotoCache();
    setCacheStats(getPhotoCacheStats());
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);

    try {
      await serverApi.deleteAccount();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">About Bean Score</h1>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">What is Bean Score?</h2>
          <p className="text-gray-300 mb-4">
            Bean Score is a personal coffee place tracking app that helps you remember and rate your
            favorite coffee spots. Keep track of the best places for your morning brew, discover
            which cafes offer vegan options, gluten-free treats, and more.
          </p>

          <h3 className="text-lg font-semibold text-white mb-3 mt-6">Features</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">★</span>
              <span>Rate coffee quality and ambiance on a 5-star scale</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">🔍</span>
              <span>Filter by dietary options: vegan food, plant milk, gluten-free, sugar-free</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">📍</span>
              <span>Sort by distance to find coffee places near you</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">💾</span>
              <span>Works offline as a PWA (Progressive Web App)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">🔒</span>
              <span>Your data is stored locally - private and secure</span>
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-3 mt-6">How to Use</h3>
          <ol className="space-y-2 text-gray-300 list-decimal list-inside">
            <li>Add coffee places you visit with their address and Instagram handle</li>
            <li>Rate the coffee quality and ambiance</li>
            <li>Mark available options like vegan food, plant milk, etc.</li>
            <li>Search and filter to find the perfect spot</li>
            <li>Click on addresses to navigate using your preferred maps app</li>
          </ol>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your Account</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              <strong className="text-white">Name:</strong> {user?.name}
            </p>
            <p>
              <strong className="text-white">Email:</strong> {user?.email}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Storage & Cache</h2>
          <p className="text-gray-300 mb-4">
            Photos are cached in memory for faster loading. The cache is automatically cleared when
            you refresh the page or close the browser.
          </p>

          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Cached Photos</p>
                <p className="text-white font-semibold text-lg">{cacheStats.count}</p>
              </div>
              <div>
                <p className="text-gray-400">Cache Size</p>
                <p className="text-white font-semibold text-lg">{formatBytes(cacheStats.totalSize)}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClearCache}
            disabled={cacheStats.count === 0}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Photo Cache
          </button>

          {cacheStats.count === 0 && (
            <p className="text-gray-500 text-sm mt-2">Cache is empty</p>
          )}
        </div>

        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
          <p className="text-gray-300 mb-4">
            Deleting your account will permanently remove all your data, including all coffee places
            you've added and their ratings. This action cannot be undone.
          </p>

          {!showConfirmation ? (
            <button
              onClick={() => setShowConfirmation(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-red-300 font-semibold">
                Are you absolutely sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={deleting}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Bean Score v1.0.0</p>
          <p className="mt-1">Made with ☕ for coffee lovers</p>
        </div>
      </div>
    </>
  );
};
