import axios from 'axios';

// Estado global de conexión
let isOfflineMode = false;
let lastConnectionAttempt = 0;
const RETRY_INTERVAL = 60000; // 1 minuto entre intentos automáticos de reconexión

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000, // Timeout predeterminado
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para saber si estamos en modo offline
export const isInOfflineMode = () => isOfflineMode;

// Función para activar/desactivar el modo offline
export const setOfflineMode = (status) => {
  isOfflineMode = status;
  // Puedes disparar eventos o actualizar el estado global aquí
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('connection-status-change', { detail: { isOffline: status } }));
  }
};

// Interceptor para verificar si estamos en modo offline antes de hacer solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    const currentTime = Date.now();
    
    // Si estamos en modo offline y no ha pasado el intervalo de reintento, abortar
    if (isOfflineMode && currentTime - lastConnectionAttempt < RETRY_INTERVAL) {
      // Crear un error personalizado que indica modo offline
      const error = new Error('Application is in offline mode');
      error.isOfflineError = true;
      error.config = config;
      
      // Rechazar la promesa con este error personalizado
      return Promise.reject(error);
    }
    
    // Si estamos en modo offline pero es momento de reintentar
    if (isOfflineMode) {
      lastConnectionAttempt = currentTime;
      console.log('Intentando reconexión automática...');
    }
    
    // Verificar si la ruta es parte del dashboard - no requiere autenticación 
    const isDashboardRoute = 
      config.url?.includes('/reports/sales') ||
      config.url?.includes('/reports/products') ||
      config.url?.includes('/reports/inventory/low-stock') ||
      config.url?.includes('/reports/inventory/value');
    
    // Solo añadir token si no es una ruta del dashboard
    if (!isDashboardRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => {
    // Si recibimos una respuesta exitosa, resetear el modo offline
    if (isOfflineMode) {
      setOfflineMode(false);
      console.log('Conexión restablecida, saliendo del modo offline');
    }
    return response;
  },
  (error) => {
    // Si es un error de timeout o red (no de servidor)
    if (error.code === 'ECONNABORTED' || !error.response || error.isOfflineError) {
      // Activar modo offline
      if (!isOfflineMode) {
        setOfflineMode(true);
        console.warn('Activando modo offline debido a problemas de conexión');
      }
    }
    // Manejar errores 401 (no autorizado)
    else if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Otros errores
    else {
      console.error(
        `Error ${error.response?.status}: ${error.response?.statusText}`,
        error.response?.data
      );
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;