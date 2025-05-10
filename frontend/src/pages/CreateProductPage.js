import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';

import ProductForm from '../components/products/ProductForm';
import { createProduct } from '../api/productApi';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation(createProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      enqueueSnackbar('Producto creado con éxito', { variant: 'success' });
      navigate('/products');
    },
    onError: (error) => {
      enqueueSnackbar(
        `Error al crear el producto: ${error.response?.data?.detail || error.message}`,
        { variant: 'error' }
      );
    },
  });

  const handleSubmit = (data) => {
    mutate(data);
  };

  return (
    <Box>
      {/* Encabezado y breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Crear Nuevo Producto
        </Typography>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Link color="inherit" href="/products">
            Productos
          </Link>
          <Typography color="text.primary">Crear</Typography>
        </Breadcrumbs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.response?.data?.detail || error.message}
        </Alert>
      )}

      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={isLoading}
        title="Crear Nuevo Producto"
      />
    </Box>
  );
};

export default CreateProductPage;