import axiosInstance from './axios';

// Obtener todas las ventas
export const getSales = async (params) => {
  try {
    const response = await axiosInstance.get('/sales', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener una venta por ID
export const getSaleById = async (id) => {
  try {
    const response = await axiosInstance.get(`/sales/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear una nueva venta
export const createSale = async (saleData) => {
  try {
    const response = await axiosInstance.post('/sales', saleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar una venta existente
export const updateSale = async (id, saleData) => {
  try {
    const response = await axiosInstance.put(`/sales/${id}`, saleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cancelar una venta
export const cancelSale = async (id, reasonData) => {
  try {
    const response = await axiosInstance.post(`/sales/${id}/cancel`, reasonData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Procesar una devolución
export const processReturn = async (id, returnData) => {
  try {
    const response = await axiosInstance.post(`/sales/${id}/return`, returnData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener estadísticas de ventas
export const getSalesStatistics = async (params) => {
  try {
    const response = await axiosInstance.get('/sales/statistics', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener ventas por cliente
export const getSalesByCustomer = async (customerId) => {
  try {
    const response = await axiosInstance.get(`/sales/customer/${customerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener reporte de ventas por período
export const getSalesReport = async (params) => {
  try {
    const response = await axiosInstance.get('/sales/report', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  cancelSale,
  processReturn,
  getSalesStatistics,
  getSalesByCustomer,
  getSalesReport
};