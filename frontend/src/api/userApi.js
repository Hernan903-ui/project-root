import axiosInstance from './axios';

// Función auxiliar para extraer mensajes de error de manera consistente
const extractErrorMessage = (error) => {
  console.group('🔍 Análisis detallado del error:');
  
  // Si el error tiene una respuesta de la API
  if (error.response) {
    console.log('📊 Respuesta del servidor:', {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    });
    
    // Manejar error 422 (Unprocessable Content) específicamente
    if (error.response.status === 422) {
      // Fastapi suele devolver errores de validación en este formato
      if (error.response.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Si es un array de errores, tomar el primero
          const msg = error.response.data.detail[0]?.msg || 'Error de validación';
          console.log('⚠️ Error de validación:', msg);
          console.groupEnd();
          return msg;
        }
        console.log('⚠️ Error de validación:', error.response.data.detail);
        console.groupEnd();
        return error.response.data.detail;
      }
    }
    
    // Manejar error 401 (No autorizado)
    if (error.response.status === 401) {
      console.log('🔒 Error de autenticación: sesión expirada');
      console.groupEnd();
      return 'Su sesión ha expirado. Por favor inicie sesión nuevamente.';
    }
    
    // Verificar diferentes posibles ubicaciones del mensaje de error
    const errorMsg = error.response.data?.message || 
           error.response.data?.detail || 
           error.response.data?.error || 
           `Error ${error.response.status}: ${error.response.statusText}`;
    
    console.log('❌ Mensaje de error extraído:', errorMsg);
    console.groupEnd();
    return errorMsg;
  }
  
  // Si es un error de timeout u otro error de red
  if (error.request) {
    console.log('🌐 Error de red - no se recibió respuesta:', {
      url: error.config?.url,
      method: error.config?.method,
      timeout: error.config?.timeout
    });
    console.groupEnd();
    return 'No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo.';
  }
  
  // Para otros tipos de errores
  console.log('⚠️ Error general:', error.message);
  console.groupEnd();
  return error.message || 'Ha ocurrido un error desconocido';
};

// Función para generar datos mockup en caso de fallo
const getFallbackProfile = () => {
  return {
    id: 1,
    firstName: 'Usuario',
    lastName: 'Demo',
    email: 'usuario@ejemplo.com',
    phone: '555-123-4567',
    position: 'Desarrollador',
    department: 'IT',
    bio: 'Perfil de demostración cuando no se puede conectar al servidor',
    avatarUrl: `https://ui-avatars.com/api/?name=Usuario+Demo&size=200&background=random`,
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'es'
    }
  };
};

/**
 * Registra un nuevo usuario desde la página pública de registro
 * @param {Object} userData - Datos del usuario {email, password, full_name, username}
 * @returns {Promise} Información del usuario registrado
 */
