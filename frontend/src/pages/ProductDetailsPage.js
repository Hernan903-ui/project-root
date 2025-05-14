import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import { getProductById, updateProduct } from '../api/productApi';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Cargar datos del producto
  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery(['product', id], () => getProductById(id));

  // Mutación para cambiar el estado del producto
  const toggleStatus = useMutation(
    (is_active) => updateProduct(id, { is_active }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['product', id]);
        queryClient.invalidateQueries('products');
        enqueueSnackbar(
          `Producto ${product.is_active ? 'desactivado' : 'activado'} correctamente`,
          { variant: 'success' }
        );
      },
      onError: (error) => {
        enqueueSnackbar(
          `Error al cambiar el estado: ${error.response?.data?.detail || error.message}`,
          { variant: 'error' }
        );
      },
    }
  );

  const handleToggleStatus = () => {
    toggleStatus.mutate(!product.is_active);
  };

  const handleEdit = () => {
    navigate(`/products/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/products');
  };

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar el producto: {error.message}
      </Alert>
    );
  }

  const getStockStatus = () => {
    if (product.stock_quantity <= 0) {
      return { label: 'Sin Stock', color: 'error' };
    }
    if (product.stock_quantity <= product.min_stock_level) {
      return { label: 'Bajo', color: 'warning' };
    }
    return { label: 'Disponible', color: 'success' };
  };

  const stockStatus = getStockStatus();

  return (
    <Box>
      {/* Encabezado y breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Detalles del Producto
        </Typography>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Link color="inherit" href="/products">
            Productos
          </Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Acciones */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Volver
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Editar
        </Button>
        <Button 
          variant="outlined" 
          color={product.is_active ? "error" : "primary"}
          startIcon={product.is_active ? <DeleteIcon /> : <RestoreIcon />}
          onClick={handleToggleStatus}
        >
          {product.is_active ? 'Desactivar' : 'Activar'}
        </Button>
      </Box>

      {/* Detalles del producto */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Información básica */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {product.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={product.is_active ? 'Activo' : 'Inactivo'} 
                color={product.is_active ? 'success' : 'default'} 
              />
              <Chip 
                label={stockStatus.label} 
                color={stockStatus.color} 
              />
              <Chip 
                label={`SKU: ${product.sku}`} 
                variant="outlined" 
              />
              {product.barcode && (
                <Chip 
                  label={`Barcode: ${product.barcode}`} 
                  variant="outlined" 
                />
              )}
            </Box>
            <Typography variant="body1" paragraph>
              {product.description || "Sin descripción"}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Información de precios */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Precios
              </Typography>
              <Typography variant="h6" color="primary">
                ${product.price.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Costo: ${product.cost_price.toFixed(2)}
              </Typography>
              {product.tax_rate > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Impuesto: {product.tax_rate}%
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Información de inventario */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Inventario
              </Typography>
              <Typography variant="h6">
                {product.stock_quantity} unidades
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nivel mínimo: {product.min_stock_level} unidades
              </Typography>
            </Box>
          </Grid>

          {/* Información de categoría */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Categoría
              </Typography>
              <Typography variant="h6">
                {product.category.name}
              </Typography>
              {product.category.description && (
                <Typography variant="body2" color="text.secondary">
                  {product.category.description}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Fechas */}
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Creado: {new Date(product.created_at).toLocaleString()}
            </Typography>
            {product.updated_at && (
              <Typography variant="body2" color="text.secondary">
                Última actualización: {new Date(product.updated_at).toLocaleString()}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProductDetailsPage;