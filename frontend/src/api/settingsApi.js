import axiosInstance from './axios';

// Obtener todas las configuraciones del sistema
export const getSystemSettings = async () => {
  try {
    const response = await axiosInstance.get('/settings');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar configuraciones de impuestos
export const updateTaxSettings = async (taxSettings) => {
  try {
    const response = await axiosInstance.put('/settings/taxes', taxSettings);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar configuraciones de impresión
export const updatePrintSettings = async (printSettings) => {
  try {
    const response = await axiosInstance.put('/settings/printing', printSettings);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener métodos de pago
export const getPaymentMethods = async () => {
  try {
    const response = await axiosInstance.get('/settings/payment-methods');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear nuevo método de pago
export const createPaymentMethod = async (paymentMethod) => {
  try {
    const response = await axiosInstance.post('/settings/payment-methods', paymentMethod);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar método de pago
export const updatePaymentMethod = async (id, paymentMethod) => {
  try {
    const response = await axiosInstance.put(`/settings/payment-methods/${id}`, paymentMethod);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar método de pago
export const deletePaymentMethod = async (id) => {
  try {
    const response = await axiosInstance.delete(`/settings/payment-methods/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener usuarios del sistema
export const getUsers = async () => {
  try {
    const response = await axiosInstance.get('/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener usuario específico
export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear nuevo usuario
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar usuario
export const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar usuario
export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar permisos de un usuario
export const updateUserPermissions = async (id, permissions) => {
  try {
    const response = await axiosInstance.put(`/users/${id}/permissions`, { permissions });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener roles del sistema
export const getRoles = async () => {
  try {
    const response = await axiosInstance.get('/roles');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear nuevo rol
export const createRole = async (roleData) => {
  try {
    const response = await axiosInstance.post('/roles', roleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar rol
export const updateRole = async (id, roleData) => {
  try {
    const response = await axiosInstance.put(`/roles/${id}`, roleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar rol
export const deleteRole = async (id) => {
  try {
    const response = await axiosInstance.delete(`/roles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getSystemSettings,
  updateTaxSettings,
  updatePrintSettings,
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserPermissions,
  getRoles,
  createRole,
  updateRole,
  deleteRole
};