import axios from '../api/axios';

export const searchProducts = async (query = "", category_id = null) => {
  let url = '/products?is_active=true';
  
  if (query) {
    url += `&search=${query}`;
  }
  
  if (category_id) {
    url += `&category_id=${category_id}`;
  }
  
  const response = await axios.get(url);
  return response.data;
};

export const getCategories = async () => {
  const response = await axios.get('/categories');
  return response.data;
};

export const getCustomers = async (query = "") => {
  let url = '/customers?is_active=true';
  
  if (query) {
    url += `&search=${query}`;
  }
  
  const response = await axios.get(url);
  return response.data;
};

export const createSale = async (saleData) => {
  const response = await axios.post('/sales', saleData);
  return response.data;
};

export const getProductByBarcode = async (barcode) => {
  const response = await axios.get(`/products?barcode=${barcode}`);
  return response.data.length > 0 ? response.data[0] : null;
};