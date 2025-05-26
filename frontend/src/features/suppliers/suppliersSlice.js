import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as supplierApi from '../../api/supplierApi';

/**
 * Datos simulados para emergencias (cuando la API falla en desarrollo)
 */
const FALLBACK_SUPPLIERS = [
  {
    id: 999,
    name: "Proveedor de Emergencia",
    contact_person: "Soporte Técnico",
    email: "soporte@ejemplo.com",
    phone: "+123456789",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

/**
 * Función auxiliar para manejar errores de manera consistente
 * @param {Error} error - Error original
 * @returns {string} - Mensaje de error formateado
 */
const handleError = (error) => {
  console.error('Error original:', error);
  
  // Manejar errores de red específicamente
  if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
    console.error('Error de conexión:', error.message);
    return 'Error de conexión con el servidor.';
  }
  
  // Manejo específico para redirecciones 307
  if (error.response && error.response.status === 307) {
    console.error('Error de redirección 307:', error.message);
    const redirectUrl = error.response.headers?.location;
    console.log('Redirección a:', redirectUrl);
    return 'Error de redirección en la solicitud. Por favor, intenta de nuevo.';
  }

  // Manejo específico para 404
  if (error.response && error.response.status === 404) {
    console.error('Error 404 (recurso no encontrado):', error.message);
    return 'El recurso solicitado no existe en el servidor.';
  }
  
  // Otros errores de respuesta
  return error.response?.data?.detail || 
         error.response?.data?.message || 
         error.message || 
         'Error desconocido';
};

/**
 * Función para validar la estructura de datos esperada
 * @param {any} data - Datos a validar
 * @returns {Object} - Datos normalizados con estructura {items, total}
 */
const validateResponseData = (data) => {
  console.log('Validando respuesta:', data);
  
  // Si la respuesta no existe o es undefined
  if (data === undefined || data === null) {
    console.warn('Respuesta vacía o null, retornando estructura por defecto');
    return { items: [], total: 0 };
  }
  
  // Si es un array, lo convertimos al formato esperado
  if (Array.isArray(data)) {
    console.log('Respuesta es un array, convirtiendo a formato {items, total}');
    return { items: data, total: data.length };
  }
  
  // Si ya tiene la estructura de items y total, verificamos que items sea un array
  if (data.items !== undefined) {
    // Asegurarnos que items sea un array
    const items = Array.isArray(data.items) ? data.items : [data.items].filter(Boolean);
    const total = typeof data.total === 'number' ? data.total : items.length;
    
    console.log('Respuesta con estructura {items, total}, normalizando');
    return { items, total };
  }
  
  // En otros casos, lo envolvemos en un objeto con la estructura esperada
  console.log('Respuesta con estructura desconocida, convirtiendo a {items, total}');
  return { items: [data].filter(Boolean), total: 1 };
};

/**
 * Thunk: Obtener lista de proveedores
 */
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      // Notificar inicio de intento de conexión
      dispatch(setConnectionStatus(false));
      
      console.log('Iniciando fetchSuppliers con params:', params);
      const response = await supplierApi.fetchSuppliers(params);
      console.log('Respuesta fetchSuppliers:', response);
      
      // Asegurarse de que la respuesta tiene la estructura esperada
      const validatedData = validateResponseData(response.data);
      console.log('Datos validados:', validatedData);
      
      // Conexión exitosa, reiniciar indicador de problemas
      dispatch(setConnectionStatus(false));
      
      return validatedData;
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      
      // Marcar problema de conexión si es un error de red
      if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        dispatch(setConnectionStatus(true));
      }
      
      // Si estamos en desarrollo y la opción de fallback está habilitada, usar datos simulados
      if (process.env.NODE_ENV === 'development') {
        console.warn('Usando datos simulados de emergencia en desarrollo');
        return { items: FALLBACK_SUPPLIERS, total: FALLBACK_SUPPLIERS.length };
      }
      
      return rejectWithValue(handleError(error));
    }
  }
);

/**
 * Thunk: Obtener proveedor por ID
 */
