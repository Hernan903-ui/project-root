//frontend/src/api/dashboard.js
import axios from '../api/axios';

export const getDashboardStats = async () => {
  const response = await axios.get('/reports/sales?group_by=day');
  return response.data;
};

export const getTopSellingProducts = async (limit = 5) => {
  const response = await axios.get(`/reports/products?limit=${limit}`);
  return response.data;
};

export const getLowStockProducts = async () => {
  const response = await axios.get('/reports/inventory/low-stock');
  return response.data;
};

export const getRecentSales = async (limit = 5) => {
  const response = await axios.get(`/sales?limit=${limit}`);
  return response.data;
};

export const getInventoryValue = async () => {
  const response = await axios.get('/reports/inventory/value');
  return response.data;
};