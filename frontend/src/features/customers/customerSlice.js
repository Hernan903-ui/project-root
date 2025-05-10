import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerApi from '../../api/customerApi';

// Acción asíncrona para obtener todos los clientes
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      return await customerApi.getCustomers();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener clientes');
    }
  }
);

// Acción asíncrona para obtener un cliente por ID
export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (id, { rejectWithValue }) => {
    try {
      return await customerApi.getCustomerById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener el cliente');
    }
  }
);

// Acción asíncrona para crear un nuevo cliente
export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      return await customerApi.createCustomer(customerData);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al crear el cliente');
    }
  }
);

// Acción asíncrona para actualizar un cliente
export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      return await customerApi.updateCustomer(customerData.id, customerData);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al actualizar el cliente');
    }
  }
);

// Acción asíncrona para eliminar un cliente
export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      await customerApi.deleteCustomer(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al eliminar el cliente');
    }
  }
);

// Estado inicial del slice
const initialState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
  success: false,
};

// Creación del slice
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCustomerState: (state) => {
      state.error = null;
      state.success = false;
    },
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para fetchCustomers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar los clientes';
      })
      
      // Resto del código igual que antes...
      // (Mantenemos el mismo patrón para los otros casos)
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar el cliente';
      })
      
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.push(action.payload);
        state.success = true;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al crear el cliente';
        state.success = false;
      })
      
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex(customer => customer.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        state.selectedCustomer = action.payload;
        state.success = true;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al actualizar el cliente';
        state.success = false;
      })
      
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(customer => customer.id !== action.payload);
        state.success = true;
        if (state.selectedCustomer && state.selectedCustomer.id === action.payload) {
          state.selectedCustomer = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al eliminar el cliente';
        state.success = false;
      });
  }
});

// Exportar acciones y reducer
export const { clearCustomerState, setSelectedCustomer, clearSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;