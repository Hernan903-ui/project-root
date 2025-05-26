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
import usersReducer from '../features/users/userSlice';

/**
 * Configuración de la store de Redux
 * Incluye todos los reducers y middleware personalizado
 */
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
    users: usersReducer
  },
  // Configuración para manejo de objetos no serializables
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones específicas que podrían contener datos no serializables
        ignoredActions: [
          // Acciones de usuarios
          'users/updateProfileImage/pending',
          'users/updateProfileImage/fulfilled',
          'users/updateUser/pending',
          'users/updateUser/fulfilled',
          
          // Acciones de reportes y fechas
          'reports/setDateRange',
          'reports/fetchSalesReport/pending',
          'reports/fetchSalesReport/fulfilled',
          'reports/fetchInventoryReport/pending',
          'reports/fetchInventoryReport/fulfilled',
          'reports/fetchCustomersReport/pending',
          'reports/fetchCustomersReport/fulfilled',
          'reports/fetchFinancialReport/pending',
          'reports/fetchFinancialReport/fulfilled',
          
          // Acciones de proveedores
          'suppliers/fetchSuppliers/fulfilled',
          'suppliers/createSupplier/fulfilled',
          'suppliers/updateSupplier/fulfilled',
          
          // Acciones de productos
          'products/uploadProductImage/pending',
          'products/uploadProductImage/fulfilled'
        ],
        // Ignorar ciertas rutas en el estado que podrían contener datos no serializables
        ignoredPaths: [
          // Rutas específicas del estado a ignorar
          'reports.dateRange',
          'reports.salesReport.data.dates',
          'sales.selectedDates',
          'sales.transactions.createdAt',
          'suppliers.currentSupplier.created_at',
          'suppliers.currentSupplier.updated_at',
          'products.selectedProduct.created_at',
          'products.selectedProduct.updated_at',
          'users.selectedUser.lastLogin'
        ],
      },
      // Aumentar el límite de tamaño para respuestas grandes
      immutableCheck: { warnAfter: 128 }
    }),
  // Habilitamos el Redux DevTools en desarrollo
  devTools: process.env.NODE_ENV !== 'production',
});

// Exportar un método para resetear toda la store (útil para logout)
export const resetStore = () => {
  // Dispatch una acción para cada slice que necesita ser reseteado
  store.dispatch({ type: 'auth/logout' });
  store.dispatch({ type: 'userProfile/resetProfile' });
  store.dispatch({ type: 'cart/clearCart' });
  // Otros resets según sea necesario
};

export default store;