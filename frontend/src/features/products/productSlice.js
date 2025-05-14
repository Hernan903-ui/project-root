import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productApi from '../../api/productApi';

// Thunks para operaciones asíncronas
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await productApi.getProducts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productApi.getProductById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await productApi.createProduct(productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await productApi.updateProduct(id, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await productApi.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductCategories = createAsyncThunk(
  'products/fetchProductCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productApi.getCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Para la carga de imágenes, ya que no existe un endpoint específico,
// usamos updateProduct como alternativa
export const uploadProductImage = createAsyncThunk(
  'products/uploadProductImage',
  async ({ id, imageFile }, { rejectWithValue }) => {
    try {
      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // En un entorno real, esta sería una API específica para subir imágenes
      // Aquí usamos updateProduct y simulamos una respuesta
      const response = await productApi.updateProduct(id, formData);
      
      // Si no hay imagen en la respuesta, simulamos una
      if (!response.data.imageUrl) {
        // Crea una URL temporal para la vista previa (solo para la demo)
        const tempUrl = URL.createObjectURL(imageFile);
        return {
          id,
          imageUrl: tempUrl
        };
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice con reducers adaptados
const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    currentProduct: null,
    categories: [],
    loading: false,
    error: null,
    totalProducts: 0,
    uploadProgress: 0
  },
  reducers: {
    clearCurrentProduct(state) {
      state.currentProduct = null;
    },
    clearErrors(state) {
      state.error = null;
    },
    setUploadProgress(state, action) {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress(state) {
      state.uploadProgress = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Manejo de fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.products = action.payload;
          state.totalProducts = action.payload.length;
        } else if (action.payload && typeof action.payload === 'object') {
          state.products = action.payload.items || action.payload;
          state.totalProducts = action.payload.total || (action.payload.items ? action.payload.items.length : 0);
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar productos';
      })

      // Manejo de fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar el producto';
      })

      // Manejo de createProduct
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
        state.totalProducts += 1;
        state.currentProduct = action.payload;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al crear el producto';
      })

      // Manejo de updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.currentProduct = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al actualizar el producto';
      })

      // Manejo de deleteProduct
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(product => product.id !== action.payload);
        state.totalProducts -= 1;
        if (state.currentProduct && state.currentProduct.id === action.payload) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al eliminar el producto';
      })

      // Manejo de fetchProductCategories
      .addCase(fetchProductCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchProductCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar categorías';
      })

      // Manejo de uploadProductImage
      .addCase(uploadProductImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        state.loading = false;
        // Si hay una imagenUrl en la respuesta
        if (action.payload && action.payload.imageUrl) {
          // Actualiza el producto actual si coincide
          if (state.currentProduct && state.currentProduct.id === action.payload.id) {
            state.currentProduct.imageUrl = action.payload.imageUrl;
          }
          
          // Actualiza el producto en la lista
          const index = state.products.findIndex(product => product.id === action.payload.id);
          if (index !== -1) {
            state.products[index].imageUrl = action.payload.imageUrl;
          }
        }
        state.uploadProgress = 0;
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al subir la imagen';
        state.uploadProgress = 0;
      });
  },
});

export const { 
  clearCurrentProduct, 
  clearErrors, 
  setUploadProgress, 
  resetUploadProgress 
} = productSlice.actions;

export default productSlice.reducer;