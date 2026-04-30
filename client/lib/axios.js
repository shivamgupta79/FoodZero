// client/lib/axios.js

import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json"
  }
});

// Add token to requests if available
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server took too long to respond');
      error.message = 'Request timeout. Please try again.';
    } else if (!error.response) {
      console.error('Network error - could not reach server');
      error.message = 'Network error. Please check your connection.';
    }
    return Promise.reject(error);
  }
);

export default instance;
