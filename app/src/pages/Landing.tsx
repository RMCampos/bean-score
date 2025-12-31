import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const Landing = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="inline-block p-4 bg-emerald-500 rounded-full mb-4">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Bean Score</h1>
          <p className="text-xl text-gray-300 mb-8">
            Track and rate your favorite coffee places. Find the perfect spot for your next coffee
            break.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="px-8 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Register
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-emerald-400 text-2xl mb-2">★</div>
            <h3 className="text-white font-semibold mb-2">Rate Coffee Places</h3>
            <p className="text-gray-400 text-sm">
              Score coffee quality and ambiance on a 5-star scale
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-emerald-400 text-2xl mb-2">🔍</div>
            <h3 className="text-white font-semibold mb-2">Filter & Search</h3>
            <p className="text-gray-400 text-sm">
              Find places with vegan food, veg milk, gluten-free options, and more
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-emerald-400 text-2xl mb-2">📍</div>
            <h3 className="text-white font-semibold mb-2">Find Nearby</h3>
            <p className="text-gray-400 text-sm">
              Sort by distance to discover coffee spots near you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
