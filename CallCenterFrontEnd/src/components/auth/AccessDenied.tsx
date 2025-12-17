import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

interface AccessDeniedProps {
  /** Custom message to display */
  message?: string;
  /** Whether to show the back button */
  showBackButton?: boolean;
  /** Whether to show the home button */
  showHomeButton?: boolean;
}

/**
 * Access Denied page component displayed when user lacks required permissions.
 */
export function AccessDenied({
  message = "You don't have permission to access this page.",
  showBackButton = true,
  showHomeButton = true,
}: AccessDeniedProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          If you believe you should have access to this page, please contact your administrator.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          )}

          {showHomeButton && (
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
