import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import settingsApi from '../../api/settingsApi';

// Acción asíncrona para obtener todas las configuraciones del sistema
export const fetchSystemSettings = createAsyncThunk(
  'settings/fetchSystemSettings',
  async (_, { rejectWithValue }) => {
    try {
      return await settingsApi.getSystemSettings();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener configuraciones del sistema');
    }
  }
);

// Acción asíncrona para actualizar configuraciones de impuestos
export const updateTaxSettings = createAsyncThunk(
  'settings/updateTaxSettings',
  async (taxSettings, { rejectWithValue }) => {
    try {
      return await settingsApi.updateTaxSettings(taxSettings);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al actualizar configuraciones de impuestos');
    }
  }
);

// Acción asíncrona para actualizar configuraciones de impresión
export const updatePrintSettings = createAsyncThunk(
  'settings/updatePrintSettings',
  async (printSettings, { rejectWithValue }) => {
    try {
      return await settingsApi.updatePrintSettings(printSettings);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al actualizar configuraciones de impresión');
    }
  }
);

// Acción asíncrona para obtener métodos de pago
export const fetchPaymentMethods = createAsyncThunk(
  'settings/fetchPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      return await settingsApi.getPaymentMethods();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener métodos de pago');
    }
  }
);

// Acción asíncrona para crear un método de pago
export const createPaymentMethod = createAsyncThunk(
  'settings/createPaymentMethod',
  async (paymentMethod, { rejectWithValue }) => {
    try {
      return await settingsApi.createPaymentMethod(paymentMethod);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al crear método de pago');
    }
  }
);

// Acción asíncrona para actualizar un método de pago
export const updatePaymentMethod = createAsyncThunk(
  'settings/updatePaymentMethod',
  async ({ id, paymentMethod }, { rejectWithValue }) => {
    try {
      return await settingsApi.updatePaymentMethod(id, paymentMethod);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al actualizar método de pago');
    }
  }
);

// Acción asíncrona para eliminar un método de pago
export const deletePaymentMethod = createAsyncThunk(
  'settings/deletePaymentMethod',
  async (id, { rejectWithValue }) => {
    try {
      await settingsApi.deletePaymentMethod(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al eliminar método de pago');
    }
  }
);

// Acción asíncrona para obtener usuarios
export const fetchUsers = createAsyncThunk(
  'settings/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await settingsApi.getUsers();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener usuarios');
    }
  }
);

// Acción asíncrona para crear un usuario
export const createUser = createAsyncThunk(
  'settings/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      return await settingsApi.createUser(userData);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al crear usuario');
    }
  }
);

// Acción asíncrona para actualizar un usuario
export const updateUser = createAsyncThunk(
  'settings/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      return await settingsApi.updateUser(id, userData);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al actualizar usuario');
    }
  }
);

// Acción asíncrona para eliminar un usuario
export const deleteUser = createAsyncThunk(
  'settings/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await settingsApi.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al eliminar usuario');
    }
  }
);

// Acción asíncrona para actualizar permisos de un usuario
export const updateUserPermissions = createAsyncThunk(
  'settings/updateUserPermissions',
  async ({ id, permissions }, { rejectWithValue }) => {
    try {
      return await settingsApi.updateUserPermissions(id, permissions);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al actualizar permisos');
    }
  }
);

// Acción asíncrona para obtener roles
export const fetchRoles = createAsyncThunk(
  'settings/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      return await settingsApi.getRoles();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener roles');
    }
  }
);

// Estado inicial
const initialState = {
  settings: null,
  taxSettings: null,
  printSettings: null,
  paymentMethods: [],
  users: [],
  roles: [],
  activeTab: 0,
  loading: false,
  taxSettingsLoading: false,
  printSettingsLoading: false,
  paymentMethodsLoading: false,
  usersLoading: false,
  rolesLoading: false,
  error: null,
  successMessage: null,
  selectedPaymentMethod: null,
  selectedUser: null,
  selectedRole: null
};

// Slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    clearSettingsState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedPaymentMethod: (state, action) => {
      state.selectedPaymentMethod = action.payload;
    },
    clearSelectedPaymentMethod: (state) => {
      state.selectedPaymentMethod = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchSystemSettings
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.taxSettings = action.payload.taxes;
        state.printSettings = action.payload.printing;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateTaxSettings
      .addCase(updateTaxSettings.pending, (state) => {
        state.taxSettingsLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateTaxSettings.fulfilled, (state, action) => {
        state.taxSettingsLoading = false;
        state.taxSettings = action.payload;
        state.successMessage = 'Configuración de impuestos actualizada correctamente';
      })
      .addCase(updateTaxSettings.rejected, (state, action) => {
        state.taxSettingsLoading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      
      // updatePrintSettings
      .addCase(updatePrintSettings.pending, (state) => {
        state.printSettingsLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updatePrintSettings.fulfilled, (state, action) => {
        state.printSettingsLoading = false;
        state.printSettings = action.payload;
        state.successMessage = 'Configuración de impresión actualizada correctamente';
      })
      .addCase(updatePrintSettings.rejected, (state, action) => {
        state.printSettingsLoading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      
      // fetchPaymentMethods
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.paymentMethodsLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.paymentMethodsLoading = false;
        state.error = action.payload;
      })
      
      // createPaymentMethod
      .addCase(createPaymentMethod.pending, (state) => {
        state.paymentMethodsLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createPaymentMethod.fulfilled, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethods.push(action.payload);
        state.successMessage = 'Método de pago creado correctamente';
      })
      .addCase(createPaymentMethod.rejected, (state, action) => {
        state.paymentMethodsLoading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      
      // updatePaymentMethod
      .addCase(updatePaymentMethod.pending, (state) => {
        state.paymentMethodsLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.paymentMethodsLoading = false;
        const index = state.paymentMethods.findIndex(method => method.id === action.payload.id);
        if (index !== -1) {
          state.paymentMethods[index] = action.payload;
        }
        state.selectedPaymentMethod = null;
        state.successMessage = 'Método de pago actualizado correctamente';
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.paymentMethodsLoading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      
      // deletePaymentMethod
      .addCase(deletePaymentMethod.pending, (state) => {
        state.paymentMethodsLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethods = state.paymentMethods.filter(method => method.id !== action.payload);
        state.successMessage = 'Método de pago eliminado correctamente';
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.paymentMethodsLoading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })
      
      // createUser
      .addCase(createUser.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users.push(action.payload);
        state.successMessage = 'Usuario creado correctamente';
      })
      .addCase(createUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      
      // updateUser
      .addCase(updateUser.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.usersLoading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.selectedUser = null;
        state.successMessage = 'Usuario actualizado correctamente';
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      
      // deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.successMessage = 'Usuario eliminado correctamente';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      
      // updateUserPermissions
      .addCase(updateUserPermissions.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserPermissions.fulfilled, (state, action) => {
        state.usersLoading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index].permissions = action.payload.permissions;
        }
        state.successMessage = 'Permisos actualizados correctamente';
      })
      .addCase(updateUserPermissions.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      
      // fetchRoles
      .addCase(fetchRoles.pending, (state) => {
        state.rolesLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.rolesLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setActiveTab,
  clearSettingsState,
  setSelectedPaymentMethod,
  clearSelectedPaymentMethod,
  setSelectedUser,
  clearSelectedUser,
  setSelectedRole,
  clearSelectedRole
} = settingsSlice.actions;

export default settingsSlice.reducer;