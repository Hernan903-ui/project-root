import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/pos/cartSlice';
import customerReducer from '../features/customers/customerSlice';
import salesReducer from '../features/sales/salesSlice';
import reportsReducer from '../features/reports/reportsSlice';
import userProfileReducer from '../features/user/userProfileSlice';
import settingsReducer from '../features/settings/settingsSlice';
// Otros reducers...

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    customers: customerReducer,
    sales: salesReducer,
    reports: reportsReducer,
    userProfile: userProfileReducer,
    settings: settingsReducer,
    // Otros reducers...
  },
});

export default store;