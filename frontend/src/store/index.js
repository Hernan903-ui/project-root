// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import customerReducer from '../features/customers/customerSlice';
import cartReducer from '../features/pos/cartSlice';
import reportsReducer from '../features/reports/reportsSlice';
import salesReducer from '../features/sales/salesSlice';
import settingsReducer from '../features/settings/settingsSlice';
import userProfileReducer from '../features/user/userProfileSlice';
import suppliersReducer from '../features/suppliers/suppliersSlice';
import inventoryReducer from '../features/inventory/inventorySlice';
import productReducer from '../features/products/productSlice';
// Importar el nuevo reducer de usuarios
import usersReducer from '../features/users/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    cart: cartReducer,
    reports: reportsReducer,
    sales: salesReducer,
    settings: settingsReducer,
    userProfile: userProfileReducer,
    suppliers: suppliersReducer,
    inventory: inventoryReducer,
    products: productReducer,
    // Añadir el nuevo reducer de usuarios
    users: usersReducer
  },
  // Configuración para manejo de objetos no serializables
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones específicas que podrían contener datos no serializables
        ignoredActions: [
          // Acciones existentes que se deben ignorar
          'users/updateProfileImage/pending',
          // Añadir acciones relacionadas con fechas de reportes
          'reports/setDateRange',
          // Otras acciones que podrían tener problemas de serialización
          'reports/fetchSalesReport/pending',
          'reports/fetchInventoryReport/pending',
          'reports/fetchCustomersReport/pending',
          'reports/fetchFinancialReport/pending'
        ],
        // Ignorar ciertas rutas en el estado que podrían contener datos no serializables
        ignoredPaths: [
          // Rutas específicas del estado a ignorar
          'reports.dateRange',
          'sales.selectedDates'
        ],
      },
    }),
});

export default store;