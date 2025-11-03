import apiClient from './axios';

export const authApi = {
  // Login
  login: async (credentials = {}) => {
    const username = credentials.username || credentials.email;
    const password = credentials.password;
    if (!username || !password) {
      throw new Error('Vui lòng nhập username và password');
    }
    const payload = { username, password };
    const response = await apiClient.post('/auth/login', payload);
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('admin_data', JSON.stringify(response.admin));
    }
    return response;
  },

  // Register new admin
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get current admin profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_data');
    return Promise.resolve();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Get current user data from localStorage
  getCurrentUser: () => {
    const userData = localStorage.getItem('admin_data');
    return userData ? JSON.parse(userData) : null;
  },
};
