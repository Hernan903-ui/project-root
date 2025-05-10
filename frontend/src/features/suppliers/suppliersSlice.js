import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as supplierApi from '../../api/supplierApi';

// Thunks para proveedores
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await supplierApi.fetchSuppliers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSupplierById = createAsyncThunk(
  'suppliers/fetchSupplierById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await supplierApi.fetchSupplierById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunks para órdenes de compra
export const fetchPurchaseOrders = createAsyncThunk(
  'suppliers/fetchPurchaseOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await supplierApi.fetchPurchaseOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPurchaseOrderById = createAsyncThunk(
  'suppliers/fetchPurchaseOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await supplierApi.fetchPurchaseOrderById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
        state.suppliers = action.payload.items;
        state.totalSuppliers = action.payload.total;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar proveedores';
      })
      .addCase(fetchSupplierById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSupplier = action.payload;
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar detalles del proveedor';
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
        state.purchaseOrders = action.payload.items;
        state.totalPurchaseOrders = action.payload.total;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar órdenes de compra';
      })
      .addCase(fetchPurchaseOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPurchaseOrder = action.payload;
      })
      .addCase(fetchPurchaseOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar detalles de la orden';
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
  clearErrors 
} = suppliersSlice.actions;

export default suppliersSlice.reducer;