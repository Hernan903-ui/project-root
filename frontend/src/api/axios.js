import axios from 'axios';

// Estado global de conexión
let isOfflineMode = false;
let lastConnectionAttempt = 0;
const RETRY_INTERVAL = process.env.NODE_ENV === 'development' ? 10000 : 60000; // 10s en dev, 1min en prod
let connectionCheckTimer = null;

// URLs configurables - ASEGURAMOS QUE NO HAYA DOBLE SLASH AL FINAL Y CONFIGURACIÓN CORRECTA
const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
const cleanApiBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
const baseURL = cleanApiBase.endsWith('/api') ? cleanApiBase : `${cleanApiBase}/api`;
const healthCheckURL = process.env.REACT_APP_HEALTH_URL || `${cleanApiBase}/health`;

console.log('🔧 Configuración API:', { 
  API_BASE,
  cleanApiBase,
  baseURL, 
  healthCheckURL, 
  env: process.env.NODE_ENV 
});

const axiosInstance = axios.create({
  baseURL,
  timeout: process.env.NODE_ENV === 'development' ? 30000 : 15000, // Timeout extendido en desarrollo
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para saber si estamos en modo offline
export const isInOfflineMode = () => isOfflineMode;

// Función para verificar proactivamente la conexión con el servidor
export const checkServerConnection = async () => {
  try {
    console.log('🔍 Verificando conexión con el servidor...');
    // Usamos fetch en lugar de axios para evitar interceptores
    const response = await fetch(healthCheckURL, { 
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      // Usar try-catch para AbortController por compatibilidad
      signal: (() => {
        try {
          return AbortController ? new AbortController().signal : null;
        } catch (e) {
          return null;
        }
      })()
    });
    
    const isConnected = response.ok;
    
    if (isConnected && isOfflineMode) {
      console.log('✅ Conexión restaurada con el servidor');
      setOfflineMode(false);
      return true;
    } else if (!isConnected && !isOfflineMode) {
      console.warn('❌ No se pudo conectar con el servidor');
      setOfflineMode(true);
      return false;
    }
    
    return isConnected;
  } catch (error) {
    console.error('❌ Error verificando conexión:', error.message);
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
  console.log(`🌐 Modo offline: ${status ? 'ACTIVADO' : 'DESACTIVADO'}`);
  
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
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('connection-status-change', { 
      detail: { isOffline: status } 
    }));
  }
};

// Función para depurar URL completa
export const getFullUrl = (url, params = {}) => {
  // Asegurarse de que la URL no tiene prefijo /api/ duplicado
  const cleanUrl = url.startsWith('/api/') ? url.replace(/^\/api\//, '/') : url;
  // Construir URL completa con parámetros para depuración
  const urlWithoutBase = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  const fullUrl = `${baseURL}${urlWithoutBase}`;
  
  // Añadir query params si existen
  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    return `${fullUrl}?${queryString}`;
  }
  
  return fullUrl;
};

// Verificar conexión al iniciar la aplicación
if (typeof window !== 'undefined') {
  // Ejecutar inmediatamente
  checkServerConnection();
  
  // Escuchar eventos de conexión del navegador
  window.addEventListener('online', () => {
    console.log('🌐 Navegador en línea, verificando conexión con el servidor...');
    checkServerConnection();
  });
  
  window.addEventListener('offline', () => {
    console.log('🌐 Navegador sin conexión');
    setOfflineMode(true);
  });
}

// Interceptor para verificar si estamos en modo offline antes de hacer solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    // Asegurarse de que la URL no contenga doble /api/api/
    if (config.url && config.url.startsWith('/api/')) {
      console.warn('⚠️ Detectada URL con doble /api/, corrigiendo...');
      config.url = config.url.replace(/^\/api\//, '/');
    }
    
    // Log detallado en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = getFullUrl(config.url || '', config.params || {});
      console.log(`📤 Solicitando: ${config.method?.toUpperCase()} ${config.url}`, 
                 config.params || config.data || '');
      console.log(`URL completa: ${fullUrl}`);
    }
    
    const currentTime = Date.now();
    
    // Si estamos en modo offline, intentar una verificación proactiva
    if (isOfflineMode) {
      // Si no ha pasado el intervalo de reintento, abortar
      if (currentTime - lastConnectionAttempt < RETRY_INTERVAL) {
        const error = new Error('Application is in offline mode');
        error.isOfflineError = true;
        error.config = config;
        return Promise.reject(error);
      }
      
      // Actualizar timestamp del último intento
      lastConnectionAttempt = currentTime;
      console.log('🔄 Intentando reconexión antes de solicitud...');
      
      // Intentar reconectar primero (no bloqueamos la solicitud actual)
      checkServerConnection();
    }
    
    // Lógica para añadir el token de autenticación
    const isAuthRoute = config.url?.includes('/auth/login') || 
                       config.url?.includes('/auth/register') ||
                       config.url?.includes('/auth/reset-password');
    
    // Añadir token a todas las rutas excepto autenticación inicial
    if (!isAuthRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (!config.url?.includes('/health') && !config.url?.includes('/public/')) {
        // Si no hay token y no es una ruta pública, podría ser un problema
        console.warn('⚠️ Solicitud a ruta protegida sin token:', config.url);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Error en configuración de solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => {
    // Log detallado en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Respuesta de ${response.config.url}: `, 
                 response.status, response.data ? 'Datos recibidos' : '');
    }
    
    // Si recibimos una respuesta exitosa, resetear el modo offline
    if (isOfflineMode) {
      setOfflineMode(false);
    }
    return response;
  },
  async (error) => {
    // Detalles exhaustivos del error en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.group('❌ Error de axios:');
      console.error('Mensaje:', error.message);
      console.error('URL:', error.config?.url);
      console.error('Método:', error.config?.method);
      if (error.response) {
        console.error('Estado:', error.response.status);
        console.error('Datos:', error.response.data);
      } else {
        console.error('Sin respuesta del servidor (posible problema de red)');
      }
      console.groupEnd();
    }
    
    // Manejo especial para errores 404 (No encontrado)
    if (error.response?.status === 404) {
      // Para rutas de API, podríamos intentar buscar rutas alternativas
      if (error.config?.url?.includes('/suppliers')) {
        console.warn('⚠️ Ruta de proveedores no encontrada, verificando configuración del servidor');
        
        // Si la URL está duplicada con /api/api/, intentar corregirla para futuros intentos
        if (error.config.url.startsWith('/api/')) {
          console.error('⚠️ Detectada URL con prefijo /api/ duplicado. Comprueba todas las rutas en supplierApi.js');
        }
        
        // Sugerir rutas alternativas para suppliers (en caso de que el backend use otra nomenclatura)
        console.info('💡 Rutas alternativas a considerar: /proveedores, /provider, /vendors');
      }
    }
    
    // Si es un error de timeout, red o el servidor no responde
    if (
      error.code === 'ECONNABORTED' || 
      error.message.includes('timeout') ||
      error.message.includes('Network Error') ||
      !error.response || 
      error.isOfflineError
    ) {
      // Activar modo offline
      if (!isOfflineMode) {
        setOfflineMode(true);
      }
    }
    // Mejorar manejo de errores 401 (no autorizado)
    else if (error.response?.status === 401) {
      console.warn('⚠️ Sesión expirada o no autorizada');
      
      // Verificar si es error por token expirado y tenemos un refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      const originalRequest = error.config;
      
      // Si hay refresh token y no hemos intentado refrescar ya
      if (refreshToken && !originalRequest._retry && error.response.data?.detail === "Token has expired") {
        originalRequest._retry = true;
        
        try {
          // Intentar obtener un nuevo token
          const response = await axiosInstance.post('/auth/refresh', {
            refresh_token: refreshToken
          });
          
          // Actualizar token en localStorage
          if (response.data?.access_token) {
            localStorage.setItem('token', response.data.access_token);
            
            // Actualizar token en la solicitud original y reintentarla
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Error al refrescar token:', refreshError);
          // Si falla el refresh, eliminar tokens y redirigir a login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      } else {
        // Si no hay refresh token o el intento de refresh falló, limpiar y redirigir
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      
      // Redirigir a login si no estamos ya allí
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Función para reintentar una solicitud fallida con backoff exponencial
export const retryRequest = async (failedRequest, maxRetries = 3) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Esperar con backoff exponencial: 2s, 4s, 8s...
      const waitTime = 2000 * Math.pow(2, retries);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      console.log(`🔄 Reintentando solicitud (${retries + 1}/${maxRetries}): ${failedRequest.url}`);
      
      // Comprobar conexión antes de reintentar
      const isConnected = await checkServerConnection();
      if (!isConnected) {
        throw new Error('Servidor no disponible');
      }
      
      // Asegurarse de que la URL no tenga prefijo duplicado
      if (failedRequest.url && failedRequest.url.startsWith('/api/')) {
        console.warn('⚠️ Corrigiendo URL con doble /api/ antes de reintentar');
        failedRequest.url = failedRequest.url.replace(/^\/api\//, '/');
      }
      
      return await axiosInstance(failedRequest);
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        console.error(`❌ Máximo de reintentos alcanzado para: ${failedRequest.url}`);
        throw error;
      }
    }
  }
};

// Utilidad para manejar errores comunes en componentes
export const handleApiError = (error, setErrorState) => {
  let errorMessage = 'Error desconocido. Por favor, inténtelo de nuevo.';
  
  if (error.isOfflineError) {
    errorMessage = 'No hay conexión con el servidor. Compruebe su conexión a internet.';
  } else if (error.response) {
    // Error con respuesta del servidor
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        errorMessage = data.detail || 'Datos incorrectos. Verifique la información e intente de nuevo.';
        break;
      case 401:
        errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
        break;
      case 403:
        errorMessage = 'No tiene permisos para realizar esta acción.';
        break;
      case 404:
        errorMessage = 'El recurso solicitado no existe.';
        break;
      case 500:
        errorMessage = 'Error interno del servidor. Por favor, inténtelo más tarde.';
        break;
      default:
        errorMessage = `Error (${status}): ${data.detail || 'Por favor, inténtelo de nuevo.'}`;
    }
  } else if (error.request) {
    // La solicitud se realizó pero no se recibió respuesta
    errorMessage = 'No se recibió respuesta del servidor. Por favor, inténtelo más tarde.';
  } else {
    // Error al configurar la solicitud
    errorMessage = error.message || 'Error al realizar la solicitud.';
  }
  
  // Si se proporcionó una función para establecer el estado de error, usarla
  if (typeof setErrorState === 'function') {
    setErrorState(errorMessage);
  }
  
  // Siempre registrar el error en consola
  console.error('Error en solicitud API:', errorMessage, error);
  
  return errorMessage;
};

// Exponer una función para probar la conexión explícitamente
export const testApiConnection = async () => {
  try {
    console.log('🧪 Prueba de conexión API iniciada...');
    // Intentar un endpoint básico que debería estar disponible
    const response = await axiosInstance.get('/health', { 
      timeout: 5000,
      headers: { 'Cache-Control': 'no-cache' }
    });
    console.log('✅ Prueba de conexión exitosa:', response.status);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.error('❌ Prueba de conexión fallida:', error.message);
    return { 
      success: false, 
      error: error.message,
      isOffline: !error.response,
      status: error.response?.status || 0
    };
  }
};

export default axiosInstance;