import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userApi from '../../api/userApi';

// Acción asíncrona para obtener el perfil de usuario
export const fetchUserProfile = createAsyncThunk(
  'userProfile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await userApi.getUserProfile();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener el perfil de usuario');
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
      return rejectWithValue(error.response?.data || 'Error al actualizar el perfil');
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
      return rejectWithValue(error.response?.data || 'Error al cambiar la contraseña');
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
      return rejectWithValue(error.response?.data || 'Error al actualizar preferencias');
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
      return rejectWithValue(error.response?.data || 'Error al obtener historial de actividad');
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
      return rejectWithValue(error.response?.data || 'Error al actualizar imagen de perfil');
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
        state.imageUpdateSuccess = false;
      });
  }
});

export const { clearProfileState, setActiveTab } = userProfileSlice.actions;

export default userProfileSlice.reducer;