export const fetchSupplierById = createAsyncThunk(
  'suppliers/fetchSupplierById',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      if (!id) {
        throw new Error('ID de proveedor no proporcionado');
      }
      
      console.log(`Iniciando fetchSupplierById con id: ${id}`);
      const response = await supplierApi.fetchSupplierById(id);
      console.log(`Respuesta fetchSupplierById para ${id}:`, response);
      
      // Conexión exitosa, reiniciar indicador de problemas
      dispatch(setConnectionStatus(false));
      
      return response.data;
    } catch (error) {
      console.error(`Error al cargar proveedor ${id}:`, error);
      
      // Marcar problema de conexión si es un error de red
      if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        dispatch(setConnectionStatus(true));
      }
      
      return rejectWithValue(handleError(error));
    }
  }
);

/**
 * Thunk: Crear nuevo proveedor
 */
export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (supplierData, { rejectWithValue, dispatch }) => {
    try {
      if (!supplierData || typeof supplierData !== 'object') {
        throw new Error('Datos de proveedor inválidos o incompletos');
      }
      
      console.log('Iniciando createSupplier con datos:', supplierData);
      const response = await supplierApi.createSupplier(supplierData);
      console.log('Respuesta createSupplier:', response);
      
      // Conexión exitosa, reiniciar indicador de problemas
      dispatch(setConnectionStatus(false));
      
      return response.data;
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      
      // Marcar problema de conexión si es un error de red
      if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        dispatch(setConnectionStatus(true));
      }
      
      return rejectWithValue(handleError(error));
    }
  }
);

/**
 * Thunk: Actualizar proveedor existente
 */
export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async ({ id, supplierData }, { rejectWithValue, dispatch }) => {
    try {
      if (!id) {
        throw new Error('ID de proveedor no proporcionado para actualización');
      }
      
      if (!supplierData || typeof supplierData !== 'object') {
        throw new Error('Datos de proveedor inválidos o incompletos');
      }
      
      console.log(`Iniciando updateSupplier para id ${id} con datos:`, supplierData);
      const response = await supplierApi.updateSupplier(id, supplierData);
      console.log(`Respuesta updateSupplier para ${id}:`, response);
      
      // Conexión exitosa, reiniciar indicador de problemas
      dispatch(setConnectionStatus(false));
      
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar proveedor ${id}:`, error);
      
      // Marcar problema de conexión si es un error de red
      if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        dispatch(setConnectionStatus(true));
      }
      
      return rejectWithValue(handleError(error));
    }
  }
);

/**
 * Thunk: Eliminar proveedor
 */
export const deleteSupplier = createAsyncThunk(
  'suppliers/deleteSupplier',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      if (!id) {
        throw new Error('ID de proveedor no proporcionado para eliminación');
      }
      
      console.log(`Iniciando deleteSupplier para id: ${id}`);
      await supplierApi.deleteSupplier(id);
      console.log(`Proveedor ${id} eliminado correctamente`);
      
      // Conexión exitosa, reiniciar indicador de problemas
      dispatch(setConnectionStatus(false));
      
      return id;
    } catch (error) {
      console.error(`Error al eliminar proveedor ${id}:`, error);
      
            // Marcar problema de conexión si es un error de red
      if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        dispatch(setConnectionStatus(true));
      }
      
      return rejectWithValue(handleError(error));
    }
  }
);

/**
 * Thunk: Obtener órdenes de compra
 */
export const fetchPurchaseOrders = createAsyncThunk(
  'suppliers/fetchPurchaseOrders',
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      // Notificar inicio de intento de conexión
      dispatch(setConnectionStatus(false));
      
      console.log('Iniciando fetchPurchaseOrders con params:', params);
      const response = await supplierApi.fetchPurchaseOrders(params);
      console.log('Respuesta fetchPurchaseOrders:', response);
      
      // Asegurarse de que la respuesta tiene la estructura esperada
      const validatedData = validateResponseData(response.data);
      console.log('Datos validados:', validatedData);
      
      // Conexión exitosa, reiniciar indicador de problemas
      dispatch(setConnectionStatus(false));
      
      return validatedData;
    } catch (error) {
      console.error('Error al cargar órdenes de compra:', error);
      
      // Marcar problema de conexión si es un error de red
      if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        dispatch(setConnectionStatus(true));
      }
      
      return rejectWithValue(handleError(error));
    }
  }
);

/**
 * Thunk: Obtener orden de compra por ID
 */
export const fetchPurchaseOrderById = createAsyncThunk(
  'suppliers/fetchPurchaseOrderById',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      if (!id) {
        throw new Error('ID de orden de compra no proporcionado');
      }
      
      console.log(`Iniciando fetchPurchaseOrderById con id: ${id}`);
      const response = await supplierApi.fetchPurchaseOrderById(id);
      console.log(`Respuesta fetchPurchaseOrderById para ${id}:`, response);
      
      // Conexión exitosa, reiniciar indicador de problemas
      dispatch(setConnectionStatus(false));
      
      return response.data;
    } catch (error) {
      console.error(`Error al cargar orden de compra ${id}:`, error);
      
      // Marcar problema de conexión si es un error de red
      if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        dispatch(setConnectionStatus(true));
      }
      
      return rejectWithValue(handleError(error));
    }
  }
);

/**
 * Thunk: Crear nueva orden de compra
 */
export const createPurchaseOrder = createAsyncThunk(
  'suppliers/createPurchaseOrder',
  async (orderData, { rejectWithValue, dispatch }) => {
    try {
      if (!orderData || typeof orderData !== 'object' || !orderData.supplier_id) {
        throw new Error('Datos de orden inválidos o falta ID de proveedor');
      }
      
      console.log('Iniciando createPurchaseOrder con datos:', orderData);
      const response = await supplierApi.createPurchaseOrder(orderData);
      console.log('Respuesta createPurchaseOrder:', response);
      
      // Conexión exitosa, reiniciar indicador de problemas
      dispatch(setConnectionStatus(false));
      
      return response.data;
    } catch (error) {
      console.error('Error al crear orden de compra:', error);
      
      // Marcar problema de conexión si es un error de red
      if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        dispatch(setConnectionStatus(true));
      }
      
      return rejectWithValue(handleError(error));
    }
  }
);

/**
 * Thunk: Actualizar orden de compra existente
 */
export const updatePurchaseOrder = createAsyncThunk(
  'suppliers/updatePurchaseOrder',
  async ({ id, orderData }, { rejectWithValue, dispatch }) => {
    try {
      if (!id) {
        throw new Error('ID de orden de compra no proporcionado para actualización');
      }
      
      if (!orderData || typeof orderData !== 'object') {
        throw new Error('Datos de orden de compra inválidos o incompletos');
      }
      
      console.log(`Iniciando updatePurchaseOrder para id ${id} con datos:`, orderData);
      const response = await supplierApi.updatePurchaseOrder(id, orderData);
      console.log(`Respuesta updatePurchaseOrder para ${id}:`, response);
      
      // Conexión exitosa, reiniciar indicador de problemas
      dispatch(setConnectionStatus(false));
      
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar orden de compra ${id}:`, error);
      
      // Marcar problema de conexión si es un error de red
      if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        dispatch(setConnectionStatus(true));
      }
      
      return rejectWithValue(handleError(error));
    }
  }
);

