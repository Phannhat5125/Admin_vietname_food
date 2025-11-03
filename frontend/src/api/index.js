export { authApi as AuthAPI } from './authApi';
export { foodApi as FoodAPI } from './foodApi';
export { default as apiClient } from './axios';

// Helper functions for API calls
export const handleApiError = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Đã xảy ra lỗi không xác định';
};

export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (data[key] instanceof File) {
      formData.append(key, data[key]);
    } else if (Array.isArray(data[key])) {
      data[key].forEach(item => formData.append(`${key}[]`, item));
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  return formData;
};

// Map function for backend data
export const mapFromBackend = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.food_id,
    name: backendData.food_name,
    region: backendData.region,
    location: backendData.location,
    ingredients: backendData.ingredients,
    calories: backendData.calories,
    imageUrl: backendData.image_url,
    createdBy: backendData.created_by,
    createdAt: backendData.created_at,
    updatedAt: backendData.updated_at,
    creatorName: backendData.creator_name
  };
};

// Map function to backend format
export const mapToBackend = (frontendData) => {
  if (!frontendData) return null;
  
  return {
    food_name: frontendData.name,
    region: frontendData.region,
    location: frontendData.location,
    ingredients: frontendData.ingredients,
    calories: frontendData.calories,
    image_url: frontendData.imageUrl
  };
};
