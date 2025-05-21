import client from './axios';

// Datos de respaldo para proveedores
const MOCK_SUPPLIERS = [
  { 
    id: 1, 
    name: 'Proveedor Nacional', 
    email: 'contacto@proveedornacional.com', 
    phone: '555-1234-5678',
    address: 'Calle Principal 123',
    status: 'active',
    tax_id: 'ABC123456789'
  },
  { 
    id: 2, 
    name: 'Distribuidora Internacional', 
    email: 'ventas@distribuidorainternacional.com',
    phone: '555-8765-4321',
    address: 'Avenida Comercial 456',
    status: 'active',
    tax_id: 'XYZ987654321'
  }
];

// Datos de respaldo para órdenes de compra
const MOCK_PURCHASE_ORDERS = [
  {
    id: 101,
    order_number: 'PO-2023-001',
    supplier_id: 1,
    supplier_name: 'Proveedor Nacional',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    total_amount: 1250.50,
    items: [
      { product_id: 1, product_name: 'Producto A', quantity: 10, unit_price: 45.5 },
      { product_id: 2, product_name: 'Producto B', quantity: 15, unit_price: 35.0 }
    ]
  },
  {
    id: 102,
    order_number: 'PO-2023-002',
    supplier_id: 2,
    supplier_name: 'Distribuidora Internacional',
    order_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expected_delivery_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'received',
    total_amount: 2780.25,
    items: [
      { product_id: 3, product_name: 'Producto C', quantity: 20, unit_price: 65.75 },
      { product_id: 4, product_name: 'Producto D', quantity: 8, unit_price: 120.0 }
    ]
  }
];

// Función auxiliar para retrasos (usar en reintentos)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Crea una respuesta con datos de respaldo
 * @param {any} mockData - Datos de respaldo a utilizar
 * @param {string} [errorMsg] - Mensaje de error opcional
 * @returns {Object} Respuesta simulada con datos de respaldo
 */
const createFallbackResponse = (mockData, errorMsg = null) => {
  return {
    data: Array.isArray(mockData) 
      ? { items: mockData, total: mockData.length } 
      : mockData,
    headers: { 
      'x-fallback-data': 'true',
      ...(errorMsg ? { 'x-error': errorMsg } : {})
    },
    status: 200,
    statusText: 'OK (Fallback)'
  };
};

// Función auxiliar para manejar errores y reintentos
const safeApiCall = async (apiCall, mockData, maxRetries = 2, ...args) => {
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      // Configuración de timeout progresivamente más corto en reintentos
      const config = { 
        timeout: retries === 0 ? 30000 : 15000 - (retries * 5000), // 30s → 15s → 10s → 5s
      };
      
      // Usar los argumentos pasados explícitamente
      const response = await apiCall(...args, config);
      
      return response;
    } catch (error) {
      retries++;
      console.warn(`Intento ${retries}/${maxRetries + 1} fallido:`, error.message);
      
      // Determinar si es un error de red/timeout
      const isNetworkError = error.code === 'ECONNABORTED' || !error.response;
      
      // Si es el último intento o error de red en el segundo intento, usar datos de respaldo
      if (retries > maxRetries || (isNetworkError && retries >= 2)) {
        console.warn('Usando datos de respaldo debido a problemas de conexión');
        return createFallbackResponse(mockData, error.message);
      }
      
      // Si es un error HTTP (no de red), solo reintentamos errores 5xx (error del servidor)
      if (error.response && error.response.status < 500) {
        throw error; // No reintentar errores 4xx
      }
      
      // Esperar antes de reintentar (backoff exponencial más corto)
      const waitTime = 500 * Math.pow(1.5, retries - 1);
      console.log(`Esperando ${waitTime}ms antes del siguiente intento...`);
      await delay(waitTime);
    }
  }
  
  // Si llegamos aquí, devolver respuesta de fallback por seguridad
  return createFallbackResponse(mockData, 'Máximo de reintentos alcanzado');
};

// Proveedores
export const fetchSuppliers = async (params) => {
  try {
    return await safeApiCall(
      (params, config) => client.get('/suppliers', { ...config, params }),
      MOCK_SUPPLIERS,
      2,
      params
    );
  } catch (error) {
    console.error('Error crítico en fetchSuppliers:', error);
    return createFallbackResponse(MOCK_SUPPLIERS, error.message);
  }
};

