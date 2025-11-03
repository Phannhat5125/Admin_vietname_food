import apiClient from './axios';

export const foodApi = {
  // Get all foods with pagination and search
  getFoods: async (params = {}) => {
    try {
      const response = await apiClient.get('/foods/', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get food by ID
  getFoodById: async (id) => {
    try {
      const response = await apiClient.get(`/foods/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new food
  createFood: async (foodData) => {
    try {
      const response = await apiClient.post('/foods/', foodData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update food
  updateFood: async (id, foodData) => {
    try {
      const response = await apiClient.put(`/foods/${id}`, foodData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete food
  deleteFood: async (id) => {
    try {
      const response = await apiClient.delete(`/foods/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload food image
  uploadImage: async (formData) => {
    try {
      const response = await apiClient.post('/foods/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
