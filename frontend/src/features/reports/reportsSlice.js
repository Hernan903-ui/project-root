import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportApi from '../../api/reportApi';

// Acción asíncrona para obtener reporte de ventas
export const fetchSalesReport = createAsyncThunk(
  'reports/fetchSalesReport',
  async (params, { rejectWithValue }) => {
    try {
      return await reportApi.getSalesReport(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener reporte de ventas');
    }
  }
);

// Acción asíncrona para obtener reporte de inventario
export const fetchInventoryReport = createAsyncThunk(
  'reports/fetchInventoryReport',
  async (params, { rejectWithValue }) => {
    try {
      return await reportApi.getInventoryReport(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener reporte de inventario');
    }
  }
);

// Acción asíncrona para obtener reporte de clientes
export const fetchCustomersReport = createAsyncThunk(
  'reports/fetchCustomersReport',
  async (params, { rejectWithValue }) => {
    try {
      return await reportApi.getCustomersReport(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener reporte de clientes');
    }
  }
);

// Acción asíncrona para obtener reporte financiero
export const fetchFinancialReport = createAsyncThunk(
  'reports/fetchFinancialReport',
  async (params, { rejectWithValue }) => {
    try {
      return await reportApi.getFinancialReport(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener reporte financiero');
    }
  }
);

// Estado inicial
const initialState = {
  currentReport: null,
  reportData: null,
  loading: false,
  error: null,
  exportFormat: 'pdf',
  dateRange: {
    start: null, // Será un string ISO
    end: null    // Será un string ISO
  },
  additionalFilters: {}
};

// Slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setCurrentReport: (state, action) => {
      state.currentReport = action.payload;
      state.reportData = null;
      state.error = null;
    },
    // Actualizado para serializar fechas
    setDateRange: (state, action) => {
      const { start, end } = action.payload;
      state.dateRange = {
        // Convertir objetos Date a strings ISO
        start: start instanceof Date ? start.toISOString() : start,
        end: end instanceof Date ? end.toISOString() : end
      };
    },
    setExportFormat: (state, action) => {
      state.exportFormat = action.payload;
    },
    setAdditionalFilters: (state, action) => {
      state.additionalFilters = {
        ...state.additionalFilters,
        ...action.payload
      };
    },
    clearReportData: (state) => {
      state.reportData = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchSalesReport
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reportData = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchInventoryReport
      .addCase(fetchInventoryReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reportData = action.payload;
      })
      .addCase(fetchInventoryReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchCustomersReport
      .addCase(fetchCustomersReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomersReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reportData = action.payload;
      })
      .addCase(fetchCustomersReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchFinancialReport
      .addCase(fetchFinancialReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reportData = action.payload;
      })
      .addCase(fetchFinancialReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setCurrentReport,
  setDateRange,
  setExportFormat,
  setAdditionalFilters,
  clearReportData
} = reportsSlice.actions;

export default reportsSlice.reducer;