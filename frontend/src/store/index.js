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
    products: productReducer
  },
});

export default store;