/**
 * Thunk: Eliminar orden de compra
 */
export const deletePurchaseOrder = createAsyncThunk(
  'suppliers/deletePurchaseOrder',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      if (!id) {
        throw new Error('ID de orden de compra no proporcionado para eliminación');
      }
      
      console.log(`Iniciando deletePurchaseOrder para id: ${id}`);
      await supplierApi.deletePurchaseOrder(id);
      console.log(`Orden de compra ${id} eliminada correctamente`);
      
      // Conexión exitosa, reiniciar indicador de problemas
      dispatch(setConnectionStatus(false));
      
      return id;
    } catch (error) {
      console.error(`Error al eliminar orden de compra ${id}:`, error);
      
      // Marcar problema de conexión si es un error de red
      if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        dispatch(setConnectionStatus(true));
      }
      
      return rejectWithValue(handleError(error));
    }
  }
);

/**
 * Thunk: Recibir inventario para una orden de compra
 */
export const receiveInventory = createAsyncThunk(
  'suppliers/receiveInventory',
  async ({ orderId, receivedItems }, { rejectWithValue, dispatch }) => {
    try {
      if (!orderId) {
        throw new Error('ID de orden no proporcionado para recepción de inventario');
      }
      
      if (!receivedItems || typeof receivedItems !== 'object') {
        throw new Error('Datos de recepción inválidos o incompletos');
      }
      
      console.log(`Iniciando receiveInventory para orden ${orderId} con items:`, receivedItems);
      const response = await supplierApi.receiveInventory(orderId, receivedItems);
      console.log(`Respuesta receiveInventory para orden ${orderId}:`, response);
      
      // Conexión exitosa, reiniciar indicador de problemas
      dispatch(setConnectionStatus(false));
      
      return response.data;
    } catch (error) {
      console.error(`Error al recibir inventario para orden ${orderId}:`, error);
      
      // Marcar problema de conexión si es un error de red
      if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        dispatch(setConnectionStatus(true));
      }
      
      return rejectWithValue(handleError(error));
    }
  }
);

