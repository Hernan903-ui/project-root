import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import jwt_decode from 'jwt-decode';

// Verificar si hay un token almacenado al iniciar
const token = localStorage.getItem('token');
let initialUser = null;

if (token) {
  try {
    const decoded = jwt_decode(token);
    // Verificar si el token no ha expirado
    if (decoded.exp * 1000 > Date.now()) {
      initialUser = { id: decoded.sub };
    } else {
      localStorage.removeItem('token');
    }
  } catch (error) {
    localStorage.removeItem('token');
  }
}

const initialState = {
  user: initialUser,
  token: token || null,
  isAuthenticated: !!initialUser,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      // Formatear los datos como FormData para la API
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      // Decodificar el token para obtener el usuario
      const decoded = jwt_decode(access_token);
      
      return { 
        token: access_token, 
        user: { id: decoded.sub } 
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Error al iniciar sesión'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;