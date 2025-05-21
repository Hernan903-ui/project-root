import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userApi from '../../api/userApi';

// Función auxiliar para manejar errores de manera consistente
const handleApiError = (error) => {
  // Si el error es un string, devolverlo directamente
  if (typeof error === 'string') return error;
  
  // Si es un objeto de error de respuesta de axios
  if (error.response) {
    // Manejar errores de validación (422)
    if (error.response.status === 422 && error.response.data?.detail) {
      const detail = error.response.data.detail;
      
      // FastAPI suele devolver arrays para errores de validación
      if (Array.isArray(detail) && detail.length > 0) {
        return detail[0].msg || 'Error de validación';
      }
      
      return typeof detail === 'string' ? detail : 'Error de validación';
    }
    
    // Otros errores HTTP
    return error.response.data?.message || 
           error.response.data?.detail || 
           `Error ${error.response.status}: ${error.response.statusText}`;
  }
  
  // Si es un error de red (sin respuesta)
  if (error.request) {
    return 'No se pudo conectar con el servidor. Verifique su conexión.';
  }
  
  // Otros tipos de errores
  return error.message || 'Error desconocido';
};

// Acción asíncrona para obtener el perfil de usuario
export const fetchUserProfile = createAsyncThunk(
  'userProfile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await userApi.getUserProfile();
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Acción asíncrona para actualizar el perfil de usuario
export const updateUserProfile = createAsyncThunk(
  'userProfile/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      return await userApi.updateUserProfile(userData);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Acción asíncrona para cambiar la contraseña
export const changePassword = createAsyncThunk(
  'userProfile/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      return await userApi.changePassword(passwordData);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Acción asíncrona para actualizar preferencias
export const updateUserPreferences = createAsyncThunk(
  'userProfile/updateUserPreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      return await userApi.updateUserPreferences(preferences);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Acción asíncrona para obtener historial de actividad
export const fetchUserActivityHistory = createAsyncThunk(
  'userProfile/fetchUserActivityHistory',
  async (params, { rejectWithValue }) => {
    try {
      return await userApi.getUserActivityHistory(params);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Acción asíncrona para actualizar imagen de perfil
export const updateProfileImage = createAsyncThunk(
  'userProfile/updateProfileImage',
  async (formData, { rejectWithValue }) => {
    try {
      return await userApi.updateProfileImage(formData);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Estado inicial
const initialState = {
  profile: null,
  preferences: null,
  activityHistory: [],
  loading: false,
  profileLoading: false,
  preferencesLoading: false,
  activityLoading: false,
  imageLoading: false,
  passwordLoading: false,
  error: null,
  profileUpdateSuccess: false,
  passwordChangeSuccess: false,
  preferencesUpdateSuccess: false,
  imageUpdateSuccess: false,
  activeTab: 0
};

// Slice
const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearProfileState: (state) => {
      state.error = null;
      state.profileUpdateSuccess = false;
      state.passwordChangeSuccess = false;
      state.preferencesUpdateSuccess = false;
      state.imageUpdateSuccess = false;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
        state.preferences = action.payload.preferences;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        // Asegurarse de que el error sea un string para facilitar el rendering
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : action.error?.message || 'Error al obtener el perfil de usuario';
      })
      
      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
        state.profileUpdateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
        state.profileUpdateSuccess = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : action.error?.message || 'Error al actualizar el perfil';
        state.profileUpdateSuccess = false;
      })
      
      // changePassword
      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.error = null;
        state.passwordChangeSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false;
        state.passwordChangeSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : action.error?.message || 'Error al cambiar la contraseña';
        state.passwordChangeSuccess = false;
      })
      
      // updateUserPreferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.preferencesLoading = true;
        state.error = null;
        state.preferencesUpdateSuccess = false;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload;
        state.preferencesUpdateSuccess = true;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : action.error?.message || 'Error al actualizar preferencias';
        state.preferencesUpdateSuccess = false;
      })
      
      // fetchUserActivityHistory
      .addCase(fetchUserActivityHistory.pending, (state) => {
        state.activityLoading = true;
        state.error = null;
      })
      .addCase(fetchUserActivityHistory.fulfilled, (state, action) => {
        state.activityLoading = false;
        state.activityHistory = action.payload;
      })
      .addCase(fetchUserActivityHistory.rejected, (state, action) => {
        state.activityLoading = false;
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : action.error?.message || 'Error al obtener historial de actividad';
      })
      
      // updateProfileImage
      .addCase(updateProfileImage.pending, (state) => {
        state.imageLoading = true;
        state.error = null;
        state.imageUpdateSuccess = false;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        state.imageLoading = false;
        if (state.profile) {
          state.profile.avatarUrl = action.payload.avatarUrl;
        }
        state.imageUpdateSuccess = true;
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.imageLoading = false;
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : action.error?.message || 'Error al actualizar imagen de perfil';
        state.imageUpdateSuccess = false;
      });
  }
});

export const { clearProfileState, setActiveTab } = userProfileSlice.actions;

export default userProfileSlice.reducer;