/**
 * Slice para el estado de proveedores y órdenes de compra
 */
const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState: {
    suppliers: [],          // Lista de proveedores
    currentSupplier: null,  // Proveedor actual seleccionado
    purchaseOrders: [],     // Lista de órdenes de compra
    currentPurchaseOrder: null, // Orden de compra actual seleccionada
    loading: false,         // Indicador de carga
    error: null,            // Error si existe
    totalSuppliers: 0,      // Total de proveedores (para paginación)
    totalPurchaseOrders: 0, // Total de órdenes (para paginación)
    connectionIssue: false, // Indicador de problemas de conexión
    lastFetch: null,        // Timestamp del último fetch (para cache)
    hasAttemptedFallback: false // Indica si ya se intentó usar datos de fallback
  },
  reducers: {
    clearCurrentSupplier: (state) => {
      state.currentSupplier = null;
    },
    clearCurrentPurchaseOrder: (state) => {
      state.currentPurchaseOrder = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    setConnectionStatus: (state, action) => {
      state.connectionIssue = action.payload;
    },
    // Actualizar manualmente la lista de proveedores (útil para pruebas)
    setSuppliers: (state, action) => {
      state.suppliers = action.payload || [];
      state.totalSuppliers = action.payload?.length || 0;
    },
    // Marcar que ya se intentó usar fallback
    markFallbackAttempted: (state) => {
      state.hasAttemptedFallback = true;
    },
    // Resetear el estado completo
    resetSupplierState: (state) => {
      state.suppliers = [];
      state.currentSupplier = null;
      state.purchaseOrders = [];
      state.currentPurchaseOrder = null;
      state.loading = false;
      state.error = null;
      state.totalSuppliers = 0;
      state.totalPurchaseOrders = 0;
      state.connectionIssue = false;
      state.lastFetch = null;
      state.hasAttemptedFallback = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Proveedores
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.connectionIssue = false;
        state.lastFetch = Date.now();
        
        // Extraer datos de la respuesta validada
        const { items, total } = action.payload || { items: [], total: 0 };
        
        // Asegurar que items es un array antes de asignarlo
        state.suppliers = Array.isArray(items) ? items : [];
        state.totalSuppliers = total || 0;
        
        console.log('Estado actualizado después de fetchSuppliers:', {
          suppliersLength: state.suppliers.length,
          totalSuppliers: state.totalSuppliers
        });
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar proveedores';
        state.connectionIssue = action.payload?.includes('conexión') || 
                               action.payload?.includes('redirección') || 
                               false;
        
        console.error('Error en fetchSuppliers:', state.error);
        
        // Mantener datos existentes si hay un error
        if (!Array.isArray(state.suppliers)) {
          state.suppliers = [];
        }

        // Si no hay datos, usar datos de fallback solo una vez
        if (state.suppliers.length === 0 && !state.hasAttemptedFallback && 
            process.env.NODE_ENV === 'development') {
          state.suppliers = FALLBACK_SUPPLIERS;
          state.totalSuppliers = FALLBACK_SUPPLIERS.length;
          state.hasAttemptedFallback = true;
          console.warn('Usando datos de FALLBACK después de error');
        }
      })
      
      .addCase(fetchSupplierById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.connectionIssue = false;
        
        // Asegurar que el proveedor tenga una estructura válida
        if (action.payload) {
          state.currentSupplier = action.payload;
          
          // Actualizar también en la lista si existe
          const index = state.suppliers.findIndex(
            supplier => supplier.id === action.payload.id
          );
          if (index !== -1) {
            state.suppliers[index] = action.payload;
          }
        } else {
          console.warn('fetchSupplierById: Payload vacío o inválido');
        }
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar detalles del proveedor';
        state.connectionIssue = action.payload?.includes('conexión') || 
                               action.payload?.includes('redirección') || 
                               false;
      })
      
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.connectionIssue = false;
        
        // Verificar que el payload es válido
        if (action.payload) {
          // Añadir el nuevo proveedor a la lista
          state.suppliers.push(action.payload);
          state.totalSuppliers += 1;
          state.currentSupplier = action.payload;
        } else {
          console.warn('createSupplier: Payload vacío o inválido');
        }
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al crear proveedor';
        state.connectionIssue = action.payload?.includes('conexión') || 
                               action.payload?.includes('redirección') || 
                               false;
      })
      
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.connectionIssue = false;
        
        // Verificar que el payload es válido
        if (action.payload && action.payload.id) {
          // Actualizar el proveedor en la lista
          const index = state.suppliers.findIndex(supplier => supplier.id === action.payload.id);
          if (index !== -1) {
            state.suppliers[index] = action.payload;
          } else {
            console.warn(`updateSupplier: Proveedor con ID ${action.payload.id} no encontrado en la lista`);
          }
          
          // Actualizar el proveedor actual si es el mismo
          if (state.currentSupplier?.id === action.payload.id) {
            state.currentSupplier = action.payload;
          }
        } else {
          console.warn('updateSupplier: Payload vacío o sin ID');
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al actualizar proveedor';
        state.connectionIssue = action.payload?.includes('conexión') || 
                               action.payload?.includes('redirección') || 
                               false;
      })
      
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.connectionIssue = false;
        
        if (action.payload) {
          // Eliminar el proveedor de la lista
          const previousLength = state.suppliers.length;
          state.suppliers = state.suppliers.filter(supplier => supplier.id !== action.payload);
          
          // Actualizar contador solo si realmente se eliminó algo
          if (previousLength > state.suppliers.length) {
            state.totalSuppliers -= 1;
          }
          
          // Limpiar el proveedor actual si es el mismo
          if (state.currentSupplier?.id === action.payload) {
            state.currentSupplier = null;
          }
        } else {
          console.warn('deleteSupplier: ID no válido en payload');
        }
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al eliminar proveedor';
        state.connectionIssue = action.payload?.includes('conexión') || 
                               action.payload?.includes('redirección') || 
                               false;
      })
      
      // Órdenes de compra
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.connectionIssue = false;
        state.lastFetch = Date.now();
        
                // Extraer datos de la respuesta validada
        const { items, total } = action.payload || { items: [], total: 0 };
        
        // Asegurar que items es un array antes de asignarlo
        state.purchaseOrders = Array.isArray(items) ? items : [];
        state.totalPurchaseOrders = total || 0;
        
        console.log('Estado actualizado después de fetchPurchaseOrders:', {
          ordersLength: state.purchaseOrders.length,
          totalOrders: state.totalPurchaseOrders
        });
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar órdenes de compra';
        state.connectionIssue = action.payload?.includes('conexión') || 
                               action.payload?.includes('redirección') || 
                               false;
        
        console.error('Error en fetchPurchaseOrders:', state.error);
        
        // Mantener datos existentes si hay un error
        if (!Array.isArray(state.purchaseOrders)) {
          state.purchaseOrders = [];
        }
      })
      
      .addCase(fetchPurchaseOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.connectionIssue = false;
        
        // Asegurar que la orden tenga una estructura válida
        if (action.payload) {
          state.currentPurchaseOrder = action.payload;
          
          // Actualizar también en la lista si existe
          const index = state.purchaseOrders.findIndex(
            order => order.id === action.payload.id
          );
          if (index !== -1) {
            state.purchaseOrders[index] = action.payload;
          }
        } else {
          console.warn('fetchPurchaseOrderById: Payload vacío o inválido');
        }
      })
      .addCase(fetchPurchaseOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar detalles de la orden de compra';
        state.connectionIssue = action.payload?.includes('conexión') || 
                               action.payload?.includes('redirección') || 
                               false;
      })
      
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.connectionIssue = false;
        
        // Verificar que el payload es válido
        if (action.payload) {
          // Añadir la nueva orden a la lista
          state.purchaseOrders.push(action.payload);
          state.totalPurchaseOrders += 1;
          state.currentPurchaseOrder = action.payload;
        } else {
          console.warn('createPurchaseOrder: Payload vacío o inválido');
        }
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al crear orden de compra';
        state.connectionIssue = action.payload?.includes('conexión') || 
                               action.payload?.includes('redirección') || 
                               false;
      })
      
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.connectionIssue = false;
        
        // Verificar que el payload es válido
        if (action.payload && action.payload.id) {
          // Actualizar la orden en la lista
          const index = state.purchaseOrders.findIndex(order => order.id === action.payload.id);
          if (index !== -1) {
            state.purchaseOrders[index] = action.payload;
          } else {
            console.warn(`updatePurchaseOrder: Orden con ID ${action.payload.id} no encontrada en la lista`);
          }
          
          // Actualizar la orden actual si es la misma
          if (state.currentPurchaseOrder?.id === action.payload.id) {
            state.currentPurchaseOrder = action.payload;
          }
        } else {
          console.warn('updatePurchaseOrder: Payload vacío o sin ID');
        }
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al actualizar orden de compra';
        state.connectionIssue = action.payload?.includes('conexión') || 
                               action.payload?.includes('redirección') || 
                               false;
      })
      
      .addCase(deletePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.connectionIssue = false;
        
        if (action.payload) {
          // Eliminar la orden de la lista
          const previousLength = state.purchaseOrders.length;
          state.purchaseOrders = state.purchaseOrders.filter(order => order.id !== action.payload);
          
          // Actualizar contador solo si realmente se eliminó algo
          if (previousLength > state.purchaseOrders.length) {
            state.totalPurchaseOrders -= 1;
          }
          
          // Limpiar la orden actual si es la misma
          if (state.currentPurchaseOrder?.id === action.payload) {
            state.currentPurchaseOrder = null;
          }
        } else {
          console.warn('deletePurchaseOrder: ID no válido en payload');
        }
      })
      .addCase(deletePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al eliminar orden de compra';
        state.connectionIssue = action.payload?.includes('conexión') || 
                               action.payload?.includes('redirección') || 
                               false;
      })
      
      .addCase(receiveInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receiveInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.connectionIssue = false;
        
        // Verificar que el payload es válido
        if (action.payload && action.payload.id) {
          // Actualizar la orden en la lista
          const index = state.purchaseOrders.findIndex(order => order.id === action.payload.id);
          if (index !== -1) {
            state.purchaseOrders[index] = {
              ...state.purchaseOrders[index],
              ...action.payload,
              status: 'received', // Marcar como recibida
              updated_at: new Date().toISOString()
            };
          }
          
          // Actualizar la orden actual si es la misma
          if (state.currentPurchaseOrder?.id === action.payload.id) {
            state.currentPurchaseOrder = {
              ...state.currentPurchaseOrder,
              ...action.payload,
              status: 'received',
              updated_at: new Date().toISOString()
            };
          }
        } else {
          console.warn('receiveInventory: Payload vacío o sin ID');
        }
      })
      .addCase(receiveInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al recibir inventario';
        state.connectionIssue = action.payload?.includes('conexión') || 
                               action.payload?.includes('redirección') || 
                               false;
      });
  }
});