export const fetchSupplierById = async (id) => {
  try {
    return await safeApiCall(
      (id, config) => client.get(`/suppliers/${id}`, config),
      MOCK_SUPPLIERS.find(s => s.id === Number(id)) || MOCK_SUPPLIERS[0],
      1,
      id
    );
  } catch (error) {
    console.error(`Error crítico en fetchSupplierById(${id}):`, error);
    return createFallbackResponse(
      MOCK_SUPPLIERS.find(s => s.id === Number(id)) || MOCK_SUPPLIERS[0],
      error.message
    );
  }
};

export const createSupplier = async (supplierData) => {
  try {
    return await client.post('/suppliers', supplierData);
  } catch (error) {
    console.error('Error en createSupplier:', error);
    throw error;
  }
};

export const updateSupplier = async (id, supplierData) => {
  try {
    return await client.put(`/suppliers/${id}`, supplierData);
  } catch (error) {
    console.error(`Error en updateSupplier(${id}):`, error);
    throw error;
  }
};

export const deleteSupplier = async (id) => {
  try {
    return await client.delete(`/suppliers/${id}`);
  } catch (error) {
    console.error(`Error en deleteSupplier(${id}):`, error);
    throw error;
  }
};

// Órdenes de compra
export const fetchPurchaseOrders = async (params) => {
  try {
    return await safeApiCall(
      (params, config) => client.get('/purchase-orders', { ...config, params }),
      MOCK_PURCHASE_ORDERS,
      2,
      params
    );
  } catch (error) {
    console.error('Error crítico en fetchPurchaseOrders:', error);
    return createFallbackResponse(MOCK_PURCHASE_ORDERS, error.message);
  }
};

export const fetchPurchaseOrderById = async (id) => {
  try {
    return await safeApiCall(
      (id, config) => client.get(`/purchase-orders/${id}`, config),
      MOCK_PURCHASE_ORDERS.find(po => po.id === Number(id)) || MOCK_PURCHASE_ORDERS[0],
      1,
      id
    );
  } catch (error) {
    console.error(`Error crítico en fetchPurchaseOrderById(${id}):`, error);
    return createFallbackResponse(
      MOCK_PURCHASE_ORDERS.find(po => po.id === Number(id)) || MOCK_PURCHASE_ORDERS[0],
      error.message
    );
  }
};

export const createPurchaseOrder = async (orderData) => {
  try {
    return await client.post('/purchase-orders', orderData);
  } catch (error) {
    console.error('Error en createPurchaseOrder:', error);
    throw error;
  }
};

export const updatePurchaseOrder = async (id, orderData) => {
  try {
    return await client.put(`/purchase-orders/${id}`, orderData);
  } catch (error) {
    console.error(`Error en updatePurchaseOrder(${id}):`, error);
    throw error;
  }
};

export const deletePurchaseOrder = async (id) => {
  try {
    return await client.delete(`/purchase-orders/${id}`);
  } catch (error) {
    console.error(`Error en deletePurchaseOrder(${id}):`, error);
    throw error;
  }
};

// Recepción de mercancía
export const receiveInventory = async (orderId, receivedItems) => {
  try {
    return await client.post(`/purchase-orders/${orderId}/receive`, receivedItems);
  } catch (error) {
    console.error(`Error en receiveInventory(${orderId}):`, error);
    throw error;
  }
};

export const fetchPurchaseOrderHistory = async (supplierId) => {
  try {
    return await safeApiCall(
      (supplierId, config) => client.get(`/suppliers/${supplierId}/purchase-history`, config),
      MOCK_PURCHASE_ORDERS.filter(po => po.supplier_id === Number(supplierId)),
      1,
      supplierId
    );
  } catch (error) {
    console.error(`Error crítico en fetchPurchaseOrderHistory(${supplierId}):`, error);
    return createFallbackResponse(
      MOCK_PURCHASE_ORDERS.filter(po => po.supplier_id === Number(supplierId)),
      error.message
    );
  }
};