import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching form layout */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <img
              src="/image.png"
              alt="Legacy Power Systems"
              className="h-14 sm:h-16 object-contain"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Page Not Found
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                The page you're looking for doesn't exist
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 sm:p-12 text-center">
            {/* Error icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full mb-6">
              <AlertCircle size={64} className="text-red-500" />
            </div>

            {/* Error message */}
            <h2 className="text-4xl font-bold text-gray-900 mb-4">404</h2>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Page Not Found
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              The page you're trying to access doesn't exist or may have been moved.
              Please check the URL and try again.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 hover:shadow-md"
              >
                <Home size={20} />
                New Form
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium transition-all"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* Additional help section */}
          <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
            <h4 className="font-semibold text-gray-900 mb-3 text-center">
              Need Help?
            </h4>
            <div className="text-sm text-gray-600 text-center max-w-2xl mx-auto">
              <p>
                If you believe this is an error, please contact your system administrator
                or check your bookmarked links for updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
