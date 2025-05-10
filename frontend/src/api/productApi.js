import axios from '../api/axios';

export const getProducts = async (params = {}) => {
  const { 
    search = '', 
    category_id = null, 
    is_active = null,
    page = 1, 
    limit = 20 
  } = params;

  let url = `/products?skip=${(page - 1) * limit}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  if (category_id) {
    url += `&category_id=${category_id}`;
  }
  
  if (is_active !== null) {
    url += `&is_active=${is_active}`;
  }
  
  const response = await axios.get(url);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`/products/${id}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await axios.get('/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await axios.post('/categories', categoryData);
  return response.data;
};