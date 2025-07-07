import axios from 'axios';

const api = axios.create({
  baseURL: 'https://agreema-digital-agreement-making.onrender.com/api',
  withCredentials: true, // for session cookies if needed
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
