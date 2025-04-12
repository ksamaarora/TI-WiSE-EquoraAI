import axios from 'axios';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        // Handle unauthorized - could redirect to login
        console.error('Unauthorized access. Please login again.');
        // Clear invalid token
        localStorage.removeItem('auth_token');
      }
      
      if (error.response.status === 403) {
        console.error('Forbidden. You do not have permission to access this resource.');
      }
      
      if (error.response.status === 404) {
        console.error('Resource not found.');
      }
      
      if (error.response.status >= 500) {
        console.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
); 