// Exportar acciones
export const { 
  clearCurrentSupplier, 
  clearCurrentPurchaseOrder, 
  clearErrors, 
  setConnectionStatus,
  setSuppliers,
  markFallbackAttempted,
  resetSupplierState
} = suppliersSlice.actions;

// Selectores
export const selectAllSuppliers = state => state.suppliers.suppliers;
export const selectCurrentSupplier = state => state.suppliers.currentSupplier;
export const selectSupplierById = (state, supplierId) => 
  state.suppliers.suppliers.find(supplier => supplier.id === supplierId);

export const selectAllPurchaseOrders = state => state.suppliers.purchaseOrders;
export const selectCurrentPurchaseOrder = state => state.suppliers.currentPurchaseOrder;
export const selectPurchaseOrderById = (state, orderId) => 
  state.suppliers.purchaseOrders.find(order => order.id === orderId);

export const selectSupplierPurchaseOrders = (state, supplierId) => 
  state.suppliers.purchaseOrders.filter(order => order.supplier_id === supplierId);

export const selectSuppliersLoading = state => state.suppliers.loading;
export const selectSuppliersError = state => state.suppliers.error;
export const selectConnectionStatus = state => state.suppliers.connectionIssue;
export const selectTotalSuppliers = state => state.suppliers.totalSuppliers;
export const selectTotalPurchaseOrders = state => state.suppliers.totalPurchaseOrders;
export const selectLastFetchTimestamp = state => state.suppliers.lastFetch;

// Selector para determinar si los datos están en caché y son recientes
export const selectSuppliersDataFresh = state => {
  const lastFetch = state.suppliers.lastFetch;
  if (!lastFetch) return false;
  
  // Considerar datos frescos si se obtuvieron en los últimos 5 minutos
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos
  return (Date.now() - lastFetch) < CACHE_DURATION;
};

// Exportar el reducer
export default suppliersSlice.reducer;