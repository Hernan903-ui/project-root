// src/features/users/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userApi from '../../api/userApi';

// Estado inicial
const initialState = {
  // Lista de usuarios (admin)
  users: {
    items: [],
    loading: false,
    error: null,
    total: 0
  },
  // Usuario seleccionado para ver/editar
  selectedUser: {
    data: null,
    loading: false,
    error: null
  },
  // Perfil del usuario actual (logged in)
  profile: {
    data: null,
    loading: false,
    error: null
  },
  // Historial de actividad
  activityHistory: {
    items: [],
    loading: false,
    error: null
  }
};

// ====== THUNKS PARA GESTIÓN DE USUARIOS (ADMIN) =======

// Obtener lista de usuarios
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await userApi.getUsers(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Obtener un usuario por ID
export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await userApi.getUserById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Crear un nuevo usuario
export const createUser = createAsyncThunk(
  'users/create',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await userApi.createUser(userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Actualizar un usuario existente
export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, ...userData }, { rejectWithValue }) => {
    try {
      const data = await userApi.updateUser(id, userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Eliminar un usuario
export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await userApi.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Cambiar estado de activación de un usuario
export const setUserStatus = createAsyncThunk(
  'users/setStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const data = await userApi.setUserStatus(id, isActive);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ====== THUNKS PARA PERFIL DE USUARIO (LOGGEADO) =======

// Obtener perfil del usuario actual
export const fetchUserProfile = createAsyncThunk(
  'users/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await userApi.getUserProfile();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Actualizar perfil de usuario
export const updateUserProfile = createAsyncThunk(
  'users/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await userApi.updateUserProfile(userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Cambiar contraseña
export const changePassword = createAsyncThunk(
  'users/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const data = await userApi.changePassword(passwordData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Actualizar preferencias
export const updateUserPreferences = createAsyncThunk(
  'users/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const data = await userApi.updateUserPreferences(preferences);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Obtener historial de actividad
export const fetchUserActivityHistory = createAsyncThunk(
  'users/fetchActivityHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await userApi.getUserActivityHistory(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Actualizar imagen de perfil
export const updateProfileImage = createAsyncThunk(
  'users/updateProfileImage',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await userApi.updateProfileImage(formData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Resetea el estado del usuario seleccionado (útil al navegar fuera de la página de detalle)
    clearSelectedUser: (state) => {
      state.selectedUser.data = null;
      state.selectedUser.error = null;
    },
    // Resetea errores
    clearErrors: (state) => {
      state.users.error = null;
      state.selectedUser.error = null;
      state.profile.error = null;
      state.activityHistory.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // === GESTIÓN DE USUARIOS (ADMIN) ===
      
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.items = action.payload.items || action.payload;
        // Si la API devuelve un count total
        if (action.payload.total) {
          state.users.total = action.payload.total;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload || 'Error al cargar usuarios';
      })
      
      // Fetch User By ID
      .addCase(fetchUserById.pending, (state) => {
        state.selectedUser.loading = true;
        state.selectedUser.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser.loading = false;
        state.selectedUser.data = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.selectedUser.loading = false;
        state.selectedUser.error = action.payload || 'Error al cargar el usuario';
      })
      
      // Create User
      .addCase(createUser.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.items.push(action.payload);
        state.users.total += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload || 'Error al crear el usuario';
      })
      
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.selectedUser.loading = true;
        state.selectedUser.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.selectedUser.loading = false;
        state.selectedUser.data = action.payload;
        
        // Actualizar también en la lista si existe
        const index = state.users.items.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users.items[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.selectedUser.loading = false;
        state.selectedUser.error = action.payload || 'Error al actualizar el usuario';
      })
      
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.items = state.users.items.filter(user => user.id !== action.payload);
        state.users.total -= 1;
        
        // Limpiar usuario seleccionado si es el mismo
        if (state.selectedUser.data && state.selectedUser.data.id === action.payload) {
          state.selectedUser.data = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload || 'Error al eliminar el usuario';
      })
      
      // Set User Status
      .addCase(setUserStatus.fulfilled, (state, action) => {
        // Actualizar en la lista
        const index = state.users.items.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users.items[index] = action.payload;
        }
        
        // Actualizar el usuario seleccionado si es el mismo
        if (state.selectedUser.data && state.selectedUser.data.id === action.payload.id) {
          state.selectedUser.data = action.payload;
        }
      })
      
      // === PERFIL DE USUARIO ===
      
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.profile.loading = true;
        state.profile.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile.loading = false;
        state.profile.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profile.loading = false;
        state.profile.error = action.payload || 'Error al cargar el perfil';
      })
      
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.profile.loading = true;
        state.profile.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile.loading = false;
        state.profile.data = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.profile.loading = false;
        state.profile.error = action.payload || 'Error al actualizar el perfil';
      })
      
      // Change Password (sólo manejar estado de carga/error)
      .addCase(changePassword.pending, (state) => {
        state.profile.loading = true;
        state.profile.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.profile.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.profile.loading = false;
        state.profile.error = action.payload || 'Error al cambiar la contraseña';
      })
      
      // Update Preferences
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        // Si hay preferencias en el perfil, actualízalas
        if (state.profile.data) {
          state.profile.data.preferences = action.payload.preferences || action.payload;
        }
      })
      
      // Fetch Activity History
      .addCase(fetchUserActivityHistory.pending, (state) => {
        state.activityHistory.loading = true;
        state.activityHistory.error = null;
      })
      .addCase(fetchUserActivityHistory.fulfilled, (state, action) => {
        state.activityHistory.loading = false;
        state.activityHistory.items = action.payload;
      })
      .addCase(fetchUserActivityHistory.rejected, (state, action) => {
        state.activityHistory.loading = false;
        state.activityHistory.error = action.payload || 'Error al cargar historial';
      })
      
      // Update Profile Image
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        if (state.profile.data) {
          state.profile.data.image_url = action.payload.image_url || action.payload;
        }
      });
  }
});

// Exportar acciones y reducer
export const { clearSelectedUser, clearErrors } = userSlice.actions;
export default userSlice.reducer;

// Selectores
export const selectAllUsers = (state) => state.users.users.items;
export const selectUsersLoading = (state) => state.users.users.loading;
export const selectUsersError = (state) => state.users.users.error;
export const selectUsersTotal = (state) => state.users.users.total;

export const selectSelectedUser = (state) => state.users.selectedUser.data;
export const selectSelectedUserLoading = (state) => state.users.selectedUser.loading;
export const selectSelectedUserError = (state) => state.users.selectedUser.error;

export const selectUserProfile = (state) => state.users.profile.data;
export const selectUserProfileLoading = (state) => state.users.profile.loading;
export const selectUserProfileError = (state) => state.users.profile.error;

export const selectActivityHistory = (state) => state.users.activityHistory.items;
export const selectActivityHistoryLoading = (state) => state.users.activityHistory.loading;
export const selectActivityHistoryError = (state) => state.users.activityHistory.error;