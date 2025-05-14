import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as inventoryApi from '../../api/inventoryApi';

// Thunks para operaciones asíncronas
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      // Utiliza la función getLowStockProducts que devuelve productos con poco stock
      const response = await inventoryApi.getLowStockProducts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchInventoryItem = createAsyncThunk(
  'inventory/fetchInventoryItem',
  async (id, { rejectWithValue }) => {
    try {
      // Usa getProductsBySearch para buscar por ID
      const response = await inventoryApi.getProductsBySearch(id);
      // Encuentra el producto que coincida con el ID
      const item = Array.isArray(response.data) 
        ? response.data.find(item => item.id === id) 
        : null;
      return item;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addInventoryItem = createAsyncThunk(
  'inventory/addInventoryItem',
  async (itemData, { rejectWithValue }) => {
    try {
      // Utiliza createInventoryMovement para crear un movimiento de inventario
      const response = await inventoryApi.createInventoryMovement({
        product_id: itemData.productId,
        quantity: itemData.quantity,
        movement_type: 'add',
        notes: itemData.notes || 'Initial stock'
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateInventoryItem',
  async (itemData, { rejectWithValue }) => {
    try {
      // Crea un movimiento de ajuste con createInventoryMovement
      const response = await inventoryApi.createInventoryMovement({
        product_id: itemData.id,
        quantity: itemData.adjustment || 0,
        movement_type: 'adjust',
        notes: itemData.notes || 'Stock updated'
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const adjustStock = createAsyncThunk(
  'inventory/adjustStock',
  async ({ id, adjustment, reason }, { rejectWithValue }) => {
    try {
      // Determina si es una adición o reducción basada en el signo del ajuste
      const movementType = adjustment > 0 ? 'add' : 'remove';
      
      // Usa createInventoryMovement para registrar el ajuste
      const response = await inventoryApi.createInventoryMovement({
        product_id: id,
        quantity: Math.abs(adjustment), // Usamos valor absoluto y el tipo determina si suma o resta
        movement_type: movementType,
        notes: reason || 'Stock adjustment'
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchStockMovements = createAsyncThunk(
  'inventory/fetchStockMovements',
  async (productId, { rejectWithValue }) => {
    try {
      // Usa getInventoryMovements con el product_id como filtro
      const response = await inventoryApi.getInventoryMovements({ 
        product_id: productId 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice con las mismas acciones pero adaptando al manejo de datos esperado
const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    currentItem: null,
    movements: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentItem(state) {
      state.currentItem = null;
    },
    clearErrors(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchInventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar inventario';
      })

      // fetchInventoryItem
      .addCase(fetchInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar el ítem de inventario';
      })

      // addInventoryItem
      .addCase(addInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        // Añadir el movimiento a la lista si corresponde a un nuevo item
        const existingItem = state.items.find(i => i.product_id === action.payload.product_id);
        if (!existingItem) {
          state.items.push({
            ...action.payload,
            // Propiedades adicionales que puedan ser necesarias
          });
        }
      })
      .addCase(addInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al añadir ítem al inventario';
      })

      // updateInventoryItem
      .addCase(updateInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        // Actualizar el item en la lista si existe
        const index = state.items.findIndex(item => item.product_id === action.payload.product_id);
        if (index !== -1) {
          // Actualiza propiedades relevantes
          state.items[index] = {
            ...state.items[index],
            currentQuantity: action.payload.currentQuantity,
            lastUpdated: action.payload.timestamp
          };
        }
        
        // Actualiza el item actual si es el mismo
        if (state.currentItem && state.currentItem.product_id === action.payload.product_id) {
          state.currentItem = {
            ...state.currentItem,
            currentQuantity: action.payload.currentQuantity,
            lastUpdated: action.payload.timestamp
          };
        }
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al actualizar ítem del inventario';
      })

      // adjustStock
      .addCase(adjustStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustStock.fulfilled, (state, action) => {
        state.loading = false;
        // Actualizar el item afectado
        const index = state.items.findIndex(item => item.product_id === action.payload.product_id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            currentQuantity: action.payload.currentQuantity,
            lastUpdated: action.payload.timestamp
          };
        }
        
        // Actualiza el item actual si es el mismo
        if (state.currentItem && state.currentItem.product_id === action.payload.product_id) {
          state.currentItem = {
            ...state.currentItem,
            currentQuantity: action.payload.currentQuantity,
            lastUpdated: action.payload.timestamp
          };
        }
      })
      .addCase(adjustStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al ajustar el stock';
      })

      // fetchStockMovements
      .addCase(fetchStockMovements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.loading = false;
        state.movements = action.payload;
      })
      .addCase(fetchStockMovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar historial de movimientos';
      });
  },
});

export const { clearCurrentItem, clearErrors } = inventorySlice.actions;

export default inventorySlice.reducer;