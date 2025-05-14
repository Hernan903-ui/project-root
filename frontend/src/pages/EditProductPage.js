import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import ProductForm from '../components/products/ProductForm';
import { getProductById, updateProduct } from '../api/productApi';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Cargar datos del producto
  const { 
    data: product, 
    isLoading, 
    error: fetchError 
  } = useQuery(['product', id], () => getProductById(id), {
    onError: (error) => {
      enqueueSnackbar(
        `Error al cargar el producto: ${error.response?.data?.detail || error.message}`,
        { variant: 'error' }
      );
    },
  });

  // Configurar mutación para actualizar producto
  const { mutate, isLoading: isUpdating, error: updateError } = useMutation(
    (data) => updateProduct(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['product', id]);
        queryClient.invalidateQueries('products');
        enqueueSnackbar('Producto actualizado con éxito', { variant: 'success' });
        navigate('/products');
      },
      onError: (error) => {
        enqueueSnackbar(
          `Error al actualizar el producto: ${error.response?.data?.detail || error.message}`,
          { variant: 'error' }
        );
      },
    }
  );

  const handleSubmit = (data) => {
    mutate(data);
  };

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si hay un error al cargar los datos, mostrar mensaje
  if (fetchError) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Error al cargar el producto
        </Typography>
        <Alert severity="error">
          {fetchError.response?.data?.detail || fetchError.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Encabezado y breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Editar Producto
        </Typography>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Link color="inherit" href="/products">
            Productos
          </Link>
          <Typography color="text.primary">Editar {product?.name}</Typography>
        </Breadcrumbs>
      </Box>

      {updateError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {updateError.response?.data?.detail || updateError.message}
        </Alert>
      )}

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
        title={`Editar Producto: ${product?.name}`}
      />
    </Box>
  );
};

export default EditProductPage;