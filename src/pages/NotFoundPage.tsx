import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home, ExternalLink, FileWarning } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header matching form layout */}
      <div className="bg-white border-b border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/image.png"
                alt="Legacy Power Systems"
                className="h-14 sm:h-16 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8 sm:p-16 text-center">
            {/* Error icon with animation */}
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-50 to-orange-50 rounded-full mb-8 shadow-inner">
              <FileWarning size={80} className="text-red-500" />
            </div>

            {/* Error message */}
            <div className="mb-8">
              <h2 className="text-7xl font-bold text-gray-900 mb-4 tracking-tight">404</h2>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Page Not Found
              </h3>
              <p className="text-gray-600 text-lg mb-2 max-w-lg mx-auto leading-relaxed">
                The page you're trying to access doesn't exist or may have been moved.
              </p>
              <p className="text-gray-500 text-base max-w-lg mx-auto">
                Please check the URL or use one of the options below to continue.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2 hover:shadow-xl hover:scale-105 transform"
              >
                <Home size={20} />
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3.5 rounded-lg font-semibold transition-all hover:scale-105 transform"
              >
                Go Back
              </button>
            </div>

            {/* SharePoint Link */}
            <div className="pt-6 border-t border-gray-200">
              <a
                href="https://ontivity.sharepoint.com/sites/LegacyPowerSystems"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3.5 rounded-lg font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105 transform"
              >
                <ExternalLink size={20} />
                Go to SharePoint Site
              </a>
            </div>
          </div>

          {/* Additional help section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-8 py-8">
            <h4 className="font-bold text-gray-900 mb-3 text-center text-lg">
              Need Help?
            </h4>
            <div className="text-sm text-gray-600 text-center max-w-2xl mx-auto space-y-2">
              <p className="leading-relaxed">
                If you believe this is an error, please contact your system administrator
                or check your bookmarked links for updates.
              </p>
              <p className="text-xs text-gray-500 mt-4">
                Error Code: 404 - Resource Not Found
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
