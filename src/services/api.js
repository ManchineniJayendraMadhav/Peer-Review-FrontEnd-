import axios from 'axios';

const api = axios.create({
  baseURL: 'https://peer-review-backend-nnw0.onrender.com/api',
});
console.log('API baseURL:', api.defaults.baseURL);
// Add a request interceptor to append JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global Response Error Handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400 && data.fieldErrors) {
        const messages = Object.values(data.fieldErrors).join('\n');
        alert(`Validation Error:\n${messages}`);
      } else if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        alert(`Error: ${data.message || data || 'Something went wrong'}`);
      }
    } else {
      alert('Network error. Please try again.');
    }
    return Promise.reject(error);
  }
);

export default api;
