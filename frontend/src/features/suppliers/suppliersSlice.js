import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as supplierApi from '../../api/supplierApi';

// Función auxiliar para manejar errores de manera consistente
const handleError = (error) => {
  // Manejar errores de red específicamente
  if (error.code === 'ECONNABORTED' || !error.response) {
    console.error('Error de conexión:', error.message);
    return 'Error de conexión. Usando datos alternativos.';
  }
  
  // Otros errores de respuesta
  return error.response?.data?.detail || 
         error.response?.data?.message || 
         error.message || 
         'Error desconocido';
};

// Thunks para proveedores
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await supplierApi.fetchSuppliers(params);
      
      // Verificar si estamos utilizando datos de respaldo
      const isFallbackData = response.headers && response.headers['x-fallback-data'] === 'true';
      const errorMsg = response.headers && response.headers['x-error'];
      
      return {
        ...(response.data || {}),
        isFallbackData,
        errorMsg
      };
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      // Si ya tenemos datos de respaldo, no mostramos error
      if (error.fallbackData) {
        return error.fallbackData;
      }
      return rejectWithValue(handleError(error));
    }
  }
);

export const fetchSupplierById = createAsyncThunk(
  'suppliers/fetchSupplierById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await supplierApi.fetchSupplierById(id);
      
      // Verificar si estamos utilizando datos de respaldo
      const isFallbackData = response.headers && response.headers['x-fallback-data'] === 'true';
      const errorMsg = response.headers && response.headers['x-error'];
      
      return {
        ...(response.data || {}),
        isFallbackData,
        errorMsg
      };
    } catch (error) {
      console.error(`Error al cargar proveedor ${id}:`, error);
      if (error.fallbackData) {
        return error.fallbackData;
      }
      return rejectWithValue(handleError(error));
    }
  }
);

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await supplierApi.createSupplier(supplierData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async ({ id, supplierData }, { rejectWithValue }) => {
    try {
      const response = await supplierApi.updateSupplier(id, supplierData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'suppliers/deleteSupplier',
  async (id, { rejectWithValue }) => {
    try {
      await supplierApi.deleteSupplier(id);
      return id;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

// Thunks para órdenes de compra
export const fetchPurchaseOrders = createAsyncThunk(
  'suppliers/fetchPurchaseOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await supplierApi.fetchPurchaseOrders(params);
      
      // Verificar si estamos utilizando datos de respaldo
      const isFallbackData = response.headers && response.headers['x-fallback-data'] === 'true';
      const errorMsg = response.headers && response.headers['x-error'];
      
      return {
        ...(response.data || {}),
        isFallbackData,
        errorMsg
      };
    } catch (error) {
      console.error('Error al cargar órdenes de compra:', error);
      // Si ya tenemos datos de respaldo, no mostramos error
      if (error.fallbackData) {
        return error.fallbackData;
      }
      return rejectWithValue(handleError(error));
    }
  }
);

export const fetchPurchaseOrderById = createAsyncThunk(
  'suppliers/fetchPurchaseOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await supplierApi.fetchPurchaseOrderById(id);
      
      // Verificar si estamos utilizando datos de respaldo
      const isFallbackData = response.headers && response.headers['x-fallback-data'] === 'true';
      const errorMsg = response.headers && response.headers['x-error'];
      
      return {
        ...(response.data || {}),
        isFallbackData,
        errorMsg
      };
    } catch (error) {
      console.error(`Error al cargar orden de compra ${id}:`, error);
      if (error.fallbackData) {
        return error.fallbackData;
      }
      return rejectWithValue(handleError(error));
    }
  }
);

export const createPurchaseOrder = createAsyncThunk(
  'suppliers/createPurchaseOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await supplierApi.createPurchaseOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const updatePurchaseOrder = createAsyncThunk(
  'suppliers/updatePurchaseOrder',
  async ({ id, orderData }, { rejectWithValue }) => {
    try {
      const response = await supplierApi.updatePurchaseOrder(id, orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const deletePurchaseOrder = createAsyncThunk(
  'suppliers/deletePurchaseOrder',
  async (id, { rejectWithValue }) => {
    try {
      await supplierApi.deletePurchaseOrder(id);
      return id;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const receiveInventory = createAsyncThunk(
  'suppliers/receiveInventory',
  async ({ orderId, receivedItems }, { rejectWithValue }) => {
    try {
      const response = await supplierApi.receiveInventory(orderId, receivedItems);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState: {
    suppliers: [],
    currentSupplier: null,
    purchaseOrders: [],
    currentPurchaseOrder: null,
    loading: false,
    error: null,
    totalSuppliers: 0,
    totalPurchaseOrders: 0,
    usingFallbackData: false, // Nuevo estado para indicar si estamos usando datos de respaldo
    connectionIssue: false, // Nuevo estado para indicar problemas de conexión persistentes
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
        state.suppliers = action.payload.items || [];
        state.totalSuppliers = action.payload.total || action.payload.items?.length || 0;
        
        // Determinar si estamos usando datos de respaldo
        state.usingFallbackData = action.payload.isFallbackData === true;
        
        // Establecer mensaje de advertencia si estamos usando datos de respaldo
        if (state.usingFallbackData) {
          if (action.payload.errorMsg) {
            state.error = `Error: ${action.payload.errorMsg} (usando datos de respaldo)`;
          } else {
            state.error = 'Mostrando datos de respaldo debido a problemas de conexión';
          }
          state.connectionIssue = true;
        } else {
          state.connectionIssue = false;
        }
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar proveedores';
        // Si no hay datos, proporcionar una lista vacía
        if (!state.suppliers.length) {
          state.suppliers = [];
        }
        state.connectionIssue = true;
      })
      .addCase(fetchSupplierById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSupplier = action.payload;
        
        // Determinar si estamos usando datos de respaldo
        state.usingFallbackData = action.payload.isFallbackData === true;
        
        // Establecer mensaje de advertencia si estamos usando datos de respaldo
        if (state.usingFallbackData) {
          if (action.payload.errorMsg) {
            state.error = `Error: ${action.payload.errorMsg} (usando datos de respaldo)`;
          } else {
            state.error = 'Mostrando datos de respaldo debido a problemas de conexión';
          }
          state.connectionIssue = true;
        } else {
          state.connectionIssue = false;
        }
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar detalles del proveedor';
        state.connectionIssue = true;
      })
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers.push(action.payload);
        state.totalSuppliers += 1;
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al crear proveedor';
      })
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.suppliers.findIndex(supplier => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
        if (state.currentSupplier?.id === action.payload.id) {
          state.currentSupplier = action.payload;
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al actualizar proveedor';
      })
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = state.suppliers.filter(supplier => supplier.id !== action.payload);
        state.totalSuppliers -= 1;
        if (state.currentSupplier?.id === action.payload) {
          state.currentSupplier = null;
        }
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al eliminar proveedor';
      })
      
      // Órdenes de compra
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders = action.payload.items || [];
        state.totalPurchaseOrders = action.payload.total || action.payload.items?.length || 0;
        
        // Determinar si estamos usando datos de respaldo
        state.usingFallbackData = action.payload.isFallbackData === true;
        
        // Establecer mensaje de advertencia si estamos usando datos de respaldo
        if (state.usingFallbackData) {
          if (action.payload.errorMsg) {
            state.error = `Error: ${action.payload.errorMsg} (usando datos de respaldo)`;
          } else {
            state.error = 'Mostrando datos de respaldo debido a problemas de conexión';
          }
          state.connectionIssue = true;
        } else {
          state.error = null;
          state.connectionIssue = false;
        }
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar órdenes de compra';
        // Si no hay datos, proporcionar una lista vacía
        if (!state.purchaseOrders.length) {
          state.purchaseOrders = [];
        }
        state.connectionIssue = true;
      })
      .addCase(fetchPurchaseOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPurchaseOrder = action.payload;
        
        // Determinar si estamos usando datos de respaldo
        state.usingFallbackData = action.payload.isFallbackData === true;
        
        // Establecer mensaje de advertencia si estamos usando datos de respaldo
        if (state.usingFallbackData) {
          if (action.payload.errorMsg) {
            state.error = `Error: ${action.payload.errorMsg} (usando datos de respaldo)`;
          } else {
            state.error = 'Mostrando datos de respaldo debido a problemas de conexión';
          }
          state.connectionIssue = true;
        } else {
          state.connectionIssue = false;
        }
      })
      .addCase(fetchPurchaseOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar detalles de la orden';
        state.connectionIssue = true;
      })
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders.push(action.payload);
        state.totalPurchaseOrders += 1;
        state.currentPurchaseOrder = action.payload;
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al crear orden de compra';
      })
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchaseOrders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
        if (state.currentPurchaseOrder?.id === action.payload.id) {
          state.currentPurchaseOrder = action.payload;
        }
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al actualizar orden de compra';
      })
      .addCase(deletePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders = state.purchaseOrders.filter(order => order.id !== action.payload);
        state.totalPurchaseOrders -= 1;
        if (state.currentPurchaseOrder?.id === action.payload) {
          state.currentPurchaseOrder = null;
        }
      })
      .addCase(deletePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al eliminar orden de compra';
      })
      .addCase(receiveInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receiveInventory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchaseOrders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
        if (state.currentPurchaseOrder?.id === action.payload.id) {
          state.currentPurchaseOrder = action.payload;
        }
      })
      .addCase(receiveInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al recibir mercancía';
      });
  },
});

export const {
clearCurrentSupplier,
clearCurrentPurchaseOrder,
clearErrors,
setConnectionStatus
} = suppliersSlice.actions;

export default suppliersSlice.reducer;