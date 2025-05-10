import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import salesApi from '../../api/salesApi';

// Acción asíncrona para obtener todas las ventas
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (params, { rejectWithValue }) => {
    try {
      return await salesApi.getSales(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener ventas');
    }
  }
);

// Acción asíncrona para obtener una venta por ID
export const fetchSaleById = createAsyncThunk(
  'sales/fetchSaleById',
  async (id, { rejectWithValue }) => {
    try {
      return await salesApi.getSaleById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener detalles de la venta');
    }
  }
);

// Acción asíncrona para crear una venta
export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData, { rejectWithValue }) => {
    try {
      return await salesApi.createSale(saleData);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al crear la venta');
    }
  }
);

// Acción asíncrona para cancelar una venta
export const cancelSale = createAsyncThunk(
  'sales/cancelSale',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      return await salesApi.cancelSale(id, { reason });
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al cancelar la venta');
    }
  }
);

// Acción asíncrona para procesar una devolución
export const processReturn = createAsyncThunk(
  'sales/processReturn',
  async ({ id, returnData }, { rejectWithValue }) => {
    try {
      return await salesApi.processReturn(id, returnData);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al procesar la devolución');
    }
  }
);

// Acción asíncrona para obtener estadísticas
export const fetchSalesStatistics = createAsyncThunk(
  'sales/fetchSalesStatistics',
  async (params, { rejectWithValue }) => {
    try {
      return await salesApi.getSalesStatistics(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener estadísticas');
    }
  }
);

// Estado inicial
const initialState = {
  sales: [],
  filteredSales: [],
  selectedSale: null,
  statistics: null,
  loading: false,
  statisticsLoading: false,
  error: null,
  success: false,
  returnSuccess: false,
  cancelSuccess: false,
};

// Slice
const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearSalesState: (state) => {
      state.error = null;
      state.success = false;
      state.returnSuccess = false;
      state.cancelSuccess = false;
    },
    setSelectedSale: (state, action) => {
      state.selectedSale = action.payload;
    },
    clearSelectedSale: (state) => {
      state.selectedSale = null;
    },
    filterSales: (state, action) => {
      const { dateRange, status, customer, searchTerm } = action.payload;
      
      state.filteredSales = state.sales.filter(sale => {
        // Filtrar por rango de fechas
        let matchesDateRange = true;
        if (dateRange.start && dateRange.end) {
          const saleDate = new Date(sale.date);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Fin del día
          matchesDateRange = saleDate >= startDate && saleDate <= endDate;
        }
        
        // Filtrar por estado
        const matchesStatus = !status || sale.status === status;
        
        // Filtrar por cliente
        const matchesCustomer = !customer || 
          sale.customerId === customer || 
          (sale.customer && sale.customer.name.toLowerCase().includes(customer.toLowerCase()));
        
        // Filtrar por término de búsqueda
        const matchesSearch = !searchTerm || 
          (sale.receiptNumber && sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (sale.customer && sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesDateRange && matchesStatus && matchesCustomer && matchesSearch;
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchSales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
        state.filteredSales = action.payload;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchSaleById
      .addCase(fetchSaleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSale = action.payload;
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createSale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.unshift(action.payload);
        state.filteredSales.unshift(action.payload);
        state.success = true;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // cancelSale
      .addCase(cancelSale.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.cancelSuccess = false;
      })
      .addCase(cancelSale.fulfilled, (state, action) => {
        state.loading = false;
        
        // Actualizar la venta en el array de ventas
        const index = state.sales.findIndex(sale => sale.id === action.payload.id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        
        // Actualizar en filteredSales también
        const filteredIndex = state.filteredSales.findIndex(sale => sale.id === action.payload.id);
        if (filteredIndex !== -1) {
          state.filteredSales[filteredIndex] = action.payload;
        }
        
        // Si la venta seleccionada es la que se canceló, actualizarla
        if (state.selectedSale && state.selectedSale.id === action.payload.id) {
          state.selectedSale = action.payload;
        }
        
        state.cancelSuccess = true;
      })
      .addCase(cancelSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cancelSuccess = false;
      })
      
      // processReturn
      .addCase(processReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.returnSuccess = false;
      })
      .addCase(processReturn.fulfilled, (state, action) => {
        state.loading = false;
        
        // Actualizar la venta en el array de ventas
        const index = state.sales.findIndex(sale => sale.id === action.payload.id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        
        // Actualizar en filteredSales también
        const filteredIndex = state.filteredSales.findIndex(sale => sale.id === action.payload.id);
        if (filteredIndex !== -1) {
          state.filteredSales[filteredIndex] = action.payload;
        }
        
        // Si la venta seleccionada es la que tuvo devolución, actualizarla
        if (state.selectedSale && state.selectedSale.id === action.payload.id) {
          state.selectedSale = action.payload;
        }
        
        state.returnSuccess = true;
      })
      .addCase(processReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.returnSuccess = false;
      })
      
      // fetchSalesStatistics
      .addCase(fetchSalesStatistics.pending, (state) => {
        state.statisticsLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchSalesStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearSalesState, 
  setSelectedSale, 
  clearSelectedSale,
  filterSales
} = salesSlice.actions;

export default salesSlice.reducer;