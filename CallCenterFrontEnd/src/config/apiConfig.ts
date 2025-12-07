// API Base URL - configured via environment variables
// Development: VITE_API_BASE_URL in .env.development
// Production: VITE_API_BASE_URL in .env.production
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not defined. Please create a .env file with VITE_API_BASE_URL=your-backend-url'
  );
}

export const buildUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