export const register = async (userData) => {
  console.group('🔐 Iniciando registro de usuario');
  console.log('📤 Datos recibidos:', { ...userData, password: '***OCULTO***' });
  
  try {
    // Verificar y adaptar los datos para asegurar que tengan el formato correcto
    const adaptedUserData = { ...userData };
    
    // Si no se proporciona un nombre de usuario, generarlo a partir del email
    if (!adaptedUserData.username && adaptedUserData.email) {
      adaptedUserData.username = adaptedUserData.email.split('@')[0];
      console.log('🤖 Generando nombre de usuario automáticamente:', adaptedUserData.username);
    }
    
    // Verificar que todos los campos requeridos estén presentes
    const requiredFields = ['email', 'password', 'full_name', 'username'];
    const missingFields = requiredFields.filter(field => !adaptedUserData[field]);
    
    if (missingFields.length > 0) {
      const errorMsg = `Faltan campos obligatorios: ${missingFields.join(', ')}`;
      console.error('❌ ' + errorMsg);
      console.groupEnd();
      throw errorMsg;
    }
    
    console.log('📤 Datos adaptados:', { 
      ...adaptedUserData, 
      password: '***OCULTO***' 
    });
    
    // Asignar un timeout largo para desarrollo
    const config = {
      timeout: 15000 // 15 segundos para dar tiempo en desarrollo
    };
    
    console.log('🔄 Enviando solicitud a /auth/register...');
    const response = await axiosInstance.post('/auth/register', adaptedUserData, config);
    
    console.log('✅ Registro exitoso:', response.data);
    console.groupEnd();
    return response.data;
  } catch (error) {
    console.error("❌ Error en registro de usuario:", error);
    
    // Intentar reconexión en caso de error de red
    if (!error.response) {
      console.log('🔄 Intentando verificar estado del servidor...');
      try {
        // Verificar si el servidor está disponible con un endpoint simple
        await axiosInstance.get('/health', { timeout: 5000 });
        console.log('🌐 Servidor disponible, pero hubo un problema con el registro');
      } catch (healthCheckError) {
        console.error('🌐 Servidor no disponible:', healthCheckError.message);
      }
    }
    
    // Manejo específico para error de usuario ya existente
    if (error.response?.status === 409) {
      const errorMsg = 'Ya existe un usuario con este correo electrónico o nombre de usuario';
      console.error('⚠️ ' + errorMsg);
      console.groupEnd();
      throw errorMsg;
    }
    
    // Errores de validación en los datos de registro
    if (error.response?.status === 422) {
      const details = error.response.data?.detail;
      if (Array.isArray(details) && details.length > 0) {
        // Mapea los errores de validación para mostrarlos de manera amigable
        const fieldErrors = details.map(err => {
          const field = err.loc[err.loc.length - 1];
          // Traducir nombres de campos comunes para mejor UX
          const fieldMap = {
            'email': 'Correo electrónico',
            'password': 'Contraseña',
            'full_name': 'Nombre completo',
            'username': 'Nombre de usuario'
          };
          const fieldName = fieldMap[field] || field;
          return `${fieldName}: ${err.msg}`;
        }).join(', ');
        
        const errorMsg = `Por favor corrija los siguientes errores: ${fieldErrors}`;
        console.error('⚠️ ' + errorMsg);
        console.groupEnd();
        throw errorMsg;
      }
    }
    
    // Si el error ya es un string (como los que lanzamos nosotros mismos)
    if (typeof error === 'string') {
      console.groupEnd();
      throw error;
    }
    
    const errorMsg = extractErrorMessage(error);
    console.groupEnd();
    throw errorMsg;
  }
};

// ========== API DE PERFIL DE USUARIO (EXISTENTE) ==========

// Obtener perfil del usuario actual
export const getUserProfile = async (useFallback = true) => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch (error) {
    console.log("Error detallado:", error.response?.data);
    
    // Si es un error crítico y se permite fallback, devolver datos de prueba
    if (useFallback && (error.response?.status === 500 || !error.response)) {
      console.warn("Usando perfil de respaldo debido a error del servidor");
      return getFallbackProfile();
    }
    
    // Manejar específicamente el error 422
    if (error.response?.status === 422) {
      const detail = error.response.data.detail;
      
      // Si detail es un array (común en errores de validación de FastAPI)
      if (Array.isArray(detail) && detail.length > 0) {
        throw detail[0].msg || "Error de validación en la solicitud";
      }
      
      // Si detail es un string u otro formato
      throw typeof detail === 'string' ? detail : "Error de validación en la solicitud";
    }
    
    // Para otros errores
    throw extractErrorMessage(error);
  }
};

// Actualizar perfil de usuario
export const updateUserProfile = async (userData) => {
  try {
    const response = await axiosInstance.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    throw extractErrorMessage(error);
  }
};

// Cambiar contraseña
export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.post('/users/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    throw extractErrorMessage(error);
  }
};

// Actualizar preferencias del usuario
export const updateUserPreferences = async (preferences) => {
  try {
    const response = await axiosInstance.put('/users/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error("Error actualizando preferencias:", error);
    throw extractErrorMessage(error);
  }
};

// Obtener historial de actividad del usuario
export const getUserActivityHistory = async (params) => {
  try {
    const response = await axiosInstance.get('/users/activity', { params });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo historial de actividad:", error);
    
    // Si el endpoint no existe pero necesitamos mostrar algo
    if (error.response?.status === 404) {
      return { activities: [] }; // Devolver array vacío para evitar errores en la UI
    }
    
    throw extractErrorMessage(error);
  }
};

// Actualizar avatar o imagen de perfil
export const updateProfileImage = async (formData) => {
  try {
    const response = await axiosInstance.post('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error actualizando imagen de perfil:", error);
    throw extractErrorMessage(error);
  }
};

// ========== API DE GESTIÓN DE USUARIOS (NUEVO) ==========

/**
 * Obtiene una lista de usuarios con filtros opcionales
 * @param {Object} params - Parámetros de filtrado como {skip, limit, search, role, etc}
 * @returns {Promise} Lista de usuarios
 */
export const getUsers = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/users/', { params });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    throw extractErrorMessage(error);
  }
};

