// Vercel: set VITE_BACKEND_URL to the public Render backend URL.
// Local development falls back to the Vite proxy.
export const API_URL = import.meta.env.VITE_BACKEND_URL || '';
