import axiosInstance, { isInOfflineMode } from './axios';

// Función para transformar los clientes y asegurar compatibilidad
// This function is now potentially used within the API calls if needed
const transformCustomer = (customer) => {
  if (!customer) return null;

  // Si el cliente ya tiene una propiedad name, devolverlo sin cambios
  if (customer.name) return customer;

  // Si no tiene name pero tiene firstName y/o lastName, crear la propiedad name
  if (customer.firstName || customer.lastName) {
    return {
      ...customer,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
    };
  }

  return customer;
};

// Modifica los datos de respaldo para incluir el campo 'name'
const MOCK_CUSTOMERS = [
  {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    name: 'Juan Pérez', // Agregamos el campo name para compatibilidad
    email: 'juan.perez@ejemplo.com',
    phone: '555-123-4567',
    address: 'Calle Principal 123',
    city: 'Ciudad Ejemplo',
    postalCode: '12345',
    totalPurchases: 12,
    lastPurchaseDate: '2023-06-15',
    status: 'active',
    type: 'individual' // Añadido para compatibilidad
  },
]

// Datos de respaldo para historial de compras
const MOCK_PURCHASE_HISTORY = [
  {
    id: 101,
    customerId: 1,
    orderDate: '2023-06-15',
    total: 1250.75,
    status: 'completed',
    items: [
      { productId: 1, productName: 'Laptop', quantity: 1, price: 999.99 },
      { productId: 5, productName: 'Mouse', quantity: 1, price: 25.99 },
      { productId: 8, productName: 'Teclado', quantity: 1, price: 49.99 }
    ]
  },
  {
    id: 102,
    customerId: 1,
    orderDate: '2023-05-20',
    total: 599.99,
    status: 'completed',
    items: [
      { productId: 3, productName: 'Monitor', quantity: 1, price: 299.99 },
      { productId: 7, productName: 'Auriculares', quantity: 1, price: 89.99 },
      { productId: 12, productName: 'Altavoces', quantity: 1, price: 129.99 }
    ]
  }
];

// Datos de respaldo para estadísticas
const MOCK_CUSTOMER_STATS = {
  totalCustomers: 247,
  activeCustomers: 198,
  inactiveCustomers: 49,
  newCustomersThisMonth: 15,
  averagePurchaseValue: 450.75,
  topSpenders: [
    { id: 1, name: 'Juan Pérez', totalSpent: 4500.50 },
    { id: 2, name: 'María González', totalSpent: 3200.25 }
  ],
  purchasesByMonth: [
    { month: 'Enero', count: 45 },
    { month: 'Febrero', count: 52 },
    { month: 'Marzo', count: 48 }
  ]
};

// Registrar información sobre el uso de datos de respaldo
const logFallbackUsage = (message) => {
  console.warn(`[FALLBACK DATA] ${message}`);

  // Opcionalmente podrías enviar esta información a un servicio de analytics
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'fallback_data_used',
      fallback_message: message
    });
  }
};

// Obtener todos los clientes
export const getCustomers = async () => {
  // Si ya estamos en modo offline, usar datos de respaldo directamente
  if (isInOfflineMode()) {
    logFallbackUsage('Modo offline activo, usando datos de respaldo para clientes');
    // Aplicar transformación a datos mock si es necesario
    return MOCK_CUSTOMERS.map(transformCustomer); // Aplicamos transformCustomer aquí
  }

  try {
    const response = await axiosInstance.get('/customers');
    // Aplicar transformación a datos recibidos del backend
    return response.data.map(transformCustomer); // Aplicamos transformCustomer aquí
  } catch (error) {
    console.error('Error al obtener clientes:', error.message);

    // Si es un error de red o timeout, devolver datos de respaldo
    if (error.code === 'ECONNABORTED' || !error.response || error.isOfflineError) {
      logFallbackUsage('Usando datos de respaldo para clientes debido a problemas de conexión');
       // Aplicar transformación a datos mock si es necesario
      return MOCK_CUSTOMERS.map(transformCustomer); // Aplicamos transformCustomer aquí
    }

    throw error;
  }
};

// Obtener un cliente por ID
export const getCustomerById = async (id) => {
  // Si ya estamos en modo offline, usar datos de respaldo directamente
  if (isInOfflineMode()) {
    logFallbackUsage(`Modo offline activo, usando datos de respaldo para cliente #${id}`);
    const customer = MOCK_CUSTOMERS.find(c => c.id === Number(id)) || MOCK_CUSTOMERS[0];
    // Aplicar transformación a datos mock
    return transformCustomer(customer); // Aplicamos transformCustomer aquí
  }

  try {
    const response = await axiosInstance.get(`/customers/${id}`);
     // Aplicar transformación a datos recibidos del backend
    return transformCustomer(response.data); // Aplicamos transformCustomer aquí
  } catch (error) {
    console.error(`Error al obtener cliente #${id}:`, error.message);

    // Si es un error de red o timeout, devolver datos de respaldo
    if (error.code === 'ECONNABORTED' || !error.response || error.isOfflineError) {
      logFallbackUsage(`Usando datos de respaldo para cliente #${id} debido a problemas de conexión`);
      const customer = MOCK_CUSTOMERS.find(c => c.id === Number(id)) || MOCK_CUSTOMERS[0];
      // Aplicar transformación a datos mock
      return transformCustomer(customer); // Aplicamos transformCustomer aquí
    }

    throw error;
  }
};

