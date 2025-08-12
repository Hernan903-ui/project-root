import axios from 'axios';

// Estado global de conexión
let isOfflineMode = false;
const RETRY_INTERVAL = process.env.NODE_ENV === 'development' ? 10000 : 60000; // 10s en dev, 1min en prod
let connectionCheckTimer = null;

// URLs configurables - ASEGURAMOS QUE NO HAYA DOBLE SLASH AL FINAL Y CONFIGURACIÓN CORRECTA
const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
const cleanApiBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
const baseURL = cleanApiBase.endsWith('/api') ? cleanApiBase : `${cleanApiBase}/api`;
const healthCheckURL = process.env.REACT_APP_HEALTH_URL || `${cleanApiBase}/health`;

if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Configuración API:', { 
    API_BASE,
    cleanApiBase,
    baseURL, 
    healthCheckURL, 
    env: process.env.NODE_ENV 
  });
}

const axiosInstance = axios.create({
  baseURL,
  timeout: process.env.NODE_ENV === 'development' ? 30000 : 15000, // Timeout extendido en desarrollo
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adjuntar el token JWT si existe
axiosInstance.interceptors.request.use(
  (config) => {
  const token = localStorage.getItem('token'); // Unificado con authSlice.js
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Si el error es 401 (no autorizado), fuerza logout y dispara evento
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      window.dispatchEvent(new CustomEvent('forceLogout'));
      if (process.env.NODE_ENV === 'development') {
        console.warn('No autorizado, redirigiendo a login...');
      }
    }
    // Si el error es por desconexión, activa modo offline
    if (error.code === 'ECONNABORTED' || !error.response) {
      setOfflineMode(true);
      if (process.env.NODE_ENV === 'development') {
        console.warn('❌ Se ha activado el modo offline por error de conexión.');
      }
    }
    return Promise.reject(error);
  }
);

// Función para saber si estamos en modo offline
export const isInOfflineMode = () => isOfflineMode;

// Función para verificar proactivamente la conexión con el servidor
export const checkServerConnection = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Verificando conexión con el servidor...');
    }
    // Usamos fetch en lugar de axios para evitar interceptores
    let signal;
    try {
      signal = window.AbortController ? new window.AbortController().signal : undefined;
    } catch (e) {
      signal = undefined;
    }

    const response = await fetch(healthCheckURL, { 
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      signal
    });
    
    const isConnected = response.ok;
    
    if (isConnected && isOfflineMode) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Conexión restaurada con el servidor');
      }
      setOfflineMode(false);
      return true;
    } else if (!isConnected && !isOfflineMode) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('❌ No se pudo conectar con el servidor');
      }
      setOfflineMode(true);
      return false;
    }
    
    return isConnected;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error verificando conexión:', error.message);
    }
    if (!isOfflineMode) {
      setOfflineMode(true);
    }
    return false;
  }
};

// Función para activar/desactivar el modo offline
export const setOfflineMode = (status) => {
  if (status === isOfflineMode) return; // Evitar actualizaciones innecesarias
  
  isOfflineMode = status;
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 Modo offline: ${status ? 'ACTIVADO' : 'DESACTIVADO'}`);
  }
  
  // Limpiar el timer existente si hay uno
  if (connectionCheckTimer) {
    clearInterval(connectionCheckTimer);
    connectionCheckTimer = null;
  }
  
  // Si estamos offline, iniciar verificaciones periódicas
  if (status) {
    connectionCheckTimer = setInterval(checkServerConnection, RETRY_INTERVAL);
  }

  // Disparar evento para que los componentes puedan reaccionar
  window.dispatchEvent(new CustomEvent('offlineModeChange', { detail: { isOffline: status } }));
};

export default axiosInstance;