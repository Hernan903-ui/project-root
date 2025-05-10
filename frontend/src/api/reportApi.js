import axiosInstance from './axios';

// Obtener reporte de ventas por período
export const getSalesReport = async (params) => {
  try {
    const response = await axiosInstance.get('/reports/sales', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener reporte de inventario
export const getInventoryReport = async (params) => {
  try {
    const response = await axiosInstance.get('/reports/inventory', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener reporte de clientes
export const getCustomersReport = async (params) => {
  try {
    const response = await axiosInstance.get('/reports/customers', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener reporte financiero
export const getFinancialReport = async (params) => {
  try {
    const response = await axiosInstance.get('/reports/financial', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener reporte personalizado
export const getCustomReport = async (reportType, params) => {
  try {
    const response = await axiosInstance.get(`/reports/${reportType}`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getSalesReport,
  getInventoryReport,
  getCustomersReport,
  getFinancialReport,
  getCustomReport
};