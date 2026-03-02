import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // VERY IMPORTANT for file uploads (FormData)
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]; // Let browser set multipart/form-data boundary
  }

  return config;
});

export default api;
