import apiClient from './axios';

export const AuthAPI = {
  // Login
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('admin_data', JSON.stringify(response.admin));
      }
      return response;
    } catch (error) {
      throw error;
    }
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

// Default export for backward compatibility
export default AuthAPI;
