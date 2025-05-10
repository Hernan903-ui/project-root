import axiosInstance from './axios';

// Obtener perfil del usuario actual
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar perfil de usuario
export const updateUserProfile = async (userData) => {
  try {
    const response = await axiosInstance.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cambiar contraseña
export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.post('/users/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar preferencias del usuario
export const updateUserPreferences = async (preferences) => {
  try {
    const response = await axiosInstance.put('/users/preferences', preferences);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener historial de actividad del usuario
export const getUserActivityHistory = async (params) => {
  try {
    const response = await axiosInstance.get('/users/activity', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar avatar o imagen de perfil
export const updateProfileImage = async (formData) => {
  try {
    const response = await axiosInstance.post('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateUserPreferences,
  getUserActivityHistory,
  updateProfileImage
};