import axios from './axios';

export const getInventoryMovements = async (params = {}) => {
  const { 
    product_id = null, 
    movement_type = null, 
    start_date = null,
    end_date = null,
    page = 1, 
    limit = 20 
  } = params;

  let url = `/inventory?skip=${(page - 1) * limit}&limit=${limit}`;
  
  if (product_id) {
    url += `&product_id=${product_id}`;
  }
  
  if (movement_type) {
    url += `&movement_type=${movement_type}`;
  }
  
  if (start_date) {
    url += `&start_date=${start_date}`;
  }
  
  if (end_date) {
    url += `&end_date=${end_date}`;
  }
  
  const response = await axios.get(url);
  return response.data;
};

export const createInventoryMovement = async (movementData) => {
  const response = await axios.post('/inventory', movementData);
  return response.data;
};

export const getLowStockProducts = async (threshold_percentage = 20) => {
  const response = await axios.get(`/reports/inventory/low-stock?threshold_percentage=${threshold_percentage}`);
  return response.data;
};

export const getInventoryValue = async () => {
  const response = await axios.get('/reports/inventory/value');
  return response.data;
};

export const getProductsBySearch = async (search = '') => {
  let url = '/products?is_active=true';
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  const response = await axios.get(url);
  return response.data;
};