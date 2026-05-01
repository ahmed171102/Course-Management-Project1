import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://localhost:7263/api"
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;