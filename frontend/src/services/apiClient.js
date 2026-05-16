import axios from "axios";

// In development, Vite proxy forwards /api → https://localhost:7215/api
// In production, set VITE_API_BASE_URL env variable or use the same origin
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Expires": "0",
  },
});

// Attach JWT token to every request and add cache buster for GETs
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.method === "get") {
    config.params = {
      ...config.params,
      _t: new Date().getTime(),
    };
  }
  return config;
});

// Handle 401 responses globally (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Don't redirect if already on login/register
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("username");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;