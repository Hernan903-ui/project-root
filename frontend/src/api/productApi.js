import axios from '../api/axios';

/**
 * Obtiene una lista de productos con filtros opcionales
 * @param {Object} params Parámetros de filtrado y paginación
 * @returns {Promise} Datos de productos paginados
 */
export const getProducts = async (params = {}) => {
  try {
    // Extraer parámetros con valores por defecto
    const { 
      search = '', 
      category_id = null, 
      is_active = null,
      page = 1, 
      limit = 20 
    } = params;
    
    // Calcular el valor de skip para paginación
    const skip = (page - 1) * limit;
    
    // Construir objeto de parámetros para la solicitud
    const queryParams = { skip, limit };
    
    // Añadir solo parámetros con valor definido (no vacíos o nulos)
    if (search) queryParams.search = search;
    if (category_id) queryParams.category_id = category_id;
    
    // Importante: is_active debe ser un booleano, no una cadena vacía
    // Solo lo incluimos si tiene un valor explícito true o false
    if (is_active === true || is_active === false) {
      queryParams.is_active = is_active;
    }
    
    // Usar el sistema de parámetros de Axios en lugar de concatenar manualmente
    const response = await axios.get('/products', { params: queryParams });
    return response.data;
  } catch (error) {
    // Mejorar el manejo de errores con información más detallada
    console.error('Error al obtener productos:', error);
    
    // Si hay un mensaje específico del servidor, lo capturamos
    if (error.response?.data?.detail) {
      const details = Array.isArray(error.response.data.detail) 
        ? error.response.data.detail[0].msg 
        : error.response.data.detail;
      
      throw new Error(`Error en la consulta: ${details}`);
    }
    
    // Si no hay mensaje específico, lanzamos el error general
    throw error;
  }
};

/**
 * Obtiene un producto por su ID
 * @param {string|number} id ID del producto
 * @returns {Promise} Datos del producto
 */
export const getProductById = async (id) => {
  try {
    if (!id) throw new Error('ID de producto no proporcionado');
    
    const response = await axios.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el producto ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo producto
 * @param {Object} productData Datos del producto a crear
 * @returns {Promise} Producto creado
 */
export const createProduct = async (productData) => {
  try {
    if (!productData) throw new Error('Datos de producto no proporcionados');
    
    const response = await axios.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    
    // Capturar errores de validación
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.detail || 
                               'Error de validación en los datos del producto';
      throw new Error(validationErrors);
    }
    
    throw error;
  }
};

/**
 * Actualiza un producto existente
 * @param {string|number} id ID del producto a actualizar
 * @param {Object} productData Datos actualizados del producto
 * @returns {Promise} Producto actualizado
 */
export const updateProduct = async (id, productData) => {
  try {
    if (!id) throw new Error('ID de producto no proporcionado');
    if (!productData) throw new Error('Datos de producto no proporcionados');
    
    const response = await axios.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el producto ${id}:`, error);
    
    // Capturar errores de validación
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.detail || 
                               'Error de validación en los datos del producto';
      throw new Error(validationErrors);
    }
    
    throw error;
  }
};

/**
 * Elimina un producto
 * @param {string|number} id ID del producto a eliminar
 * @returns {Promise} Confirmación de eliminación
 */
export const deleteProduct = async (id) => {
  try {
    if (!id) throw new Error('ID de producto no proporcionado');
    
    const response = await axios.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el producto ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene todas las categorías
 * @returns {Promise} Lista de categorías
 */
export const getCategories = async () => {
  try {
    const response = await axios.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

/**
 * Crea una nueva categoría
 * @param {Object} categoryData Datos de la categoría a crear
 * @returns {Promise} Categoría creada
 */
export const createCategory = async (categoryData) => {
  try {
    if (!categoryData) throw new Error('Datos de categoría no proporcionados');
    
    const response = await axios.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    
    // Capturar errores de validación
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.detail || 
                               'Error de validación en los datos de la categoría';
      throw new Error(validationErrors);
    }
    
    throw error;
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory
};