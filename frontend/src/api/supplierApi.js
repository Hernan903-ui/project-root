import client from "./axios"

// Endpoints base
const SUPPLIERS_ENDPOINT = "/suppliers"
const PURCHASE_ORDERS_ENDPOINT = "/purchase-orders/"

/**
 * Función para construir parámetros de consulta
 * @param {Object} params - Parámetros de consulta
 * @returns {string} - String de parámetros de consulta
 */
const buildQueryParams = (params = {}) => {
  // Filtrar parámetros vacíos
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})

  // Si no hay parámetros, devolver string vacío
  if (Object.keys(filteredParams).length === 0) {
    return ""
  }

  // Construir string de parámetros
  const queryString = new URLSearchParams(filteredParams).toString()
  return `?${queryString}`
}

/**
 * Obtener lista de proveedores
 * @param {Object} params - Parámetros de consulta (page, limit, search, status, etc.)
 * @returns {Promise} - Promesa con la respuesta
 */
export const fetchSuppliers = async (params = {}) => {
  try {
    const queryParams = buildQueryParams(params)
    const response = await client.get(`${SUPPLIERS_ENDPOINT}${queryParams}`)
    return response
  } catch (error) {
    console.error("Error al obtener proveedores:", error)
    throw error
  }
}

/**
 * Obtener proveedor por ID
 * @param {number|string} id - ID del proveedor
 * @returns {Promise} - Promesa con la respuesta
 */
export const fetchSupplierById = async (id) => {
  try {
    const response = await client.get(`${SUPPLIERS_ENDPOINT}/${id}`)
    return response
  } catch (error) {
    console.error(`Error al obtener proveedor ${id}:`, error)
    throw error
  }
}

/**
 * Crear nuevo proveedor
 * @param {Object} supplierData - Datos del proveedor
 * @returns {Promise} - Promesa con la respuesta
 */
export const createSupplier = async (supplierData) => {
  try {
    const response = await client.post(SUPPLIERS_ENDPOINT, supplierData)
    return response
  } catch (error) {
    console.error("Error al crear proveedor:", error)
    throw error
  }
}

/**
 * Actualizar proveedor existente
 * @param {number|string} id - ID del proveedor
 * @param {Object} supplierData - Datos del proveedor
 * @returns {Promise} - Promesa con la respuesta
 */
export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await client.put(`${SUPPLIERS_ENDPOINT}/${id}`, supplierData)
    return response
  } catch (error) {
    console.error(`Error al actualizar proveedor ${id}:`, error)
    throw error
  }
}

/**
 * Eliminar proveedor
 * @param {number|string} id - ID del proveedor
 * @returns {Promise} - Promesa con la respuesta
 */
export const deleteSupplier = async (id) => {
  try {
    const response = await client.delete(`${SUPPLIERS_ENDPOINT}/${id}`)
    return response
  } catch (error) {
    console.error(`Error al eliminar proveedor ${id}:`, error)
    throw error
  }
}

/**
 * Obtener lista de órdenes de compra
 * @param {Object} params - Parámetros de consulta (page, limit, search, status, etc.)
 * @returns {Promise} - Promesa con la respuesta
 */
export const fetchPurchaseOrders = async (params = {}) => {
  try {
    const queryParams = buildQueryParams(params)
    const response = await client.get(`${PURCHASE_ORDERS_ENDPOINT}${queryParams}`)
    return response
  } catch (error) {
    console.error("Error al obtener órdenes de compra:", error)
    throw error
  }
}

/**
 * Obtener orden de compra por ID
 * @param {number|string} id - ID de la orden de compra
 * @returns {Promise} - Promesa con la respuesta
 */
export const fetchPurchaseOrderById = async (id) => {
  try {
    const response = await client.get(`${PURCHASE_ORDERS_ENDPOINT}/${id}`)
    return response
  } catch (error) {
    console.error(`Error al obtener orden de compra ${id}:`, error)
    throw error
  }
}

/**
 * Crear nueva orden de compra
 * @param {Object} orderData - Datos de la orden de compra
 * @returns {Promise} - Promesa con la respuesta
 */
export const createPurchaseOrder = async (orderData) => {
  try {
    const response = await client.post(PURCHASE_ORDERS_ENDPOINT, orderData)
    return response
  } catch (error) {
    console.error("Error al crear orden de compra:", error)
    throw error
  }
}

/**
 * Actualizar orden de compra existente
 * @param {number|string} id - ID de la orden de compra
 * @param {Object} orderData - Datos de la orden de compra
 * @returns {Promise} - Promesa con la respuesta
 */
export const updatePurchaseOrder = async (id, orderData) => {
  try {
    const response = await client.put(`${PURCHASE_ORDERS_ENDPOINT}/${id}`, orderData)
    return response
  } catch (error) {
    console.error(`Error al actualizar orden de compra ${id}:`, error)
    throw error
  }
}

/**
 * Eliminar orden de compra
 * @param {number|string} id - ID de la orden de compra
 * @returns {Promise} - Promesa con la respuesta
 */
export const deletePurchaseOrder = async (id) => {
  try {
    const response = await client.delete(`${PURCHASE_ORDERS_ENDPOINT}/${id}`)
    return response
  } catch (error) {
    console.error(`Error al eliminar orden de compra ${id}:`, error)
    throw error
  }
}

/**
 * Recibir inventario para una orden de compra
 * @param {number|string} orderId - ID de la orden de compra
 * @param {Object} receivedItems - Datos de los items recibidos
 * @returns {Promise} - Promesa con la respuesta
 */
export const receiveInventory = async (orderId, receivedItems) => {
  try {
    const response = await client.post(`${PURCHASE_ORDERS_ENDPOINT}/${orderId}/receive`, receivedItems)
    return response
  } catch (error) {
    console.error(`Error al recibir inventario para orden ${orderId}:`, error)
    throw error
  }
}

/**
 * Obtener órdenes de compra por proveedor
 * @param {number|string} supplierId - ID del proveedor
 * @param {Object} params - Parámetros de consulta (page, limit, status, etc.)
 * @returns {Promise} - Promesa con la respuesta
 */
export const fetchPurchaseOrdersBySupplier = async (supplierId, params = {}) => {
  try {
    const queryParams = buildQueryParams(params)
  const response = await client.get(`${SUPPLIERS_ENDPOINT}/${supplierId}/purchase-orders/${queryParams}`)
    return response
  } catch (error) {
    console.error(`Error al obtener órdenes de compra para proveedor ${supplierId}:`, error)
    throw error
  }
}