// Crear un nuevo cliente
export const createCustomer = async (customerData) => {
  // No permitir creación en modo offline
  if (isInOfflineMode()) {
    throw new Error('No se pueden crear clientes en modo sin conexión');
  }

  try {
    const response = await axiosInstance.post('/customers', customerData);
    return response.data;
  } catch (error) {
    console.error('Error al crear cliente:', error.message);
    throw error;
  }
};

// Actualizar un cliente existente
export const updateCustomer = async (id, customerData) => {
  // No permitir actualización en modo offline
  if (isInOfflineMode()) {
    throw new Error('No se pueden actualizar clientes en modo sin conexión');
  }

  try {
    const response = await axiosInstance.put(`/customers/${id}`, customerData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar cliente #${id}:`, error.message);
    throw error;
  }
};

// Eliminar un cliente
export const deleteCustomer = async (id) => {
  // No permitir eliminación en modo offline
  if (isInOfflineMode()) {
    throw new Error('No se pueden eliminar clientes en modo sin conexión');
  }

  try {
    const response = await axiosInstance.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar cliente #${id}:`, error.message);
    throw error;
  }
};

// Obtener el historial de compras de un cliente
export const getCustomerPurchaseHistory = async (id) => {
  // Si ya estamos en modo offline, usar datos de respaldo directamente
  if (isInOfflineMode()) {
    logFallbackUsage(`Modo offline activo, usando datos de respaldo para historial de compras del cliente #${id}`);
    return MOCK_PURCHASE_HISTORY.filter(h => h.customerId === Number(id));
  }

  try {
    const response = await axiosInstance.get(`/sales/customer/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener historial de compras del cliente #${id}:`, error.message);

    // Si es un error de red o timeout, devolver datos de respaldo
    if (error.code === 'ECONNABORTED' || !error.response || error.isOfflineError) {
      logFallbackUsage(`Usando datos de respaldo para historial de compras del cliente #${id} debido a problemas de conexión`);
      return MOCK_PURCHASE_HISTORY.filter(h => h.customerId === Number(id));
    }

    throw error;
  }
};

// Buscar clientes con filtros
export const searchCustomers = async (filters) => {
  // Si ya estamos en modo offline, usar datos de respaldo directamente
  if (isInOfflineMode()) {
    logFallbackUsage('Modo offline activo, usando datos de respaldo para búsqueda de clientes');
    // Lógica básica para filtrar los datos mock según los filtros
    let filteredCustomers = [...MOCK_CUSTOMERS];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(c =>
        c.firstName.toLowerCase().includes(searchLower) ||
        c.lastName.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filteredCustomers = filteredCustomers.filter(c => c.status === filters.status);
    }

    // Aplicar transformación a los resultados filtrados del mock
    return filteredCustomers.map(transformCustomer); // Aplicamos transformCustomer aquí
  }

  try {
    const response = await axiosInstance.get('/customers/search', { params: filters });
     // Aplicar transformación a datos recibidos del backend
    return response.data.map(transformCustomer); // Aplicamos transformCustomer aquí
  } catch (error) {
    console.error('Error al buscar clientes:', error.message);

    // Si es un error de red o timeout, devolver datos de respaldo
    if (error.code === 'ECONNABORTED' || !error.response || error.isOfflineError) {
      logFallbackUsage('Usando datos de respaldo para búsqueda de clientes debido a problemas de conexión');
       // Aplicar transformación a los datos mock como fallback
      return MOCK_CUSTOMERS.map(transformCustomer); // Aplicamos transformCustomer aquí
    }

    throw error;
  }
};

// Obtener estadísticas de clientes
export const getCustomerStats = async () => {
  // Si ya estamos en modo offline, usar datos de respaldo directamente
  if (isInOfflineMode()) {
    logFallbackUsage('Modo offline activo, usando datos de respaldo para estadísticas de clientes');
    // No es necesario transformar las estadísticas a menos que 'transformCustomer' sea aplicable
    return MOCK_CUSTOMER_STATS;
  }

  try {
    const response = await axiosInstance.get('/customers/statistics');
    // No es necesario transformar las estadísticas a menos que 'transformCustomer' sea aplicable
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de clientes:', error.message);

    // Si es un error de red o timeout, devolver datos de respaldo
    if (error.code === 'ECONNABORTED' || !error.response || error.isOfflineError) {
      logFallbackUsage('Usando datos de respaldo para estadísticas de clientes debido a problemas de conexión');
      // No es necesario transformar las estadísticas a menos que 'transformCustomer' sea aplicable
      return MOCK_CUSTOMER_STATS;
    }

    throw error;
  }
};

// Asignamos el objeto de exportación a una variable para evitar el warning de exportación anónima
const customerApi = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerPurchaseHistory,
  searchCustomers,
  getCustomerStats
};

export default customerApi;
