// Central API base URL configuration
// In local development, connects directly to http://localhost:9000
// In production or when VITE_API_BASE_URL is set, connects to the configured backend

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:9000"
    : "https://lab-management-system-n3i5.onrender.com");
