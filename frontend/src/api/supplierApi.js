import client from './axios';

// Proveedores
export const fetchSuppliers = async (params) => {
  return await client.get('/suppliers', { params });
};

export const fetchSupplierById = async (id) => {
  return await client.get(`/suppliers/${id}`);
};

export const createSupplier = async (supplierData) => {
  return await client.post('/suppliers', supplierData);
};

export const updateSupplier = async (id, supplierData) => {
  return await client.put(`/suppliers/${id}`, supplierData);
};

export const deleteSupplier = async (id) => {
  return await client.delete(`/suppliers/${id}`);
};

// Órdenes de compra
export const fetchPurchaseOrders = async (params) => {
  return await client.get('/purchase-orders', { params });
};

export const fetchPurchaseOrderById = async (id) => {
  return await client.get(`/purchase-orders/${id}`);
};

export const createPurchaseOrder = async (orderData) => {
  return await client.post('/purchase-orders', orderData);
};

export const updatePurchaseOrder = async (id, orderData) => {
  return await client.put(`/purchase-orders/${id}`, orderData);
};

export const deletePurchaseOrder = async (id) => {
  return await client.delete(`/purchase-orders/${id}`);
};

// Recepción de mercancía
export const receiveInventory = async (orderId, receivedItems) => {
  return await client.post(`/purchase-orders/${orderId}/receive`, receivedItems);
};

export const fetchPurchaseOrderHistory = async (supplierId) => {
  return await client.get(`/suppliers/${supplierId}/purchase-history`);
};