/**
 * Obtiene un usuario específico por su ID
 * @param {number|string} id - ID del usuario
 * @returns {Promise} Datos del usuario
 */
export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo usuario ${id}:`, error);
    throw extractErrorMessage(error);
  }
};

/**
 * Crea un nuevo usuario
 * @param {Object} userData - Datos del usuario {email, password, full_name, role, etc}
 * @returns {Promise} Usuario creado
 */
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/users/', userData);
    return response.data;
  } catch (error) {
    console.error("Error creando usuario:", error);
    throw extractErrorMessage(error);
  }
};

/**
 * Actualiza un usuario existente
 * @param {number|string} id - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise} Usuario actualizado
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error actualizando usuario ${id}:`, error);
    throw extractErrorMessage(error);
  }
};

/**
 * Elimina un usuario
 * @param {number|string} id - ID del usuario a eliminar
 * @returns {Promise}
 */
export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error eliminando usuario ${id}:`, error);
    throw extractErrorMessage(error);
  }
};

/**
 * Actualiza el estado de activación de un usuario
 * @param {number|string} id - ID del usuario
 * @param {boolean} isActive - Estado de activación
 * @returns {Promise} Usuario actualizado
 */
export const setUserStatus = async (id, isActive) => {
  try {
    const response = await axiosInstance.patch(`/users/${id}/status`, { is_active: isActive });
    return response.data;
  } catch (error) {
    console.error(`Error actualizando estado de usuario ${id}:`, error);
    throw extractErrorMessage(error);
  }
};

/**
 * Asigna un rol a un usuario
 * @param {number|string} userId - ID del usuario
 * @param {number|string} roleId - ID del rol
 * @returns {Promise}
 */
export const assignUserRole = async (userId, roleId) => {
  try {
    const response = await axiosInstance.post(`/users/${userId}/roles`, { role_id: roleId });
    return response.data;
  } catch (error) {
    console.error(`Error asignando rol ${roleId} a usuario ${userId}:`, error);
    throw extractErrorMessage(error);
  }
};

// NUEVO: Verificar si el servidor está activo (para diagnóstico)
export const checkServerStatus = async () => {
  try {
    const response = await axiosInstance.get('/health', { timeout: 5000 });
    return {
      online: true,
      details: response.data
    };
  } catch (error) {
    console.error("Error verificando estado del servidor:", error);
    return {
      online: false,
      error: extractErrorMessage(error)
    };
  }
};

// NUEVO: Diagnóstico de registro
export const diagnoseRegistration = async (email) => {
  try {
    // Verificar si el servidor está disponible
    const serverStatus = await checkServerStatus();
    if (!serverStatus.online) {
      return {
        status: 'offline',
        message: 'El servidor no está disponible en este momento'
      };
    }
    
    // Verificar si el email ya está registrado
    const checkData = { email };
    try {
      const response = await axiosInstance.post('/auth/check-email', checkData);
      return {
        status: 'available',
        message: 'El email está disponible para registro'
      };
    } catch (error) {
      if (error.response?.status === 409) {
        return {
          status: 'exists',
          message: 'El email ya está registrado en el sistema'
        };
      }
      return {
        status: 'error',
        message: 'No se pudo verificar la disponibilidad del email'
      };
    }
  } catch (error) {
    console.error("Error en diagnóstico de registro:", error);
    return {
      status: 'error',
      message: 'Error realizando diagnóstico de registro'
    };
  }
};

// Exportamos tanto individualmente (para import nombrado) como objeto completo
export default {
  // Registro público
  register,
  
  // Diagnóstico
  checkServerStatus,
  diagnoseRegistration,
  
  // Perfil
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateUserPreferences,
  getUserActivityHistory,
  updateProfileImage,
  
  // Gestión de usuarios
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  setUserStatus,
  assignUserRole
};