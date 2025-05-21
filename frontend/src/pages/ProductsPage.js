import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import ProductTable from '../components/products/ProductTable';
import ProductFilters from '../components/products/ProductFilters';
import { getProducts, updateProduct } from '../api/productApi';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    is_active: '',
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });

  // Optimizado con useQuery v5
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', pagination.page, pagination.limit, filters],
    queryFn: () => getProducts({ ...filters, ...pagination }),
    keepPreviousData: true, // Esta propiedad se mantiene en v5 para retrocompatibilidad
    staleTime: 60000, // 1 minuto antes de considerar los datos obsoletos
  });

  // Mutación para realizar operaciones masivas
  const bulkMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      enqueueSnackbar('Operación realizada con éxito', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(
        `Error al realizar la operación: ${error.response?.data?.detail || error.message}`,
        { variant: 'error' }
      );
    },
  });

  // Manejar el filtrado de productos - optimizado con useCallback
  const handleFilter = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Volver a la primera página al filtrar
  }, []);

  // Manejar cambio de página - optimizado con useCallback
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Manejar cambio de límite por página - optimizado con useCallback
  const handleLimitChange = useCallback((newLimit) => {
    setPagination({ page: 1, limit: newLimit });
  }, []);

  // Manejar operaciones masivas - optimizado con useCallback
  const handleBulkAction = useCallback(async (action, selectedIds) => {
    if (!selectedIds.length) return;

    const isActive = action === 'activate';

    try {
      // Realizar operaciones en paralelo
      await Promise.all(
        selectedIds.map(id =>
          bulkMutation.mutateAsync({ id, data: { is_active: isActive } })
        )
      );
    } catch (error) {
      console.error('Error en operación masiva:', error);
    }
  }, [bulkMutation]);

  // Función para crear un nuevo producto - optimizado con useCallback
  const handleCreateProduct = useCallback(() => {
    navigate('/products/new');
  }, [navigate]);

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mt: 2 }}
        variant="filled"
      >
        Error al cargar productos: {typeof error === 'object' ? error.message : error}
      </Alert>
    );
  }

  const totalProducts = data?.length || 0;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado y breadcrumbs */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: 2,
        mb: 3 
      }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Productos
          </Typography>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link color="inherit" href="/dashboard">
              Dashboard
            </Link>
            <Typography color="text.primary">Productos</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateProduct}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}
        >
          Nuevo Producto
        </Button>
      </Box>

      {/* Filtros */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
        }}
      >
        <ProductFilters onFilter={handleFilter} />
      </Paper>

      {/* Tabla de productos */}
      {isLoading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper 
          elevation={1} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <ProductTable
            products={data || []}
            isLoading={isLoading}
            totalCount={totalProducts}
            page={pagination.page}
            limit={pagination.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onBulkAction={handleBulkAction}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ProductsPage;