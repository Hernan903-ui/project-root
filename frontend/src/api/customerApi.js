import axiosInstance from './axios';

// Obtener todos los clientes
export const getCustomers = async () => {
  try {
    const response = await axiosInstance.get('/customers');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener un cliente por ID
export const getCustomerById = async (id) => {
  try {
    const response = await axiosInstance.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear un nuevo cliente
export const createCustomer = async (customerData) => {
  try {
    const response = await axiosInstance.post('/customers', customerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar un cliente existente
export const updateCustomer = async (id, customerData) => {
  try {
    const response = await axiosInstance.put(`/customers/${id}`, customerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar un cliente
export const deleteCustomer = async (id) => {
  try {
    const response = await axiosInstance.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener el historial de compras de un cliente
export const getCustomerPurchaseHistory = async (id) => {
  try {
    const response = await axiosInstance.get(`/sales/customer/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Buscar clientes con filtros
export const searchCustomers = async (filters) => {
  try {
    const response = await axiosInstance.get('/customers/search', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener estadísticas de clientes
export const getCustomerStats = async () => {
  try {
    const response = await axiosInstance.get('/customers/statistics');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerPurchaseHistory,
  searchCustomers,
  getCustomerStats
};