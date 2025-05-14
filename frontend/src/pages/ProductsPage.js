import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Paper,
  Grid,
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

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['products', pagination.page, pagination.limit, filters],
    () => getProducts({ ...filters, ...pagination }),
    {
      keepPreviousData: true,
    }
  );

  // Mutación para realizar operaciones masivas
  const bulkMutation = useMutation(
    ({ id, data }) => updateProduct(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        enqueueSnackbar('Operación realizada con éxito', { variant: 'success' });
      },
      onError: (error) => {
        enqueueSnackbar(
          `Error al realizar la operación: ${error.response?.data?.detail || error.message}`,
          { variant: 'error' }
        );
      },
    }
  );

  // Manejar el filtrado de productos
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 }); // Volver a la primera página al filtrar
  };

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  // Manejar cambio de límite por página
  const handleLimitChange = (newLimit) => {
    setPagination({ page: 1, limit: newLimit });
  };

  // Manejar operaciones masivas
  const handleBulkAction = async (action, selectedIds) => {
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
  };

  // Función para crear un nuevo producto
  const handleCreateProduct = () => {
    navigate('/products/new');
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar productos: {error.message}
      </Alert>
    );
  }

  const totalProducts = data?.length || 0;

  return (
    <Box>
      {/* Encabezado y breadcrumbs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
        >
          Nuevo Producto
        </Button>
      </Box>

      {/* Filtros */}
      <ProductFilters onFilter={handleFilter} />

      {/* Tabla de productos */}
      {isLoading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
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
      )}
    </Box>
  );
};

export default ProductsPage;