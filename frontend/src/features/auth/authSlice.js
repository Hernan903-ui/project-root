import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';
import { register as apiRegister } from '../../api/userApi'; // Importamos la función de registro desde userApi

// Verificar si hay un token almacenado al iniciar
const token = localStorage.getItem('token');
const refreshToken = localStorage.getItem('refreshToken');
let initialUser = null;

if (token) {
  try {
    const decoded = jwtDecode(token);
    // Verificar si el token no ha expirado
    if (decoded.exp * 1000 > Date.now()) {
      // Extraer más información del usuario del token si está disponible
      initialUser = { 
        id: decoded.sub,
        email: decoded.email || null,
        role: decoded.role || 'user',
        // Otros campos que puedan venir en el token
      };
    } else {
      console.log('Token expirado, intentando usar refresh token...');
      // No eliminamos el token aquí, lo haremos después de intentar refrescar
    }
  } catch (error) {
    console.error('Error al decodificar token:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}

const initialState = {
  user: initialUser,
  token: token || null,
  refreshToken: refreshToken || null,
  isAuthenticated: !!initialUser,
  isLoading: false,
  error: null,
  registrationSuccess: false
};

// Acción para registro de usuario
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('🔐 authSlice: Iniciando registro de usuario', { ...userData, password: '***OCULTO***' });
      
      // Usamos la función de API especializada que ya tiene mejor manejo de errores
      const response = await apiRegister(userData);
      console.log('✅ Registro exitoso en authSlice:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en authSlice.registerUser:', error);
      
      // Si el error ya es un string (como los que devuelve nuestra función apiRegister)
      if (typeof error === 'string') {
        return rejectWithValue(error);
      }
      
      // Para otros tipos de errores, extraemos el mensaje
      if (error.response) {
        // Error con respuesta del servidor
        const errorMessage = error.response.data?.detail || 
                             error.response.data?.message || 
                             `Error ${error.response.status}: ${error.response.statusText}`;
        return rejectWithValue(errorMessage);
      } else if (error.request) {
        // Error de red (sin respuesta)
        return rejectWithValue('No se pudo conectar con el servidor. Verifique su conexión.');
      } else {
        // Otro tipo de error
        return rejectWithValue(error.message || 'Error al registrar usuario. Inténtelo más tarde.');
      }
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      console.log('🔑 Iniciando proceso de login para:', username);
      
      // Formatear los datos como FormData para la API
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      // Extraemos tanto el token de acceso como el de refresco si está disponible
      const { access_token, refresh_token } = response.data;
      
      if (!access_token) {
        return rejectWithValue('El servidor no proporcionó un token de acceso válido');
      }
      
      // Guardamos ambos tokens
      localStorage.setItem('token', access_token);
      if (refresh_token) {
        localStorage.setItem('refreshToken', refresh_token);
      }

      // Decodificar el token para obtener datos del usuario
      const decoded = jwtDecode(access_token);
      
      console.log('✅ Login exitoso, token guardado');
      return { 
        token: access_token, 
        refreshToken: refresh_token || null,
        user: { 
          id: decoded.sub,
          email: decoded.email || username, // Asumimos que username es el email
          role: decoded.role || 'user',
          // Otros datos que puedan venir en el token
        } 
      };
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // Manejo específico para cada tipo de error
      if (error.response) {
        if (error.response.status === 401) {
          return rejectWithValue('Credenciales incorrectas. Verifique su email y contraseña.');
        }
        return rejectWithValue(
          error.response.data?.detail || 'Error al iniciar sesión'
        );
      } else if (error.request) {
        // Error de red (sin respuesta)
        return rejectWithValue('No se pudo conectar con el servidor. Verifique su conexión.');
      } else {
        return rejectWithValue('Error al iniciar sesión. Inténtelo más tarde.');
      }
    }
  }
);

// Nueva acción para refrescar token
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    const { refreshToken } = getState().auth;
    
    if (!refreshToken) {
      return rejectWithValue('No hay refresh token disponible');
    }
    
    try {
      console.log('🔄 Intentando refrescar token de acceso...');
      
      const response = await axios.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      
      const { access_token, refresh_token } = response.data;
      
      if (!access_token) {
        throw new Error('El servidor no proporcionó un token válido');
      }
      
      // Actualizar tokens en localStorage
      localStorage.setItem('token', access_token);
      if (refresh_token) {
        localStorage.setItem('refreshToken', refresh_token);
      }
      
      // Decodificar para obtener info de usuario
      const decoded = jwtDecode(access_token);
      
      console.log('✅ Token refrescado exitosamente');
      return {
        token: access_token,
        refreshToken: refresh_token || refreshToken, // Mantener el actual si no hay uno nuevo
        user: { 
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role || 'user',
        }
      };
    } catch (error) {
      console.error('❌ Error al refrescar token:', error);
      
      // Limpiar tokens inválidos
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      return rejectWithValue('Sesión expirada. Por favor inicie sesión nuevamente.');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  console.log('🚪 Cerrando sesión, eliminando tokens');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  return null;
});

// Verificar estado del token con soporte para refresh
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { getState, dispatch }) => {
    const { token, refreshToken } = getState().auth;
    
    if (!token) return false;
    
    try {
      // Verificar si el token es válido decodificándolo
      const decoded = jwtDecode(token);
      
      // Margen de seguridad: refrescar si queda menos de 5 minutos
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const timeRemaining = expirationTime - currentTime;
      const FIVE_MINUTES = 5 * 60 * 1000;
      
      // Si el token ha expirado o está por expirar pronto
      if (timeRemaining <= FIVE_MINUTES) {
        console.log(`🕒 Token ${timeRemaining <= 0 ? 'expirado' : 'próximo a expirar'}`);
        
        // Si hay refresh token, intentar renovar
        if (refreshToken) {
          try {
            await dispatch(refreshAccessToken());
            return true; // Si refrescamos exitosamente
          } catch (refreshError) {
            console.error('❌ Error al refrescar token en verificación:', refreshError);
            await dispatch(logout());
            return false;
          }
        } else {
          // Sin refresh token, hacemos logout
          await dispatch(logout());
          return false;
        }
      }
      
      return true; // Token válido y no próximo a expirar
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      await dispatch(logout());
      return false;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    resetRegistrationState(state) {
      state.registrationSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error al iniciar sesión';
      })
      
      // Casos para logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isLoading = false;
        state.error = null;
      })
      
      // Casos para registro
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.registrationSuccess = true;
        state.error = null;
        // No establecemos token ni usuario ya que el registro no inicia sesión automáticamente
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error desconocido durante el registro';
        state.registrationSuccess = false;
      })
      
      // Casos para refrescar token
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.error = action.payload || 'Error al refrescar la sesión';
      })
      
      // Verificación de estado de autenticación
      .addCase(checkAuthStatus.pending, (state) => {
        // No cambiamos el estado loading aquí para evitar flashes de UI
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload;
        if (!action.payload) {
          state.token = null;
          state.refreshToken = null;
          state.user = null;
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
      });
  },
});

export const { clearError, resetRegistrationState } = authSlice.actions;

export default authSlice.reducer;