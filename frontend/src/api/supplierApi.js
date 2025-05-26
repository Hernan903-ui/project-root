import client from './axios';

/**
 * Datos simulados para desarrollo cuando la API no está disponible
 */
const MOCK_SUPPLIERS = [
  {
    id: 1,
    name: "Distribuidora ABC",
    contact_person: "Juan Pérez",
    email: "juan@distribuidoraabc.com",
    phone: "+1234567890",
    address: "Calle Principal 123",
    city: "Ciudad Ejemplo",
    country: "País Ejemplo",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Suministros XYZ",
    contact_person: "María Gómez",
    email: "maria@suministrosxyz.com",
    phone: "+0987654321",
    address: "Avenida Central 456",
    city: "Otra Ciudad",
    country: "Otro País",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

/**
 * Configuración para habilitar o deshabilitar funciones
 */
const CONFIG = {
  // Usar datos simulados cuando la API devuelve 404 o está inaccesible
  USE_MOCK_DATA: process.env.NODE_ENV === 'development',
  // Intentar rutas alternativas en caso de 404
  TRY_ALTERNATIVE_ROUTES: true,
  // Número máximo de reintentos para llamadas a la API
  MAX_RETRIES: 2,
  // Posibles rutas alternativas para el endpoint de suppliers
  ALTERNATIVE_ROUTES: ['supplier', 'providers', 'vendors', 'proveedores']
};

/**
 * Función auxiliar para retrasos (usar en reintentos)
 * @param {number} ms - Tiempo en milisegundos para esperar
 * @returns {Promise} - Promesa que se resuelve después del tiempo especificado
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Función auxiliar para manejar errores y reintentos en llamadas a la API
 * @param {Function} apiCall - Función que realiza la llamada a la API
 * @param {number} maxRetries - Número máximo de reintentos (por defecto 2)
 * @param {...any} args - Argumentos para pasar a la función apiCall
 * @returns {Promise} - Respuesta de la API o error después de los reintentos
 */
const safeApiCall = async (apiCall, maxRetries = CONFIG.MAX_RETRIES, ...args) => {
  let retries = 0;
  let lastError = null;
  
  // Logging inicial
  console.log(`Iniciando safeApiCall con maxRetries=${maxRetries}`, { args });
  
  while (retries <= maxRetries) {
    try {
      // Configuración de timeout progresivamente más corto en reintentos
      const config = { 
        timeout: retries === 0 ? 30000 : 15000 - (retries * 5000), // 30s → 15s → 10s → 5s
      };
      
      // Usar los argumentos pasados explícitamente
      console.log(`Intento ${retries + 1}/${maxRetries + 1} con timeout=${config.timeout}ms`);
      const response = await apiCall(...args, config);
      
      // Verificar que la respuesta es válida
      if (!response) {
        throw new Error('Respuesta vacía del servidor');
      }
      
      console.log(`Intento ${retries + 1} exitoso:`, {
        status: response.status,
        hasData: !!response.data,
        dataType: typeof response.data
      });
      
      return response;
    } catch (error) {
      retries++;
      lastError = error;
      console.warn(`Intento ${retries}/${maxRetries + 1} fallido:`, error.message);
      
      // Si es el último intento, no esperamos más
      if (retries > maxRetries) {
        console.error('Se agotaron los reintentos, propagando error:', error);
        throw error;
      }
      
      // Si es un error HTTP (no de red), solo reintentamos errores 5xx (error del servidor)
      if (error.response && error.response.status < 500) {
        console.log(`Error de cliente (4xx), no se reintentará: ${error.response.status}`);
        throw error; // No reintentar errores 4xx
      }
      
      // Esperar antes de reintentar (backoff exponencial más corto)
      const waitTime = 500 * Math.pow(1.5, retries - 1);
      console.log(`Esperando ${waitTime}ms antes del siguiente intento...`);
      await delay(waitTime);
    }
  }
  
  // Este código no debería ejecutarse nunca porque en el último intento 
  // se lanza una excepción, pero lo dejamos por seguridad
  throw lastError || new Error('Error desconocido en safeApiCall');
};

/**
 * Función para simular respuesta exitosa con datos mock
 * @param {Object} data - Datos a incluir en la respuesta simulada
 * @param {number} status - Código de estado HTTP (por defecto 200)
 * @param {string} statusText - Texto del estado HTTP
 * @returns {Object} - Objeto con estructura de respuesta Axios
 */
const createMockResponse = (data, status = 200, statusText = 'OK (Mock)') => {
  return {
    data,
    status,
    statusText,
    headers: {},
    config: {},
  };
};

/**
 * Obtiene lista de proveedores con paginación y filtros opcionales
 * @param {Object} params - Parámetros de consulta (page, limit, search, etc.)
 * @returns {Promise} - Respuesta de la API
 */
export const fetchSuppliers = async (params = {}) => {
  try {
    console.log('fetchSuppliers iniciado con params:', params);
    // Primero intentamos con la ruta normal
    const response = await safeApiCall(
      (params, config) => client.get('/suppliers/', { ...config, params }),
      CONFIG.MAX_RETRIES,
      params
    );
    console.log('fetchSuppliers completado con éxito');
    return response;
  } catch (error) {
    console.error('Error crítico en fetchSuppliers:', error);
    
    // Si el error es 404 y CONFIG.TRY_ALTERNATIVE_ROUTES está habilitado, intentar rutas alternativas
    if (error.response?.status === 404 && CONFIG.TRY_ALTERNATIVE_ROUTES) {
      try {
        console.log('Intentando rutas alternativas para suppliers');
        for (const route of CONFIG.ALTERNATIVE_ROUTES) {
          try {
            console.log(`Probando ruta alternativa: /${route}/`);
            const altResponse = await client.get(`/${route}/`, { params });
            console.log(`Ruta alternativa exitosa: /${route}/`);
            return altResponse;
          } catch (altError) {
            console.warn(`Ruta alternativa fallida: /${route}/`);
          }
        }
      } catch (altError) {
        console.error('Todas las rutas alternativas fallaron');
      }
    }
    
    // Si el error es 404 o error de conexión y estamos en desarrollo, usar datos simulados
    if ((error.response?.status === 404 || error.code === 'ECONNABORTED' || error.message.includes('Network Error')) && 
        CONFIG.USE_MOCK_DATA) {
      console.log('Usando datos simulados para suppliers');
      
      // Simular paginación
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      // Filtrar por nombre si se proporciona
      let filteredData = [...MOCK_SUPPLIERS];
      if (params.name) {
        const searchTerm = params.name.toLowerCase();
        filteredData = filteredData.filter(s => 
          s.name.toLowerCase().includes(searchTerm)
        );
      }
      
      // Simular la estructura de respuesta paginada
      const paginatedData = {
        items: filteredData.slice(startIndex, endIndex),
        total: filteredData.length,
        page,
        limit,
        pages: Math.ceil(filteredData.length / limit)
      };
      
      return createMockResponse(paginatedData);
    }
    
    // Si el error es 404 y no estamos usando datos simulados, devolver array vacío con estructura correcta
    if (error.response && error.response.status === 404) {
      console.log('La ruta de proveedores no existe, devolviendo estructura vacía');
      return createMockResponse({ 
        items: [], 
        total: 0, 
        page: params.page || 1,
        limit: params.limit || 10,
        pages: 0
      }, 200, 'OK (Empty)');
    }
    
    throw error;
  }
};

/**
 * Obtiene detalles de un proveedor por su ID
 * @param {string|number} id - ID del proveedor
 * @returns {Promise} - Respuesta de la API
 */
export const fetchSupplierById = async (id) => {
  if (!id) {
    console.error('fetchSupplierById: ID no proporcionado');
    throw new Error('ID de proveedor requerido');
  }
  
  try {
    console.log(`fetchSupplierById iniciado para id=${id}`);
    const response = await safeApiCall(
      (id, config) => client.get(`/suppliers/${id}/`, config),
      1,
      id
    );
    console.log(`fetchSupplierById completado para id=${id}`);
    return response;
  } catch (error) {
    console.error(`Error crítico en fetchSupplierById(${id}):`, error);
    
    // Si el error es 404 y CONFIG.TRY_ALTERNATIVE_ROUTES está habilitado, intentar rutas alternativas
    if (error.response?.status === 404 && CONFIG.TRY_ALTERNATIVE_ROUTES) {
      for (const route of CONFIG.ALTERNATIVE_ROUTES) {
        try {
          console.log(`Probando ruta alternativa: /${route}/${id}/`);
          const altResponse = await client.get(`/${route}/${id}/`);
          console.log(`Ruta alternativa exitosa: /${route}/${id}/`);
          return altResponse;
        } catch (altError) {
          console.warn(`Ruta alternativa fallida: /${route}/${id}/`);
        }
      }
    }
    
    // Si el error es 404 y estamos en desarrollo, buscar en datos simulados
    if (error.response?.status === 404 && CONFIG.USE_MOCK_DATA) {
      const mockSupplier = MOCK_SUPPLIERS.find(s => s.id == id);
      if (mockSupplier) {
        console.log(`Usando datos simulados para supplier id=${id}`);
        return createMockResponse(mockSupplier);
      } else {
        throw new Error(`Proveedor con ID ${id} no encontrado`);
      }
    }
    
    throw error;
  }
};

/**
 * Crea un nuevo proveedor
 * @param {Object} supplierData - Datos del proveedor a crear
 * @returns {Promise} - Respuesta de la API
 */
export const createSupplier = async (supplierData) => {
  if (!supplierData || typeof supplierData !== 'object') {
    console.error('createSupplier: Datos inválidos', supplierData);
    throw new Error('Datos de proveedor inválidos');
  }
  
  try {
    console.log('createSupplier iniciado con datos:', supplierData);
    const response = await client.post('/suppliers/', supplierData);
    console.log('createSupplier completado, proveedor creado con ID:', response.data?.id);
    return response;
  } catch (error) {
    console.error('Error en createSupplier:', error);
    
    // Si hay un error 404, intentar rutas alternativas
    if (error.response?.status === 404 && CONFIG.TRY_ALTERNATIVE_ROUTES) {
      for (const route of CONFIG.ALTERNATIVE_ROUTES) {
        try {
          console.log(`Probando ruta alternativa para crear: /${route}/`);
          const altResponse = await client.post(`/${route}/`, supplierData);
          console.log(`Ruta alternativa exitosa: /${route}/`);
          return altResponse;
        } catch (altError) {
          console.warn(`Ruta alternativa fallida: /${route}/`);
        }
      }
    }
    
    // Si hay un error de conexión y estamos en modo desarrollo, simular creación
    if ((error.code === 'ECONNABORTED' || error.message.includes('Network Error') || error.response?.status === 404) && 
        CONFIG.USE_MOCK_DATA) {
      
      console.log('Simulando creación de proveedor en modo desarrollo');
      // Crear un nuevo ID simulado (mayor que el último)
      const newId = Math.max(0, ...MOCK_SUPPLIERS.map(s => s.id)) + 1;
      
      // Crear objeto simulado con timestamps
      const newSupplier = {
        ...supplierData,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: supplierData.status || 'active'
      };
      
      // Añadir a la lista simulada
      MOCK_SUPPLIERS.push(newSupplier);
      
      return createMockResponse(newSupplier, 201, 'Created (Mock)');
    }
    
    throw error;
  }
};

/**
 * Actualiza un proveedor existente
 * @param {string|number} id - ID del proveedor a actualizar
 * @param {Object} supplierData - Nuevos datos del proveedor
 * @returns {Promise} - Respuesta de la API
 */
export const updateSupplier = async (id, supplierData) => {
  if (!id) {
    console.error('updateSupplier: ID no proporcionado');
    throw new Error('ID de proveedor requerido');
  }
  
  if (!supplierData || typeof supplierData !== 'object') {
    console.error('updateSupplier: Datos inválidos', supplierData);
    throw new Error('Datos de proveedor inválidos');
  }
  
  try {
    console.log(`updateSupplier iniciado para id=${id} con datos:`, supplierData);
    const response = await client.put(`/suppliers/${id}/`, supplierData);
    console.log(`updateSupplier completado para id=${id}`);
    return response;
  } catch (error) {
    console.error(`Error en updateSupplier(${id}):`, error);
    
    // Si hay un error 404, intentar rutas alternativas
    if (error.response?.status === 404 && CONFIG.TRY_ALTERNATIVE_ROUTES) {
      for (const route of CONFIG.ALTERNATIVE_ROUTES) {
        try {
          console.log(`Probando ruta alternativa para actualizar: /${route}/${id}/`);
          const altResponse = await client.put(`/${route}/${id}/`, supplierData);
          console.log(`Ruta alternativa exitosa: /${route}/${id}/`);
          return altResponse;
        } catch (altError) {
          console.warn(`Ruta alternativa fallida: /${route}/${id}/`);
        }
      }
    }
    
    // Si hay un error de conexión y estamos en modo desarrollo, simular actualización
    if ((error.code === 'ECONNABORTED' || error.message.includes('Network Error') || error.response?.status === 404) && 
        CONFIG.USE_MOCK_DATA) {
      
      console.log(`Simulando actualización de proveedor id=${id} en modo desarrollo`);
      // Buscar el proveedor en los datos simulados
      const index = MOCK_SUPPLIERS.findIndex(s => s.id == id);
      
      if (index !== -1) {
        // Actualizar el proveedor simulado
        MOCK_SUPPLIERS[index] = {
          ...MOCK_SUPPLIERS[index],
          ...supplierData,
          updated_at: new Date().toISOString()
        };
        
        return createMockResponse(MOCK_SUPPLIERS[index]);
      } else {
        throw new Error(`Proveedor con ID ${id} no encontrado en datos simulados`);
      }
    }
    
    throw error;
  }
};

/**
 * Elimina un proveedor
 * @param {string|number} id - ID del proveedor a eliminar
 * @returns {Promise} - Respuesta de la API
 */
export const deleteSupplier = async (id) => {
  if (!id) {
    console.error('deleteSupplier: ID no proporcionado');
    throw new Error('ID de proveedor requerido');
  }
  
  try {
    console.log(`deleteSupplier iniciado para id=${id}`);
    const response = await client.delete(`/suppliers/${id}/`);
    console.log(`deleteSupplier completado para id=${id}`);
    return response;
  } catch (error) {
    console.error(`Error en deleteSupplier(${id}):`, error);
    
        // Si hay un error 404, intentar rutas alternativas
    if (error.response?.status === 404 && CONFIG.TRY_ALTERNATIVE_ROUTES) {
      for (const route of CONFIG.ALTERNATIVE_ROUTES) {
        try {
          console.log(`Probando ruta alternativa para eliminar: /${route}/${id}/`);
          const altResponse = await client.delete(`/${route}/${id}/`);
          console.log(`Ruta alternativa exitosa: /${route}/${id}/`);
          return altResponse;
        } catch (altError) {
          console.warn(`Ruta alternativa fallida: /${route}/${id}/`);
        }
      }
    }
    
    // Si hay un error de conexión y estamos en modo desarrollo, simular eliminación
    if ((error.code === 'ECONNABORTED' || error.message.includes('Network Error') || error.response?.status === 404) && 
        CONFIG.USE_MOCK_DATA) {
      
      console.log(`Simulando eliminación de proveedor id=${id} en modo desarrollo`);
      // Buscar el proveedor en los datos simulados
      const index = MOCK_SUPPLIERS.findIndex(s => s.id == id);
      
      if (index !== -1) {
        // Eliminar el proveedor simulado
        MOCK_SUPPLIERS.splice(index, 1);
        
        return createMockResponse({ success: true, id }, 204, 'No Content (Mock)');
      } else {
        throw new Error(`Proveedor con ID ${id} no encontrado en datos simulados`);
      }
    }
    
    throw error;
  }
};

/**
 * Obtiene lista de órdenes de compra con paginación y filtros opcionales
 * @param {Object} params - Parámetros de consulta (page, limit, supplier_id, etc.)
 * @returns {Promise} - Respuesta de la API
 */
export const fetchPurchaseOrders = async (params = {}) => {
  try {
    console.log('fetchPurchaseOrders iniciado con params:', params);
    const response = await safeApiCall(
      (params, config) => client.get('/purchase-orders/', { ...config, params }),
      CONFIG.MAX_RETRIES,
      params
    );
    console.log('fetchPurchaseOrders completado con éxito');
    return response;
  } catch (error) {
    console.error('Error crítico en fetchPurchaseOrders:', error);
    
    // Si el error es 404, intentar rutas alternativas para órdenes de compra
    if (error.response?.status === 404 && CONFIG.TRY_ALTERNATIVE_ROUTES) {
      const alternativeOrderRoutes = ['purchase-order', 'orders', 'purchase_orders', 'orders/purchase'];
      
      for (const route of alternativeOrderRoutes) {
        try {
          console.log(`Probando ruta alternativa: /${route}/`);
          const altResponse = await client.get(`/${route}/`, { params });
          console.log(`Ruta alternativa exitosa: /${route}/`);
          return altResponse;
        } catch (altError) {
          console.warn(`Ruta alternativa fallida: /${route}/`);
        }
      }
    }
    
    // Si el error es 404, devolvemos un array vacío con estructura correcta
    if (error.response && error.response.status === 404) {
      console.log('La ruta de órdenes no existe, devolviendo estructura vacía');
      return createMockResponse({ 
        items: [], 
        total: 0, 
        page: params.page || 1,
        limit: params.limit || 10,
        pages: 0
      }, 200, 'OK (Empty)');
    }
    
    throw error;
  }
};

/**
 * Obtiene detalles de una orden de compra por su ID
 * @param {string|number} id - ID de la orden
 * @returns {Promise} - Respuesta de la API
 */
export const fetchPurchaseOrderById = async (id) => {
  if (!id) {
    console.error('fetchPurchaseOrderById: ID no proporcionado');
    throw new Error('ID de orden requerido');
  }
  
  try {
    console.log(`fetchPurchaseOrderById iniciado para id=${id}`);
    const response = await safeApiCall(
      (id, config) => client.get(`/purchase-orders/${id}/`, config),
      1,
      id
    );
    console.log(`fetchPurchaseOrderById completado para id=${id}`);
    return response;
  } catch (error) {
    console.error(`Error crítico en fetchPurchaseOrderById(${id}):`, error);
    
    // Si el error es 404, intentar rutas alternativas
    if (error.response?.status === 404 && CONFIG.TRY_ALTERNATIVE_ROUTES) {
      const alternativeOrderRoutes = ['purchase-order', 'orders', 'purchase_orders', 'orders/purchase'];
      
      for (const route of alternativeOrderRoutes) {
        try {
          console.log(`Probando ruta alternativa: /${route}/${id}/`);
          const altResponse = await client.get(`/${route}/${id}/`);
          console.log(`Ruta alternativa exitosa: /${route}/${id}/`);
          return altResponse;
        } catch (altError) {
          console.warn(`Ruta alternativa fallida: /${route}/${id}/`);
        }
      }
    }
    
    throw error;
  }
};

/**
 * Crea una nueva orden de compra
 * @param {Object} orderData - Datos de la orden a crear
 * @returns {Promise} - Respuesta de la API
 */
export const createPurchaseOrder = async (orderData) => {
  if (!orderData || typeof orderData !== 'object') {
    console.error('createPurchaseOrder: Datos inválidos', orderData);
    throw new Error('Datos de orden inválidos');
  }
  
  if (!orderData.supplier_id) {
    console.error('createPurchaseOrder: ID de proveedor no proporcionado');
    throw new Error('ID de proveedor requerido para crear orden');
  }
  
  try {
    console.log('createPurchaseOrder iniciado con datos:', orderData);
    const response = await client.post('/purchase-orders/', orderData);
    console.log('createPurchaseOrder completado, orden creada con ID:', response.data?.id);
    return response;
  } catch (error) {
    console.error('Error en createPurchaseOrder:', error);
    
    // Si el error es 404, intentar rutas alternativas
    if (error.response?.status === 404 && CONFIG.TRY_ALTERNATIVE_ROUTES) {
      const alternativeOrderRoutes = ['purchase-order', 'orders', 'purchase_orders', 'orders/purchase'];
      
      for (const route of alternativeOrderRoutes) {
        try {
          console.log(`Probando ruta alternativa para crear orden: /${route}/`);
          const altResponse = await client.post(`/${route}/`, orderData);
          console.log(`Ruta alternativa exitosa: /${route}/`);
          return altResponse;
        } catch (altError) {
          console.warn(`Ruta alternativa fallida: /${route}/`);
        }
      }
    }
    
    throw error;
  }
};

/**
 * Actualiza una orden de compra existente
 * @param {string|number} id - ID de la orden a actualizar
 * @param {Object} orderData - Nuevos datos de la orden
 * @returns {Promise} - Respuesta de la API
 */
export const updatePurchaseOrder = async (id, orderData) => {
  if (!id) {
    console.error('updatePurchaseOrder: ID no proporcionado');
    throw new Error('ID de orden requerido');
  }
  
  if (!orderData || typeof orderData !== 'object') {
    console.error('updatePurchaseOrder: Datos inválidos', orderData);
    throw new Error('Datos de orden inválidos');
  }
  
  try {
    console.log(`updatePurchaseOrder iniciado para id=${id} con datos:`, orderData);
    const response = await client.put(`/purchase-orders/${id}/`, orderData);
    console.log(`updatePurchaseOrder completado para id=${id}`);
    return response;
  } catch (error) {
    console.error(`Error en updatePurchaseOrder(${id}):`, error);
    
    // Si el error es 404, intentar rutas alternativas
    if (error.response?.status === 404 && CONFIG.TRY_ALTERNATIVE_ROUTES) {
      const alternativeOrderRoutes = ['purchase-order', 'orders', 'purchase_orders', 'orders/purchase'];
      
      for (const route of alternativeOrderRoutes) {
        try {
          console.log(`Probando ruta alternativa para actualizar orden: /${route}/${id}/`);
          const altResponse = await client.put(`/${route}/${id}/`, orderData);
          console.log(`Ruta alternativa exitosa: /${route}/${id}/`);
          return altResponse;
        } catch (altError) {
          console.warn(`Ruta alternativa fallida: /${route}/${id}/`);
        }
      }
    }
    
    throw error;
  }
};

/**
 * Elimina una orden de compra
 * @param {string|number} id - ID de la orden a eliminar
 * @returns {Promise} - Respuesta de la API
 */
export const deletePurchaseOrder = async (id) => {
  if (!id) {
    console.error('deletePurchaseOrder: ID no proporcionado');
    throw new Error('ID de orden requerido');
  }
  
  try {
    console.log(`deletePurchaseOrder iniciado para id=${id}`);
    const response = await client.delete(`/purchase-orders/${id}/`);
    console.log(`deletePurchaseOrder completado para id=${id}`);
    return response;
  } catch (error) {
    console.error(`Error en deletePurchaseOrder(${id}):`, error);
    
    // Si el error es 404, intentar rutas alternativas
    if (error.response?.status === 404 && CONFIG.TRY_ALTERNATIVE_ROUTES) {
      const alternativeOrderRoutes = ['purchase-order', 'orders', 'purchase_orders', 'orders/purchase'];
      
      for (const route of alternativeOrderRoutes) {
        try {
          console.log(`Probando ruta alternativa para eliminar orden: /${route}/${id}/`);
          const altResponse = await client.delete(`/${route}/${id}/`);
          console.log(`Ruta alternativa exitosa: /${route}/${id}/`);
          return altResponse;
        } catch (altError) {
          console.warn(`Ruta alternativa fallida: /${route}/${id}/`);
        }
      }
    }
    
    throw error;
  }
};

/**
 * Registra la recepción de mercancía para una orden de compra
 * @param {string|number} orderId - ID de la orden
 * @param {Object} receivedItems - Datos de los ítems recibidos
 * @returns {Promise} - Respuesta de la API
 */
export const receiveInventory = async (orderId, receivedItems) => {
  if (!orderId) {
    console.error('receiveInventory: ID de orden no proporcionado');
    throw new Error('ID de orden requerido');
  }
  
  if (!receivedItems || typeof receivedItems !== 'object') {
    console.error('receiveInventory: Datos inválidos', receivedItems);
    throw new Error('Datos de recepción inválidos');
  }
  
  try {
    console.log(`receiveInventory iniciado para orden=${orderId} con datos:`, receivedItems);
    const response = await client.post(`/purchase-orders/${orderId}/receive/`, receivedItems);
    console.log(`receiveInventory completado para orden=${orderId}`);
    return response;
  } catch (error) {
    console.error(`Error en receiveInventory(${orderId}):`, error);
    
    // Si el error es 404, intentar rutas alternativas
    if (error.response?.status === 404 && CONFIG.TRY_ALTERNATIVE_ROUTES) {
      const alternativeOrderRoutes = [
        `/purchase-order/${orderId}/receive/`, 
        `/orders/${orderId}/receive/`, 
        `/purchase_orders/${orderId}/receive/`,
        `/purchase-orders/${orderId}/receive-inventory/`
      ];
      
      for (const route of alternativeOrderRoutes) {
        try {
          console.log(`Probando ruta alternativa para recibir inventario: ${route}`);
          const altResponse = await client.post(route, receivedItems);
          console.log(`Ruta alternativa exitosa: ${route}`);
          return altResponse;
        } catch (altError) {
          console.warn(`Ruta alternativa fallida: ${route}`);
        }
      }
    }
    
    throw error;
  }
};

/**
 * Obtiene el historial de órdenes de un proveedor
 * @param {string|number} supplierId - ID del proveedor
 * @returns {Promise} - Respuesta de la API
 */
export const fetchPurchaseOrderHistory = async (supplierId) => {
  if (!supplierId) {
    console.error('fetchPurchaseOrderHistory: ID de proveedor no proporcionado');
    throw new Error('ID de proveedor requerido');
  }
  
  try {
    console.log(`fetchPurchaseOrderHistory iniciado para proveedor=${supplierId}`);
    const response = await safeApiCall(
      (supplierId, config) => client.get(`/suppliers/${supplierId}/purchase-history/`, config),
      1,
      supplierId
    );
    console.log(`fetchPurchaseOrderHistory completado para proveedor=${supplierId}`);
    return response;
  } catch (error) {
    console.error(`Error crítico en fetchPurchaseOrderHistory(${supplierId}):`, error);
    
    // Si el error es 404, intentar rutas alternativas
    if (error.response?.status === 404 && CONFIG.TRY_ALTERNATIVE_ROUTES) {
      const alternativeRoutes = [
        `/purchase-orders/supplier/${supplierId}/`, 
        `/orders/supplier/${supplierId}/`,
        `/suppliers/${supplierId}/orders/`
      ];
      
      for (const route of alternativeRoutes) {
        try {
          console.log(`Probando ruta alternativa para historial: ${route}`);
          const altResponse = await client.get(route);
          console.log(`Ruta alternativa exitosa: ${route}`);
          return altResponse;
        } catch (altError) {
          console.warn(`Ruta alternativa fallida: ${route}`);
        }
      }
    }
    
    // Si el error es 404 y estamos en desarrollo, devolver array vacío
    if (error.response?.status === 404 && CONFIG.USE_MOCK_DATA) {
      return createMockResponse([]);
    }
    
    throw error;
  }
};

/**
 * Verifica la conectividad con el servidor de la API
 * @returns {Promise<boolean>} - true si hay conexión, false si no
 */
export const checkApiConnectivity = async () => {
  try {
    console.log('Verificando conectividad con la API...');
    const response = await client.get('/health-check/', { timeout: 5000 });
    console.log('Conexión exitosa con la API', response.status);
    return true;
  } catch (error) {
    console.error('Error de conexión con la API:', error.message);
    return false;
  }
};

// Exportación de todas las funciones
export default {
  fetchSuppliers,
  fetchSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  fetchPurchaseOrders,
  fetchPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  receiveInventory,
  fetchPurchaseOrderHistory,
  checkApiConnectivity
};